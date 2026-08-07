import { StorageEngine, BackendType, EvictionPolicy } from "../types";
import { QuotaExceededError, DatabaseError } from "../errors";
import { LocalStorageEngine } from "./LocalStorageEngine";
import { IndexedDBEngine } from "./IndexedDBEngine";

interface MetaData {
    backend: BackendType;
    migration: 'none' | 'in_progress' | 'completed';
    target: BackendType;
}

export class HybridStorageEngine<T extends { _id: string; __expiresAt?: number }> implements StorageEngine<T> {
    private readonly collectionName: string;
    private readonly config: { backend: BackendType; eviction: EvictionPolicy };
    private activeEngine: StorageEngine<T>;
    
    private localEngine: LocalStorageEngine<T>;
    private idbEngine: IndexedDBEngine<T>;

    constructor(collectionName: string, config: { backend?: BackendType; eviction?: EvictionPolicy }) {
        this.collectionName = collectionName;
        this.config = {
            backend: config.backend || "auto",
            eviction: config.eviction || "none"
        };

        const prefix = "browserdb_";
        this.localEngine = new LocalStorageEngine<T>(`${prefix}${collectionName}`, collectionName);
        this.idbEngine = new IndexedDBEngine<T>(collectionName);

        // Resume migration or determine active backend
        const meta = this.getMeta();
        
        if (meta.migration === 'in_progress' && meta.target === 'indexedDB') {
            // Recover from incomplete migration: safely fallback to localEngine and reset state
            this.activeEngine = this.localEngine;
            this.setMeta({ backend: 'localStorage', migration: 'none', target: 'localStorage' });
            // Clean up orphaned IndexedDB
            this.idbEngine.destroy().catch(() => {});
        } else if (meta.backend === 'indexedDB') {
            this.activeEngine = this.idbEngine;
        } else if (meta.backend === 'localStorage') {
            this.activeEngine = this.localEngine;
        } else {
            // Default based on config
            if (this.config.backend === 'indexedDB') {
                this.activeEngine = this.idbEngine;
                this.setMeta({ backend: 'indexedDB', migration: 'none', target: 'indexedDB' });
            } else {
                this.activeEngine = this.localEngine;
                this.setMeta({ backend: 'localStorage', migration: 'none', target: 'localStorage' });
            }
        }
    }

    private getMeta(): MetaData {
        if (typeof localStorage === 'undefined') return { backend: 'localStorage', migration: 'none', target: 'localStorage' };
        const raw = localStorage.getItem(`browserdb_meta_${this.collectionName}`);
        if (raw) {
            try { return JSON.parse(raw) as MetaData; } catch { /* ignore */ }
        }
        return { backend: 'auto', migration: 'none', target: 'auto' };
    }

