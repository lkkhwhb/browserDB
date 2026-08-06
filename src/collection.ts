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
import { Document, Filter, Update, WithId } from "./types";
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

    /**
     * Inserts a document into the collection.
     * Throws DuplicateKeyError if the user-provided _id already exists.
     */
    insertOne(document: T): WithId<T> {
        const data = this.storage.read();
        const cloned = this.clone(document) as Record<string, unknown>;
        const newId = typeof cloned._id === "string" ? cloned._id : uuid();

        if (data.some(doc => doc._id === newId)) {
            throw new DuplicateKeyError(newId, this.collectionName);
        }

        const newDoc = { ...cloned, _id: newId } as WithId<T>;

        data.push(newDoc);
        this.storage.write(data);

        return newDoc;
    }

    /**
     * Inserts multiple documents into the collection.
     * Throws DuplicateKeyError if any user-provided _id already exists or duplicates within the batch.
     */
    insertMany(documents: T[]): WithId<T>[] {
        const data = this.storage.read();
        const newDocs: WithId<T>[] = [];
        const seenIds = new Set<string>();

        for (const doc of documents) {
            const cloned = this.clone(doc) as Record<string, unknown>;
            const newId = typeof cloned._id === "string" ? cloned._id : uuid();

            if (seenIds.has(newId) || data.some(d => d._id === newId)) {
                throw new DuplicateKeyError(newId, this.collectionName);
            }

            seenIds.add(newId);
            newDocs.push({ ...cloned, _id: newId } as WithId<T>);
        }

        data.push(...newDocs);
        this.storage.write(data);

        return newDocs;
    }

    find(filter: Filter<T> = {}): WithId<T>[] {
        const data = this.storage.read();
        return this.clone(data.filter(doc => Query.matches(doc, filter)));
    }

    findOne(filter: Filter<T>): WithId<T> | null {
        const data = this.storage.read();
        const result = data.find(doc => Query.matches(doc, filter));
        return result ? this.clone(result) : null;
    }

    updateOne(filter: Filter<T>, update: Update<T>): { matched: boolean; modified: boolean } {
        const data = this.storage.read();
        const index = data.findIndex(doc => Query.matches(doc, filter));

        if (index === -1) {
            return { matched: false, modified: false };
        }

        if (update.$set) {
            const safeUpdate = { ...update.$set } as Record<string, unknown>;
            delete safeUpdate._id; // _id should be immutable

            data[index] = { ...data[index], ...safeUpdate } as WithId<T>;
            this.storage.write(data);
            return { matched: true, modified: true };
        }

        return { matched: true, modified: false };
    }

    deleteOne(filter: Filter<T>): { deletedCount: number } {
        const data = this.storage.read();
        const index = data.findIndex(doc => Query.matches(doc, filter));

        if (index === -1) {
            return { deletedCount: 0 };
        }

        data.splice(index, 1);
        this.storage.write(data);

        return { deletedCount: 1 };
    }

    count(): number {
        return this.storage.read().length;
    }

    clear(): void {
        this.storage.clear();
    }
}
