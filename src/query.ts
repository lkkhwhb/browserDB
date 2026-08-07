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

import { Filter, QueryOperators, WithId } from "./types";
import { deepEqual } from "./utils/deepEqual";

export class Query {
    /**
     * Ensures both values are of the same comparable type (string or number).
     * Prevents unexpected JavaScript coercion (e.g., 5 > "abc").
     */
    private static isComparable(val1: unknown, val2: unknown): boolean {
        return typeof val1 === typeof val2 && (typeof val1 === "string" || typeof val1 === "number");
    }

    private static isQueryOperatorObject(obj: unknown): boolean {
        if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
            return false;
        }
        const keys = Object.keys(obj as Record<string, unknown>);
        return keys.some(k => k === "$ne" || k === "$gt" || k === "$gte" || k === "$lt" || k === "$lte" || k === "$in" || k === "$nin");
    }

    static matches<T>(doc: WithId<T>, filter: Filter<T>): boolean {
        if (filter.$and) {
            if (!filter.$and.every(subFilter => Query.matches(doc, subFilter))) return false;
        }
        if (filter.$or) {
            if (!filter.$or.some(subFilter => Query.matches(doc, subFilter))) return false;
        }

        for (const key in filter) {
            if (key === "$and" || key === "$or") continue;
            if (!Object.prototype.hasOwnProperty.call(filter, key)) continue;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const condition = (filter as any)[key];
            const docValue = doc[key as keyof WithId<T>] as unknown;

            if (Query.isQueryOperatorObject(condition)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ops = condition as any;
                
                if (ops.$ne !== undefined && deepEqual(docValue, ops.$ne)) return false;
                
                if (ops.$gt !== undefined) {
                    if (!Query.isComparable(docValue, ops.$gt) || (docValue as string | number) <= (ops.$gt as string | number)) return false;
                }
                if (ops.$gte !== undefined) {
                    if (!Query.isComparable(docValue, ops.$gte) || (docValue as string | number) < (ops.$gte as string | number)) return false;
                }
                if (ops.$lt !== undefined) {
                    if (!Query.isComparable(docValue, ops.$lt) || (docValue as string | number) >= (ops.$lt as string | number)) return false;
                }
                if (ops.$lte !== undefined) {
                    if (!Query.isComparable(docValue, ops.$lte) || (docValue as string | number) > (ops.$lte as string | number)) return false;
                }
                if (ops.$in !== undefined && Array.isArray(ops.$in)) {
                    if (!ops.$in.includes(docValue)) return false;
                }
                if (ops.$nin !== undefined && Array.isArray(ops.$nin)) {
                    if (ops.$nin.includes(docValue)) return false;
                }
            } else if (typeof condition === "object" && condition !== null) {
                if (JSON.stringify(docValue) !== JSON.stringify(condition)) return false;
            } else {
                if (docValue !== condition) return false;
            }
        }
        return true;
    }
}