    private setMeta(meta: MetaData) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`browserdb_meta_${this.collectionName}`, JSON.stringify(meta));
        }
    }

    private async runWithRecovery<R>(operation: () => Promise<R>): Promise<R> {
        try {
            return await operation();
        } catch (e) {
            if (e instanceof QuotaExceededError && this.activeEngine === this.localEngine) {
                return await this.handleQuotaExceeded(operation);
            }
            throw e;
        }
    }

    private async handleQuotaExceeded<R>(operation: () => Promise<R>): Promise<R> {
        // 1. Force TTL Cleanup
        await this.forceTTLCleanup();
        try {
            return await operation();
        } catch (e) {
            if (!(e instanceof QuotaExceededError)) throw e;
        }

        // 2. Migrate if Auto
        if (this.config.backend === 'auto' || this.config.backend === 'indexedDB') {
            await this.migrateToIndexedDB();
            // Retry operation on new engine
            return await operation();
        }

        // 3. Evict if configured
        if (this.config.eviction !== 'none') {
            await this.applyEvictionPolicy();
            try {
                return await operation();
            } catch (e) {
                if (!(e instanceof QuotaExceededError)) throw e;
            }
        }

        // Still failing
        throw new QuotaExceededError();
    }

    private async forceTTLCleanup(): Promise<void> {
        const data = await this.activeEngine.getAll();
        const now = Date.now();
        const validDocs = data.filter(doc => !doc.__expiresAt || doc.__expiresAt >= now);
        if (validDocs.length !== data.length) {
            await this.activeEngine.clear();
            await this.activeEngine.putMany(validDocs);
        }
    }

    private async applyEvictionPolicy(): Promise<void> {
        const data = await this.activeEngine.getAll();
        if (data.length === 0) return;

        // Evict 20% of data
        const evictCount = Math.max(1, Math.floor(data.length * 0.2));
        
        let toKeep = data;

        if (this.config.eviction === 'fifo') {
            toKeep = data.slice(evictCount);
        } else if (this.config.eviction === 'lru') {
            // Approximation: we don't track LRU by default, so we'll fallback to FIFO
            toKeep = data.slice(evictCount);
        } else if (this.config.eviction === 'ttl') {
            // Drop docs with TTL even if not expired (closest to expiry first)
            const withTTL = data.filter(d => d.__expiresAt).sort((a, b) => a.__expiresAt! - b.__expiresAt!);
            const withoutTTL = data.filter(d => !d.__expiresAt);
            const survivingTTL = withTTL.slice(evictCount);
            toKeep = [...survivingTTL, ...withoutTTL];
        }

        await this.activeEngine.clear();
        await this.activeEngine.putMany(toKeep);
    }

    private async migrateToIndexedDB(): Promise<void> {
        this.setMeta({ backend: 'localStorage', migration: 'in_progress', target: 'indexedDB' });

        const data = await this.localEngine.getAll();
        
        // Write to IndexedDB
        await this.idbEngine.clear();
        await this.idbEngine.putMany(data);

        // Verify (rudimentary)
        const verify = await this.idbEngine.getAll();
        if (verify.length !== data.length) {
            this.setMeta({ backend: 'localStorage', migration: 'none', target: 'localStorage' });
            throw new DatabaseError("Migration to IndexedDB failed verification.");
        }

        // Success
        this.setMeta({ backend: 'indexedDB', migration: 'completed', target: 'indexedDB' });
        this.activeEngine = this.idbEngine;

        // Cleanup local storage
        await this.localEngine.clear();
    }

    async get(id: string): Promise<T | undefined> { return this.activeEngine.get(id); }
    async getAll(): Promise<T[]> { return this.activeEngine.getAll(); }
    async put(document: T): Promise<void> { return this.runWithRecovery(() => this.activeEngine.put(document)); }
    async putMany(documents: T[]): Promise<void> { return this.runWithRecovery(() => this.activeEngine.putMany(documents)); }
    async delete(id: string): Promise<void> { return this.runWithRecovery(() => this.activeEngine.delete(id)); }
    async deleteMany(ids: string[]): Promise<void> { return this.runWithRecovery(() => this.activeEngine.deleteMany(ids)); }
    async clear(): Promise<void> { return this.activeEngine.clear(); }
    
    get isBatching(): boolean { return this.activeEngine.isBatching; }
    beginBatch(): void { this.activeEngine.beginBatch(); }
    async commitBatch(): Promise<boolean> { return this.runWithRecovery(() => this.activeEngine.commitBatch()); }
    rollbackBatch(): void { this.activeEngine.rollbackBatch(); }

    readCached(): T[] | null {
        if (this.activeEngine.readCached) {
            return this.activeEngine.readCached();
        }
        return null;
    }

    setOnExternalChange(callback: () => void): void {
        this.localEngine.setOnExternalChange(callback);
        this.idbEngine.setOnExternalChange(callback);
    }

    close(): void {
        this.localEngine.close();
        this.idbEngine.close();
    }

    async destroy(): Promise<void> {
        this.close();
        await this.localEngine.destroy();
        await this.idbEngine.destroy();
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem(`browserdb_meta_${this.collectionName}`);
        }
    }
}
