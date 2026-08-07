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

export type Document = Record<string, unknown>;
export type WithId<T> = T & { _id: string; __expiresAt?: number };

export interface InsertOptions {
    ttlMs?: number;
}

export type QueryOperators<T> = {
    $eq?: T;
    $ne?: T;
    $gt?: T;
    $gte?: T;
    $lt?: T;
    $lte?: T;
    $in?: T[];
    $nin?: T[];
};

export type Filter<T> = {
    [P in keyof T]?: T[P] | QueryOperators<T[P]>;
} & {
    $and?: Filter<T>[];
    $or?: Filter<T>[];
};

export type Update<T> = {
    $set?: Partial<T>;
    $inc?: Partial<Record<keyof T, number>>;
    $unset?: Partial<Record<keyof T, 1 | true>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $push?: Partial<Record<keyof T, any>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $pull?: Partial<Record<keyof T, any>>;
};

export interface FindOptions<T> {
    sort?: { [P in keyof T]?: 1 | -1 };
    skip?: number;
    limit?: number;
    projection?: { [P in Exclude<keyof T, "_id">]?: 1 | 0 };
}

export type SubscriptionCallback<T> = (data: WithId<T>[]) => void;

export interface JSONSchema {
    bsonType?: string | string[];
    type?: string | string[];
    required?: string[];
    properties?: Record<string, JSONSchema>;
    minimum?: number;
    maximum?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    enum?: any[];
    description?: string;
    items?: JSONSchema | JSONSchema[];
}

export type ValidatorDef = {
    $jsonSchema: JSONSchema;
};

export interface DatabaseStats {
    usedBytes: number;
    usedKB: string;
    usedMB: string;
    quotaBytes: number;
    availableBytes: number;
    percentUsed: string;
    collections: number;
    documents: number;
}

export type BackendType = 'auto' | 'localStorage' | 'indexedDB';
export type EvictionPolicy = 'none' | 'ttl' | 'lru' | 'fifo';

export interface CollectionOptions {
    backend?: BackendType;
    eviction?: EvictionPolicy;
}

export interface StorageEngine<T> {
    get(id: string): Promise<T | undefined>;
    getAll(): Promise<T[]>;

    put(document: T): Promise<void>;
    putMany(documents: T[]): Promise<void>;

    delete(id: string): Promise<void>;
    deleteMany(ids: string[]): Promise<void>;

    clear(): Promise<void>;
    setOnExternalChange(callback: () => void): void;

    isBatching: boolean;
    beginBatch(): void;
    commitBatch(): Promise<boolean>;
    rollbackBatch(): void;

    // Optional sync reads if supported by engine
    readCached?(): T[] | null;

    // Optional diagnostic capabilities
    estimate?(): Promise<StorageEstimate>;
    close(): void;
    destroy(): Promise<void>;
}

export interface StorageInfo {
    backend: string;
    usedBytes: number;
    estimatedQuota: number;
    compressed: boolean;
    collections: string[];
}
