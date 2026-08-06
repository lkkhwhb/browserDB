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

import { Collection } from "./collection";
import { DatabaseError } from "./errors";
import { ImageStore } from "./imageStore";
import { DatabaseStats, Document } from "./types";
import { uuid } from "./utils/uuid";

export class BrowserDB {
    private readonly prefix = "browserdb_";
    private collections: Map<string, Collection<Document>> = new Map();
    private imageStores: Map<string, ImageStore> = new Map();
    private isBatching = false;

    public uuid = { v4: uuid };

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
    collection<T extends Document>(name: string): Collection<T> {
        if (!this.collections.has(name)) {
            const col = new Collection<Document>(name, this.prefix);
            if (this.isBatching) col.beginBatch();
            this.collections.set(name, col);
        }
        return this.collections.get(name) as unknown as Collection<T>;
    }

    async transaction(callback: () => Promise<void>): Promise<void> {
        if (this.isBatching) throw new DatabaseError("Nested transactions are not supported.");
        this.isBatching = true;
        
        for (const collection of this.collections.values()) {
            collection.beginBatch();
        }

        try {
            await callback();
        } finally {
            this.isBatching = false;
            for (const collection of this.collections.values()) {
                await collection.commitBatch();
            }
        }
    }

    images(name: string): ImageStore {
        if (!this.imageStores.has(name)) {
            this.imageStores.set(name, new ImageStore(name, this.prefix));
        }
        return this.imageStores.get(name)!;
    }

    has(name: string): boolean {
        return localStorage.getItem(`${this.prefix}${name}`) !== null || localStorage.getItem(`${this.prefix}img_${name}_`) !== null;
    }

    dropCollection(name: string): void {
        localStorage.removeItem(`${this.prefix}${name}`);
        this.collections.delete(name);
    }

    clear(): void {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        this.collections.clear();
        this.imageStores.clear();
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

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                collectionsCount++;
                const rawData = localStorage.getItem(key) || "[]";

                // localStorage strictly stores strings as UTF-16 (2 bytes per character).
                // Do NOT use TextEncoder (UTF-8), as it overestimates size for high-range characters.
                usedBytes += (key.length + rawData.length) * 2;

                if (!key.startsWith(`${this.prefix}img_`)) {
                    try {
                        const collectionName = key.substring(this.prefix.length);
                        docsCount += await this.collection(collectionName).count();
                    } catch {
                        // Ignore decompression/parsing errors for stats
                    }
                }
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
