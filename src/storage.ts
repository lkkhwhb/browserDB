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

import { DataCorruptionError, DatabaseError, QuotaExceededError } from "./errors";

export class Storage<T> {
    private readonly key: string;
    private readonly collectionName: string;

    constructor(key: string, collectionName: string) {
        this.key = key;
        this.collectionName = collectionName;
    }

    read(): T[] {
        if (typeof localStorage === "undefined") {
            return [];
        }
        const raw = localStorage.getItem(this.key);
        if (!raw) return [];

        try {
            return JSON.parse(raw) as T[];
        } catch {
            throw new DataCorruptionError(this.collectionName);
        }
    }

    write(data: T[]): void {
        if (typeof localStorage === "undefined") {
            throw new DatabaseError("localStorage is not available.");
        }
        try {
            localStorage.setItem(this.key, JSON.stringify(data));
        } catch (e) {
            if (
                (typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "QuotaExceededError") ||
                (e && typeof e === "object" && "name" in e && (e as { name?: string }).name === "QuotaExceededError")
            ) {
                throw new QuotaExceededError();
            }
            throw new DatabaseError("Failed to write to storage.");
        }
    }

    clear(): void {
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem(this.key);
        }
    }
}
