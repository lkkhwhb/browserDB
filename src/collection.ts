/**
 * BrowserDB
 * A lightweight, dependency-free, MongoDB-inspired document database
 * built on top of the browser's localStorage.
 *
 * Copyright (c) 2026–present Bhargav Barman
 *
 * Licensed under the MIT License.
 * You may obtain a copy of the License at:
 *
 * https://opensource.org/licenses/MIT
 *
 */

import { DatabaseError, DuplicateKeyError, ValidationError } from "./errors";
import { Query } from "./query";
import { Storage } from "./storage";
import { Document, Filter as TFilter, FindOptions, InsertOptions, JSONSchema, SubscriptionCallback, Update, ValidatorDef, WithId } from "./types";
import { uuid } from "./utils/uuid";
import { deepEqual } from "./utils/deepEqual";

export class Collection<T extends Document> {
    private storage: Storage<WithId<T>>;
    private readonly collectionName: string;
    private listeners: Set<{ filter: TFilter<T>; options?: FindOptions<T>; callback: SubscriptionCallback<T> }> = new Set();

    private validator?: ValidatorDef;
    private mutex: Promise<void> = Promise.resolve();
    private hooks = {
        beforeInsert: [] as ((doc: T) => T | Promise<T>)[],
        afterInsert: [] as ((doc: WithId<T>) => void | Promise<void>)[],
        beforeUpdate: [] as ((doc: WithId<T>) => WithId<T> | Promise<WithId<T>>)[],
        afterUpdate: [] as ((doc: WithId<T>) => void | Promise<void>)[],
        beforeDelete: [] as ((doc: WithId<T>) => void | Promise<void>)[],
        afterDelete: [] as ((doc: WithId<T>) => void | Promise<void>)[],
    };

    private idIndex = new Map<string, number>();
    private indexedDataRef: WithId<T>[] | null = null;

    constructor(name: string, prefix = "browserdb_") {
        this.collectionName = name;
        this.storage = new Storage<WithId<T>>(`${prefix}${name}`, name);
        this.storage.setOnExternalChange(() => {
            this.notifyListeners();
        });
    }

    subscribe(filter: TFilter<T> = {}, callback: SubscriptionCallback<T>, options?: FindOptions<T>): () => void {
        const listener = { filter, options, callback };
        this.listeners.add(listener);
        this.find(filter, options).then(callback).catch(console.error);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notifyListeners() {
        if (this.storage.isBatching) return;
        this.getValidData(false).then(data => {
            for (const listener of this.listeners) {
                const results = this.filterData(data, listener.filter);
                listener.callback(this.clone(this.applyFindOptions(results, listener.options)));
            }
        }).catch(console.error);
    }

    private filterData(data: WithId<T>[], filter: TFilter<T>): WithId<T>[] {
        return data.filter(doc => Query.matches(doc, filter));
    }

    private buildIndex(data: WithId<T>[]) {
        if (this.indexedDataRef === data) return;
        this.idIndex.clear();
        for (let i = 0; i < data.length; i++) {
            this.idIndex.set(data[i]._id, i);
        }
        this.indexedDataRef = data;
    }

    private findTargetIndex(data: WithId<T>[], filter: TFilter<T>): number {
        this.buildIndex(data);
        if (Object.keys(filter).length === 1 && filter._id !== undefined && typeof filter._id === "string") {
            const idx = this.idIndex.get(filter._id);
            if (idx !== undefined && idx >= 0 && idx < data.length && data[idx]._id === filter._id) {
                return idx;
            }
        }
        return data.findIndex(doc => Query.matches(doc, filter));
    }

    beginBatch() {
        this.storage.beginBatch();
    }

    async commitBatch() {
        if (await this.storage.commitBatch()) {
            this.notifyListeners();
        }
    }

    rollbackBatch() {
        this.storage.rollbackBatch();
    }

    private clone<U>(item: U): U {
        if (typeof structuredClone === "function") {
            try {
                return structuredClone(item);
            } catch {
                // Fallback if item contains non-cloneable properties
            }
        }
        return JSON.parse(JSON.stringify(item));
    }

    private async getValidData(triggerCleanup = true): Promise<WithId<T>[]> {
        const data = await this.storage.read();
        const now = Date.now();
        let hasExpired = false;

        const validData = data.filter(doc => {
            if (doc.__expiresAt && doc.__expiresAt < now) {
                hasExpired = true;
                return false;
            }
            return true;
        });

        if (hasExpired && triggerCleanup) {
            this.runLocked(async () => {
                await this.storage.write(validData);
            }).catch(() => {});
        }

        return validData;
    }

    private applyFindOptions(data: WithId<T>[], options?: FindOptions<T>): WithId<T>[] {
        if (!options) return data;
        let result = data;

        if (options.sort) {
            const sortKeys = Object.keys(options.sort) as (keyof T)[];
            result = result.sort((a, b) => {
                for (const key of sortKeys) {
                    const dir = options.sort![key] as number;
                    if (a[key] < b[key]) return -1 * dir;
                    if (a[key] > b[key]) return 1 * dir;
                }
                return 0;
            });
        }

        if (options.skip !== undefined || options.limit !== undefined) {
            const skip = options.skip || 0;
            const limit = options.limit !== undefined ? options.limit : result.length;
            result = result.slice(skip, skip + limit);
        }

        if (options.projection && Object.keys(options.projection).length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const proj = options.projection as any;
            const keys = Object.keys(proj) as (keyof T)[];
            const isInclusive = keys.some(k => proj[k] === 1);
            
            result = result.map(doc => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const newDoc: any = { _id: doc._id };
                if (isInclusive) {
                    for (const key of keys) {
                        if (proj[key] === 1 && key in doc) {
                            newDoc[key] = doc[key];
                        }
                    }
                } else {
                    Object.assign(newDoc, doc);
                    for (const key of keys) {
                        if (proj[key] === 0) {
                            delete newDoc[key];
                        }
                    }
                }
                return newDoc;
            });
        }

        return result;
    }

