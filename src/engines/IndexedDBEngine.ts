import { StorageEngine } from "../types";
import { DatabaseError } from "../errors";

export class IndexedDBEngine<T extends { _id: string }> implements StorageEngine<T> {
    private readonly dbName: string;
    private readonly storeName = "documents";
    private db: IDBDatabase | null = null;
    private channel: BroadcastChannel | null = null;
    private onExternalChange?: () => void;
    private readonly channelName: string;

    public isBatching = false;
    private pendingOperations: { type: 'put' | 'delete', data?: any, id?: string }[] = [];

    constructor(collectionName: string) {
        this.dbName = `browserdb_col_${collectionName}`;
        this.channelName = `browserdb_chan_${collectionName}`;
        
        if (typeof BroadcastChannel !== "undefined") {
            this.channel = new BroadcastChannel(this.channelName);
            this.channel.onmessage = (event) => {
                if (event.data === "changed" && this.onExternalChange) {
                    this.onExternalChange();
                }
            };
        }
    }

    private async getDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;
        if (typeof indexedDB === "undefined") {
            throw new DatabaseError("IndexedDB is not available in this environment.");
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "_id" });
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve(this.db);
            };

            request.onerror = () => {
                reject(new DatabaseError(`Failed to open IndexedDB database: ${this.dbName}`));
            };
        });
    }

    private notifyOthers() {
        if (this.channel) {
            this.channel.postMessage("changed");
        }
    }

    async get(id: string): Promise<T | undefined> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readonly");
            const store = tx.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new DatabaseError("Failed to get document."));
        });
    }

    async getAll(): Promise<T[]> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readonly");
            const store = tx.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(new DatabaseError("Failed to get all documents."));
        });
    }

    async put(document: T): Promise<void> {
        if (this.isBatching) {
            this.pendingOperations.push({ type: 'put', data: document });
            return;
        }

        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const request = store.put(document);

            request.onsuccess = () => {
                this.notifyOthers();
                resolve();
            };
            request.onerror = () => reject(new DatabaseError("Failed to put document."));
        });
    }

    async putMany(documents: T[]): Promise<void> {
        if (documents.length === 0) return;
        
        if (this.isBatching) {
            for (const doc of documents) {
                this.pendingOperations.push({ type: 'put', data: doc });
            }
            return;
        }

        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            
            for (const doc of documents) {
                store.put(doc);
            }

            tx.oncomplete = () => {
                this.notifyOthers();
                resolve();
            };
            tx.onerror = () => reject(new DatabaseError("Failed to put multiple documents."));
        });
    }

    async delete(id: string): Promise<void> {
        if (this.isBatching) {
            this.pendingOperations.push({ type: 'delete', id });
            return;
        }
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                this.notifyOthers();
                resolve();
            };
            request.onerror = () => reject(new DatabaseError("Failed to delete document."));
        });
    }

    async deleteMany(ids: string[]): Promise<void> {
        if (ids.length === 0) return;
        
        if (this.isBatching) {
            for (const id of ids) {
                this.pendingOperations.push({ type: 'delete', id });
            }
            return;
        }

        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            
            for (const id of ids) {
                store.delete(id);
            }

            tx.oncomplete = () => {
                this.notifyOthers();
                resolve();
            };
            tx.onerror = () => reject(new DatabaseError("Failed to delete multiple documents."));
        });
    }

    async clear(): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                this.notifyOthers();
                resolve();
            };
            request.onerror = () => reject(new DatabaseError("Failed to clear object store."));
        });
    }

    setOnExternalChange(callback: () => void): void {
        this.onExternalChange = callback;
    }

    beginBatch(): void {
        this.isBatching = true;
        this.pendingOperations = [];
    }

    async commitBatch(): Promise<boolean> {
        this.isBatching = false;
        if (this.pendingOperations.length === 0) return false;

        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);

            for (const op of this.pendingOperations) {
                if (op.type === 'put') {
                    store.put(op.data);
                } else if (op.type === 'delete') {
                    store.delete(op.id!);
                }
            }

            tx.oncomplete = () => {
                this.pendingOperations = [];
                this.notifyOthers();
                resolve(true);
            };
            tx.onerror = () => {
                this.pendingOperations = [];
                reject(new DatabaseError("Failed to commit batch to IndexedDB."));
            };
        });
    }

    rollbackBatch(): void {
        this.isBatching = false;
        this.pendingOperations = [];
    }

    close(): void {
        if (this.channel) {
            this.channel.close();
        }
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    async destroy(): Promise<void> {
        this.close();
        return new Promise((resolve, reject) => {
            const req = indexedDB.deleteDatabase(this.dbName);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(new DatabaseError("Failed to delete IndexedDB database"));
        });
    }
}
