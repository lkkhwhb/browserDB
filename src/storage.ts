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

    private async compress(data: string): Promise<string> {
        if (typeof CompressionStream === "undefined" || typeof btoa === "undefined") {
            return data;
        }
        try {
            const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("deflate"));
            const buffer = await new Response(stream).arrayBuffer();
            let binary = "";
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return "CMP_" + btoa(binary);
        } catch {
            return data;
        }
    }

    private async decompress(data: string): Promise<string> {
        if (!data.startsWith("CMP_")) {
            return data;
        }
        if (typeof DecompressionStream === "undefined" || typeof atob === "undefined") {
            // Cannot decompress if environment lacks support, just return string
            // Ideally should not happen if write environment had it.
            throw new DataCorruptionError(this.collectionName);
        }
        try {
            const base64 = data.substring(4);
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
            return await new Response(stream).text();
        } catch {
            throw new DataCorruptionError(this.collectionName);
        }
    }

    async read(): Promise<T[]> {
        if (typeof localStorage === "undefined") {
            return [];
        }
        const raw = localStorage.getItem(this.key);
        if (!raw) return [];

        try {
            const decompressed = await this.decompress(raw);
            return JSON.parse(decompressed) as T[];
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
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem(this.key);
        }
    }
}
