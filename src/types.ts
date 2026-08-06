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

export type Document = Record<string, unknown>;
export type WithId<T> = T & { _id: string; __expiresAt?: number };

export interface InsertOptions {
    ttlMs?: number;
}

export type QueryOperators<T> = {
    $ne?: T;
    $gt?: T;
    $gte?: T;
    $lt?: T;
    $lte?: T;
};

export type Filter<T> = {
    [P in keyof T]?: T[P] | QueryOperators<T[P]>;
};

export type Update<T> = {
    $set?: Partial<T>;
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
