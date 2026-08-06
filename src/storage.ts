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
import { packToUTF16, unpackFromUTF16 } from "./utils/utf16Packer";

export class Storage<T> {
    private readonly key: string;
    private readonly collectionName: string;
    private cachedData: T[] | null = null;

    constructor(key: string, collectionName: string) {
        this.key = key;
        this.collectionName = collectionName;

        if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
            window.addEventListener("storage", (e) => {
                if (e.key === this.key) {
                    this.cachedData = null;
                }
            });
        }
    }

    private async compress(data: string): Promise<string> {
        if (typeof CompressionStream === "undefined") {
            return data;
        }
        try {
            const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("deflate"));
            const buffer = await new Response(stream).arrayBuffer();
            const bytes = new Uint8Array(buffer);
            return "CMP_" + packToUTF16(bytes);
        } catch {
            return data;
        }
    }

    private async decompress(data: string): Promise<string> {
        if (!data.startsWith("CMP_")) {
            return data;
        }
        if (typeof DecompressionStream === "undefined") {
            // Cannot decompress if environment lacks support, just return string
            // Ideally should not happen if write environment had it.
            throw new DataCorruptionError(this.collectionName);
        }
        try {
            const packed = data.substring(4);
            const bytes = unpackFromUTF16(packed);
            const stream = new Blob([bytes as any]).stream().pipeThrough(new DecompressionStream("deflate"));
            return await new Response(stream).text();
        } catch {
            throw new DataCorruptionError(this.collectionName);
        }
    }

    async read(): Promise<T[]> {
        if (this.cachedData !== null) {
            return [...this.cachedData];
        }

        if (typeof localStorage === "undefined") {
            return [];
        }
        const raw = localStorage.getItem(this.key);
        if (!raw) return [];

        try {
            const decompressed = await this.decompress(raw);
            this.cachedData = JSON.parse(decompressed) as T[];
            return [...this.cachedData];
        } catch {
            throw new DataCorruptionError(this.collectionName);
        }
    }

    async write(data: T[]): Promise<void> {
        if (typeof localStorage === "undefined") {
            throw new DatabaseError("localStorage is not available.");
        }
        
        try {
            const raw = JSON.stringify(data);
            const compressed = await this.compress(raw);
            localStorage.setItem(this.key, compressed);
            this.cachedData = [...data];
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

    async clear(): Promise<void> {
        this.cachedData = null;
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem(this.key);
        }
    }
}
