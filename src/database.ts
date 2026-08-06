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
import { DatabaseStats, Document } from "./types";

export class BrowserDB {
    private readonly prefix = "browserdb_";
    private collections: Map<string, Collection<Document>> = new Map();

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
            this.collections.set(name, new Collection<Document>(name, this.prefix));
        }
        return this.collections.get(name) as unknown as Collection<T>;
    }

    has(name: string): boolean {
        return localStorage.getItem(`${this.prefix}${name}`) !== null;
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

                if (typeof TextEncoder === "function") {
                    usedBytes += new TextEncoder().encode(key).length + new TextEncoder().encode(rawData).length;
                } else {
                    usedBytes += (key.length + rawData.length) * 2;
                }

                try {
                    const parsed = JSON.parse(rawData);
                    if (Array.isArray(parsed)) docsCount += parsed.length;
                } catch {
                    // Ignore JSON parsing errors for stats calculation
                }
            }
        }

        if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                if (estimate.usage !== undefined) usedBytes = estimate.usage;
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
