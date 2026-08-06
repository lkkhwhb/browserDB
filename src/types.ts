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
