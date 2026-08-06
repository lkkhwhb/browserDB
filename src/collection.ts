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

import { DuplicateKeyError } from "./errors";
import { Query } from "./query";
import { Storage } from "./storage";
import { Document, Filter as TFilter, InsertOptions, Update, WithId } from "./types";
import { uuid } from "./utils/uuid";

export class Collection<T extends Document> {
    private storage: Storage<WithId<T>>;
    private readonly collectionName: string;

    constructor(name: string, prefix: string) {
        this.collectionName = name;
        this.storage = new Storage<WithId<T>>(`${prefix}${name}`, name);
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
            this.storage.write(validData).catch(() => {});
        }

        return validData;
    }

    /**
     * Inserts a document into the collection.
     * Throws DuplicateKeyError if the user-provided _id already exists.
     */
    async insertOne(document: T, options?: InsertOptions): Promise<WithId<T>> {
        const data = await this.getValidData(false);
        const cloned = this.clone(document) as Record<string, unknown>;
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

        return newDoc;
    }

    /**
     * Inserts multiple documents into the collection.
     * Throws DuplicateKeyError if any user-provided _id already exists or duplicates within the batch.
     */
    async insertMany(documents: T[], options?: InsertOptions): Promise<WithId<T>[]> {
        const data = await this.getValidData(false);
        const newDocs: WithId<T>[] = [];
        const seenIds = new Set<string>();
        const now = Date.now();

        for (const doc of documents) {
            const cloned = this.clone(doc) as Record<string, unknown>;
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

        return newDocs;
    }

    async find(filter: TFilter<T> = {}): Promise<WithId<T>[]> {
        const data = await this.getValidData(true);
        return this.clone(data.filter(doc => Query.matches(doc, filter)));
    }

    async findOne(filter: TFilter<T>): Promise<WithId<T> | null> {
        const data = await this.getValidData(true);
        const result = data.find(doc => Query.matches(doc, filter));
        return result ? this.clone(result) : null;
    }

    async updateOne(filter: TFilter<T>, update: Update<T>): Promise<{ matched: boolean; modified: boolean }> {
        const data = await this.getValidData(false);
        const index = data.findIndex(doc => Query.matches(doc, filter));

        if (index === -1) {
            return { matched: false, modified: false };
        }

        if (update.$set) {
            const safeUpdate = { ...update.$set } as Record<string, unknown>;
            delete safeUpdate._id; // _id should be immutable

            data[index] = { ...data[index], ...safeUpdate } as WithId<T>;
            await this.storage.write(data);
            return { matched: true, modified: true };
        }

        return { matched: true, modified: false };
    }

    async deleteOne(filter: TFilter<T>): Promise<{ deletedCount: number }> {
        const data = await this.getValidData(false);
        const index = data.findIndex(doc => Query.matches(doc, filter));

        if (index === -1) {
            return { deletedCount: 0 };
        }

        data.splice(index, 1);
        await this.storage.write(data);

        return { deletedCount: 1 };
    }

    async count(): Promise<number> {
        const data = await this.getValidData(true);
        return data.length;
    }

    async clear(): Promise<void> {
        await this.storage.clear();
    }
}
