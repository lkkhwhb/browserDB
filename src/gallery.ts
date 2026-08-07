import { DatabaseError } from "./errors";

export class Gallery {
    private readonly dbName: string;
    private readonly storeName = "files";
    private dbPromise: Promise<IDBDatabase> | null = null;

    constructor(name: string, prefix = "browserdb_") {
        this.dbName = `${prefix}gallery_${name}`;
    }

    private async getDB(): Promise<IDBDatabase> {
        if (typeof window === "undefined" || typeof indexedDB === "undefined") {
            throw new DatabaseError("IndexedDB is not supported in this environment.");
        }
        
        if (this.dbPromise) return this.dbPromise;

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            
            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };
            
            request.onerror = (event) => {
                reject(new DatabaseError(`Failed to open IndexedDB: ${(event.target as IDBOpenDBRequest).error}`));
            };
        });

        return this.dbPromise;
    }

    async store(id: string, file: Blob | File): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const request = store.put(file, id);

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(new DatabaseError(`Failed to store file: ${(e.target as IDBRequest).error}`));
        });
    }

    async getBlob(id: string): Promise<Blob | null> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readonly");
            const store = tx.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = (event) => {
                const result = (event.target as IDBRequest).result;
                resolve(result instanceof Blob ? result : null);
            };
            request.onerror = (e) => reject(new DatabaseError(`Failed to retrieve file: ${(e.target as IDBRequest).error}`));
        });
    }

    async get(id: string): Promise<string | null> {
        const blob = await this.getBlob(id);
        if (!blob) return null;
        return URL.createObjectURL(blob);
    }

    async remove(id: string): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(new DatabaseError(`Failed to delete file: ${(e.target as IDBRequest).error}`));
        });
    }

    async clear(): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(new DatabaseError(`Failed to clear gallery: ${(e.target as IDBRequest).error}`));
        });
    }
}