    private runLocked<R>(task: () => Promise<R>): Promise<R> {
        const next = this.mutex.then(task, task);
        this.mutex = next.catch(() => {}) as Promise<void>;
        return next;
    }

    setValidator(validator: ValidatorDef) {
        this.validator = validator;
    }

    beforeInsert(fn: (doc: T) => T | Promise<T>) { this.hooks.beforeInsert.push(fn); return () => { this.hooks.beforeInsert = this.hooks.beforeInsert.filter(h => h !== fn); }; }
    afterInsert(fn: (doc: WithId<T>) => void | Promise<void>) { this.hooks.afterInsert.push(fn); return () => { this.hooks.afterInsert = this.hooks.afterInsert.filter(h => h !== fn); }; }
    beforeUpdate(fn: (doc: WithId<T>) => WithId<T> | Promise<WithId<T>>) { this.hooks.beforeUpdate.push(fn); return () => { this.hooks.beforeUpdate = this.hooks.beforeUpdate.filter(h => h !== fn); }; }
    afterUpdate(fn: (doc: WithId<T>) => void | Promise<void>) { this.hooks.afterUpdate.push(fn); return () => { this.hooks.afterUpdate = this.hooks.afterUpdate.filter(h => h !== fn); }; }
    beforeDelete(fn: (doc: WithId<T>) => void | Promise<void>) { this.hooks.beforeDelete.push(fn); return () => { this.hooks.beforeDelete = this.hooks.beforeDelete.filter(h => h !== fn); }; }
    afterDelete(fn: (doc: WithId<T>) => void | Promise<void>) { this.hooks.afterDelete.push(fn); return () => { this.hooks.afterDelete = this.hooks.afterDelete.filter(h => h !== fn); }; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private validateSchema(doc: any) {
        if (!this.validator || !this.validator.$jsonSchema) return;
        this.evaluateJSONSchema(doc, this.validator.$jsonSchema, "root");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private evaluateJSONSchema(value: any, schema: JSONSchema, path: string) {
        if (typeof value === "object" && !Array.isArray(value) && value !== null) {
            if (schema.required) {
                for (const req of schema.required) {
                    if (value[req] === undefined || value[req] === null) {
                        throw new ValidationError(`Field '${path === "root" ? req : path + "." + req}' is required`);
                    }
                }
            }
        }

        if (value === undefined || value === null) return;

        const typeDef = schema.bsonType || schema.type;
        if (typeDef) {
            const types = Array.isArray(typeDef) ? typeDef : [typeDef];
            const valType = Array.isArray(value) ? "array" : (value === null ? "null" : typeof value);
            const match = types.some(t => {
                if (t === "number" || t === "double" || t === "int") return valType === "number" && !Number.isNaN(value);
                if (t === "bool") return valType === "boolean";
                return valType === t;
            });
            if (!match) throw new ValidationError(`Field '${path}' must be one of [${types.join(", ")}], got ${valType}`);
        }

        if (schema.enum && !schema.enum.includes(value)) {
            throw new ValidationError(`Field '${path}' must be one of [${schema.enum.join(", ")}]`);
        }

        if (typeof value === "number") {
            if (schema.minimum !== undefined && value < schema.minimum) {
                throw new ValidationError(`Field '${path}' must be >= ${schema.minimum}`);
            }
            if (schema.maximum !== undefined && value > schema.maximum) {
                throw new ValidationError(`Field '${path}' must be <= ${schema.maximum}`);
            }
        }

        if (Array.isArray(value) && schema.items) {
            const itemsSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
            for (let i = 0; i < value.length; i++) {
                this.evaluateJSONSchema(value[i], itemsSchema, `${path}[${i}]`);
            }
        }

        if (typeof value === "object" && !Array.isArray(value) && schema.properties) {
            for (const key in value) {
                if (schema.properties[key]) {
                    this.evaluateJSONSchema(value[key], schema.properties[key], path === "root" ? key : `${path}.${key}`);
                }
            }
        }
    }

    /**
     * Inserts a document into the collection.
     * Throws DuplicateKeyError if the user-provided _id already exists.
     */
    async insertOne(document: T, options?: InsertOptions): Promise<WithId<T>> {
        return this.runLocked(async () => {
            const data = await this.getValidData(false);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let cloned = this.clone(document) as any;

            for (const hook of this.hooks.beforeInsert) {
                cloned = await hook(cloned);
            }

            this.validateSchema(cloned);

            if (cloned._id !== undefined && typeof cloned._id !== "string") {
                throw new DatabaseError("Provided _id must be a string");
            }
            const newId = typeof cloned._id === "string" ? cloned._id : uuid();

            if (data.some(doc => doc._id === newId)) {
                throw new DuplicateKeyError(newId, this.collectionName);
            }

            const newDoc = { ...cloned, _id: newId } as WithId<T>;
            
            if (options?.ttlMs) {
                newDoc.__expiresAt = Date.now() + options.ttlMs;
            }

            data.push(newDoc);
            await this.storage.write(data);
            this.notifyListeners();

            for (const hook of this.hooks.afterInsert) {
                await hook(newDoc);
            }

            return newDoc;
        });
    }

    /**
     * Inserts multiple documents into the collection.
     * Throws DuplicateKeyError if any user-provided _id already exists or duplicates within the batch.
     */
    async insertMany(documents: T[], options?: InsertOptions): Promise<WithId<T>[]> {
        return this.runLocked(async () => {
            const data = await this.getValidData(false);
            const newDocs: WithId<T>[] = [];
            const seenIds = new Set<string>();
            const now = Date.now();

            for (const doc of documents) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let cloned = this.clone(doc) as any;
                
                for (const hook of this.hooks.beforeInsert) {
                    cloned = await hook(cloned);
                }
                this.validateSchema(cloned);

                if (cloned._id !== undefined && typeof cloned._id !== "string") {
                    throw new DatabaseError("Provided _id must be a string");
                }
                const newId = typeof cloned._id === "string" ? cloned._id : uuid();

                if (seenIds.has(newId) || data.some(d => d._id === newId)) {
                    throw new DuplicateKeyError(newId, this.collectionName);
                }

                seenIds.add(newId);
                const newDoc = { ...cloned, _id: newId } as WithId<T>;
                if (options?.ttlMs) {
                    newDoc.__expiresAt = now + options.ttlMs;
                }
                newDocs.push(newDoc);
            }

            data.push(...newDocs);
            await this.storage.write(data);
            this.notifyListeners();

            for (const newDoc of newDocs) {
                for (const hook of this.hooks.afterInsert) {
                    await hook(newDoc);
                }
            }

            return newDocs;
        });
    }

    async find(filter: TFilter<T> = {}, options?: FindOptions<T>): Promise<WithId<T>[]> {
        const data = await this.getValidData(true);
        const filtered = data.filter(doc => Query.matches(doc, filter));
        return this.clone(this.applyFindOptions(filtered, options));
    }

    async findOne(filter: TFilter<T>, options?: FindOptions<T>): Promise<WithId<T> | null> {
        const data = await this.getValidData(true);
        const filtered = data.filter(doc => Query.matches(doc, filter));
        const processed = this.applyFindOptions(filtered, options);
        return processed.length > 0 ? this.clone(processed[0]) : null;
    }

    /**
     * Updates the first document that matches the filter.
     */
    async updateOne(filter: TFilter<T>, update: Update<T>): Promise<{ matched: boolean; modified: boolean }> {
        return this.runLocked(async () => {
            const data = await this.getValidData(false);
            const index = this.findTargetIndex(data, filter);

            if (index === -1) {
                return { matched: false, modified: false };
            }

            let modified = false;
            
            let workingDoc = this.clone(data[index]);
            for (const hook of this.hooks.beforeUpdate) {
                workingDoc = await hook(workingDoc);
            }
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const target = workingDoc as any; 

            if (update.$set) {
                for (const key in update.$set) {
                    if (key === "_id") continue;
                    if (target[key] !== update.$set[key as keyof T]) {
                        target[key] = update.$set[key as keyof T];
                        modified = true;
                    }
                }
            }

            if (update.$inc) {
                for (const key in update.$inc) {
                    if (key === "_id") continue;
                    if (target[key] !== undefined && typeof target[key] !== "number") {
                        throw new DatabaseError(`Cannot apply $inc to a non-numeric field: ${key}`);
                    }
                    if (typeof target[key] === "number") {
                        target[key] += update.$inc[key as keyof T] as number;
                    } else {
                        target[key] = update.$inc[key as keyof T];
                    }
                    modified = true;
                }
            }

            if (update.$unset) {
                for (const key in update.$unset) {
                    if (key === "_id") continue;
                    if (key in target) {
                        delete target[key];
                        modified = true;
                    }
                }
            }

            if (update.$push) {
                for (const key in update.$push) {
                    if (key === "_id") continue;
                    if (!Array.isArray(target[key])) {
                        target[key] = [];
                    }
                    target[key].push(update.$push[key as keyof T]);
                    modified = true;
                }
            }

            if (update.$pull) {
                for (const key in update.$pull) {
                    if (key === "_id") continue;
                    if (Array.isArray(target[key])) {
                        const pullVal = update.$pull[key as keyof T];
                        const originalLength = target[key].length;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        target[key] = target[key].filter((item: any) => {
                            if (typeof pullVal === "object" && pullVal !== null) {
                                 return !deepEqual(item, pullVal);
                            }
                            return item !== pullVal;
                        });
                        if (target[key].length !== originalLength) {
                            modified = true;
                        }
                    }
                }
            }

            if (modified) {
                this.validateSchema(workingDoc);
                data[index] = workingDoc;
                await this.storage.write(data);
                this.notifyListeners();
                for (const hook of this.hooks.afterUpdate) {
                    await hook(workingDoc);
                }
            }

            return { matched: true, modified };
        });
    }

    async replaceOne(filter: TFilter<T>, replacement: T): Promise<{ matched: boolean; modified: boolean }> {
        return this.runLocked(async () => {
            const data = await this.getValidData(false);
            const index = this.findTargetIndex(data, filter);

            if (index === -1) {
                return { matched: false, modified: false };
            }

            const originalId = data[index]._id;
            
            let workingDoc = { ...(this.clone(replacement) as Record<string, unknown>), _id: originalId } as WithId<T>;
            for (const hook of this.hooks.beforeUpdate) {
                workingDoc = await hook(workingDoc);
            }
            
            this.validateSchema(workingDoc);
            
            data[index] = workingDoc;
            await this.storage.write(data);
            this.notifyListeners();
            
            for (const hook of this.hooks.afterUpdate) {
                await hook(workingDoc);
            }
            
            return { matched: true, modified: true };
        });
    }

    /**
     * Deletes the first document that matches the filter.
     */
    async deleteOne(filter: TFilter<T>): Promise<{ deletedCount: number }> {
        return this.runLocked(async () => {
            const data = await this.getValidData(false);
            const index = this.findTargetIndex(data, filter);

            if (index === -1) {
                return { deletedCount: 0 };
            }

            const docToDelete = data[index];
            for (const hook of this.hooks.beforeDelete) {
                await hook(docToDelete);
            }

            data.splice(index, 1);
            await this.storage.write(data);
            this.notifyListeners();
            
            for (const hook of this.hooks.afterDelete) {
                await hook(docToDelete);
            }

            return { deletedCount: 1 };
        });
    }

    async count(): Promise<number> {
        const data = await this.getValidData(true);
        return data.length;
    }

    /**
     * Clears all documents from the collection.
     */
    async clear(): Promise<void> {
        return this.runLocked(async () => {
            await this.storage.clear();
            this.notifyListeners();
        });
    }
}
