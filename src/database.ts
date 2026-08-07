/**
 * BrowserDB
 * A lightweight, MongoDB-inspired document database
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

import { Collection } from "./collection";
import { DatabaseError } from "./errors";
import { Gallery } from "./gallery";
import { DatabaseStats, Document, CollectionOptions, StorageInfo } from "./types";
import { uuid } from "./utils/uuid";

function deepClone<T>(items: T[]): T[] {
    return items.map(item => {
        if (item === null || typeof item !== "object") return item;
        if (Array.isArray(item)) return deepClone(item) as unknown as T;
        if (item instanceof Date) return new Date(item.getTime()) as unknown as T;
        const cloned: any = {};
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                cloned[key] = deepClone([(item as any)[key]])[0];
            }
        }
        return cloned as T;
    });
}

export class BrowserDB {
    private readonly prefix = "browserdb_";
    private collections: Map<string, Collection<Document>> = new Map();
    private galleries: Map<string, Gallery> = new Map();
    private isBatching = false;

    public uuid = { v4: uuid };

    public storage = {
        info: async (): Promise<StorageInfo> => {
            let usedBytes = 0;
            let estimatedQuota = 52428800; // 50MB default fallback
            if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
                try {
                    const estimate = await navigator.storage.estimate();
                    if (estimate.usage !== undefined) usedBytes = estimate.usage;
                    if (estimate.quota !== undefined) estimatedQuota = estimate.quota;
                } catch {
                    // Ignore estimation errors
                }
            }
            return {
                backend: "hybrid",
                usedBytes,
                estimatedQuota,
                compressed: typeof CompressionStream !== "undefined",
                collections: Array.from(this.collections.keys())
            };
        }
    };

    constructor() {
        if (typeof window === "undefined" || typeof localStorage === "undefined") {
            throw new DatabaseError("BrowserDB requires a browser environment with localStorage.");
        }
    }

    /**
     * Note: Requesting the same collection name with different generic types
     * (e.g., db.collection<User>("x") and db.collection<Product>("x"))
     * will return the same underlying collection. TypeScript cannot detect this misuse.
     */
    collection<T extends Document>(name: string, options?: CollectionOptions): Collection<T> {
        if (!this.collections.has(name)) {
            const col = new Collection<Document>(name, options);
            if (this.isBatching) col.beginBatch();
            this.collections.set(name, col);
        }
        return this.collections.get(name) as unknown as Collection<T>;
    }

    async transaction(callback: () => Promise<void>): Promise<void> {
        if (this.isBatching) throw new DatabaseError("Nested transactions are not supported.");
        this.isBatching = true;
        
        const involvedCollections = Array.from(this.collections.values());
        
        // Take a snapshot backup of all collections before beginning the batch
        const backups = new Map<Collection<Document>, Document[]>();
        for (const collection of involvedCollections) {
            const data = await collection.find();
            // Clone snapshot so changes inside transaction do not mutate it
            backups.set(collection, deepClone(data));
        }

        for (const collection of involvedCollections) {
            collection.beginBatch();
        }

        let success = false;
        try {
            await callback();
            success = true;
        } finally {
            this.isBatching = false;
            let throwError: any = null;
            
            if (success) {
                // Attempt to commit all collections
                for (const collection of involvedCollections) {
                    try {
                        await collection.commitBatch();
                    } catch (e) {
                        success = false;
                        throwError = e;
                        break;
                    }
                }
            }
            
            if (!success) {
                // Rollback: abort inflight batches and restore from snapshot
                for (const collection of involvedCollections) {
                    collection.rollbackBatch();
                    const backup = backups.get(collection);
                    if (backup) {
                        await collection.clear();
                        await collection.insertMany(backup);
                    } else {
                        await collection.clear();
                    }
                }
            }
            
            if (throwError) throw throwError;
        }
    }

    gallery(name: string): Gallery {
        if (!this.galleries.has(name)) {
            this.galleries.set(name, new Gallery(name, this.prefix));
        }
        return this.galleries.get(name)!;
    }

    has(name: string): boolean {
        return localStorage.getItem(`${this.prefix}${name}`) !== null ||
               localStorage.getItem(`${this.prefix}meta_${name}`) !== null;
    }

    async dropCollection(name: string): Promise<void> {
        const col = this.collections.get(name);
        if (col) {
            await col.destroy();
            this.collections.delete(name);
        } else {
            // Collection not in memory - delete storage manually
            localStorage.removeItem(`${this.prefix}${name}`);
            localStorage.removeItem(`${this.prefix}meta_${name}`);
            if (typeof indexedDB !== "undefined") {
                try { indexedDB.deleteDatabase(`browserdb_col_${name}`); } catch {}
            }
        }

        // Remove gallery if it was instantiated
        if (this.galleries.has(name)) {
            this.galleries.get(name)?.clear().catch(() => {});
            this.galleries.delete(name);
        }
        
        // Asynchronously delete the IndexedDB database for this gallery
        if (typeof indexedDB !== "undefined") {
            try {
                indexedDB.deleteDatabase(`${this.prefix}gallery_${name}`);
            } catch {
                // Ignore error if it fails
            }
        }
    }

    async clear(): Promise<void> {
        for (const collection of this.collections.values()) {
            await collection.clear();
            collection.close();
        }
        
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        this.collections.clear();
        
        for (const [name, gallery] of this.galleries.entries()) {
            gallery.clear().catch(() => {});
            if (typeof indexedDB !== "undefined") {
                try { indexedDB.deleteDatabase(`${this.prefix}gallery_${name}`); } catch {}
            }
        }
        this.galleries.clear();
        
        // Fallback for deleting all IndexedDB databases (Modern Browsers only)
        if (typeof indexedDB !== "undefined" && indexedDB.databases) {
            indexedDB.databases().then(dbs => {
                for (const db of dbs) {
                    if (db.name && db.name.startsWith(`${this.prefix}gallery_`)) {
                        try { indexedDB.deleteDatabase(db.name); } catch {}
                    }
                }
            }).catch(() => {});
        }
    }

    /**
     * Note: `navigator.storage.estimate()` reports storage usage for the entire
     * origin (including IndexedDB, Cache Storage, etc.), not just BrowserDB.
     * This may cause usedBytes to appear larger than BrowserDB's actual storage footprint.
     */
    async stats(): Promise<DatabaseStats> {
        let usedBytes = 0;
        let quotaBytes = 5 * 1024 * 1024;
        let collectionsCount = 0;
        let docsCount = 0;

        const collectionNames = new Set<string>();

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                const rawData = localStorage.getItem(key) || "[]";

                // localStorage strictly stores strings as UTF-16 (2 bytes per character).
                // Do NOT use TextEncoder (UTF-8), as it overestimates size for high-range characters.
                usedBytes += (key.length + rawData.length) * 2;

                if (!key.startsWith(`${this.prefix}img_`)) {
                    if (key.startsWith(`${this.prefix}meta_`)) {
                        collectionNames.add(key.substring(`${this.prefix}meta_`.length));
                    } else if (key.startsWith(`${this.prefix}gallery_`)) {
                        // Ignore gallery metas for stats docs
                    } else {
                        collectionNames.add(key.substring(this.prefix.length));
                    }
                }
            }
        }

        collectionsCount = collectionNames.size;
        for (const name of collectionNames) {
            try {
                docsCount += await this.collection(name).count();
            } catch {
                // Ignore errors reading collection
            }
        }

        if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                if (estimate.quota !== undefined) quotaBytes = estimate.quota;
            } catch {
                // Ignore API quota estimation errors
            }
        }

        const format = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

        return {
            usedBytes,
            usedKB: (usedBytes / 1024).toFixed(2) + " KB",
            usedMB: format(usedBytes) + " MB",
            quotaBytes,
            availableBytes: quotaBytes - usedBytes,
            percentUsed: ((usedBytes / quotaBytes) * 100).toFixed(2) + "%",
            collections: collectionsCount,
            documents: docsCount,
        };
    }
}

/**
 * Backward compatibility alias for LocalDB
 */
export { BrowserDB as LocalDB };
