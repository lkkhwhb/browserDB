import { StorageEngine } from "../types";
import { DatabaseError, QuotaExceededError, DataCorruptionError } from "../errors";
import { packToUTF16, unpackFromUTF16 } from "../utils/utf16Packer";
import { serializeToRows, deserializeFromRows, SerializedData } from "../utils/schemaSerializer";

export class LocalStorageEngine<T extends { _id: string }> implements StorageEngine<T> {
    private readonly key: string;
    private readonly collectionName: string;
    private cachedData: T[] | null = null;
    private onExternalChange?: () => void;
    public isBatching = false;
    private hasBatchedChanges = false;

    private storageListener: ((e: StorageEvent) => void) | null = null;

    constructor(key: string, collectionName: string) {
        this.key = key;
        this.collectionName = collectionName;

        if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
            this.storageListener = (e: StorageEvent) => {
                if (e.key === this.key) {
                    this.cachedData = null;
                    if (this.onExternalChange) this.onExternalChange();
                }
            };
            window.addEventListener("storage", this.storageListener);
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

    readCached(): T[] | null {
        return this.cachedData;
    }

    private async loadAndCache(): Promise<T[]> {
        if (this.cachedData !== null) {
            return this.cachedData;
        }

        if (typeof localStorage === "undefined") {
            return [];
        }

        const raw = localStorage.getItem(this.key);
        if (!raw) {
            this.cachedData = [];
            return this.cachedData;
        }

        try {
            const decompressed = await this.decompress(raw);
            const parsed = JSON.parse(decompressed);
            if (parsed && typeof parsed === "object" && "keys" in parsed && "rows" in parsed) {
                this.cachedData = deserializeFromRows<T>(parsed as SerializedData);
            } else {
                this.cachedData = parsed as T[]; // Legacy support
            }
            return this.cachedData;
        } catch {
            throw new DataCorruptionError(this.collectionName);
        }
    }

    private async saveCache(data: T[]): Promise<void> {
        if (typeof localStorage === "undefined") {
            throw new DatabaseError("localStorage is not available.");
        }

        if (this.isBatching) {
            this.cachedData = [...data];
            this.hasBatchedChanges = true;
            return;
        }

        try {
            const serialized = serializeToRows(data);
            const raw = JSON.stringify(serialized);
            const compressed = await this.compress(raw);
            localStorage.setItem(this.key, compressed);
            this.cachedData = data;
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

    async get(id: string): Promise<T | undefined> {
        const data = await this.loadAndCache();
        return data.find(doc => doc._id === id);
    }

    async getAll(): Promise<T[]> {
        const data = await this.loadAndCache();
        return [...data];
    }

    async put(document: T): Promise<void> {
        const data = await this.loadAndCache();
        const index = data.findIndex(doc => doc._id === document._id);
        const newData = [...data];
        if (index >= 0) {
            newData[index] = document;
        } else {
            newData.push(document);
        }
        await this.saveCache(newData);
    }

    async putMany(documents: T[]): Promise<void> {
        const data = await this.loadAndCache();
        const newData = [...data];
        for (const document of documents) {
            const index = newData.findIndex(doc => doc._id === document._id);
            if (index >= 0) {
                newData[index] = document;
            } else {
                newData.push(document);
            }
        }
        await this.saveCache(newData);
    }

    async delete(id: string): Promise<void> {
        const data = await this.loadAndCache();
        const newData = data.filter(doc => doc._id !== id);
        if (newData.length !== data.length) {
            await this.saveCache(newData);
        }
    }

    async deleteMany(ids: string[]): Promise<void> {
        const data = await this.loadAndCache();
        const idSet = new Set(ids);
        const newData = data.filter(doc => !idSet.has(doc._id));
        if (newData.length !== data.length) {
            await this.saveCache(newData);
        }
    }

    async clear(): Promise<void> {
        this.cachedData = [];
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem(this.key);
        }
    }

    setOnExternalChange(callback: () => void): void {
        this.onExternalChange = callback;
    }

    beginBatch(): void {
        this.isBatching = true;
        this.hasBatchedChanges = false;
    }

    async commitBatch(): Promise<boolean> {
        this.isBatching = false;
        if (this.hasBatchedChanges && this.cachedData) {
            try {
                await this.saveCache(this.cachedData);
                this.hasBatchedChanges = false;
                return true;
            } catch (e) {
                this.rollbackBatch();
                throw e;
            }
        }
        return false;
    }

    rollbackBatch(): void {
        this.isBatching = false;
        this.hasBatchedChanges = false;
        this.cachedData = null; // Forces reload from DB
    }

    close(): void {
        if (typeof window !== "undefined" && typeof window.removeEventListener === "function" && this.storageListener) {
            window.removeEventListener("storage", this.storageListener);
            this.storageListener = null;
        }
    }

    async destroy(): Promise<void> {
        this.close();
        await this.clear();
    }
}
