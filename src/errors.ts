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

export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DatabaseError";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class QuotaExceededError extends DatabaseError {
    constructor() {
        super("localStorage quota exceeded. Please clear some space.");
        this.name = "QuotaExceededError";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class DataCorruptionError extends DatabaseError {
    constructor(collectionName: string) {
        super(`Failed to parse JSON for collection '${collectionName}'.`);
        this.name = "DataCorruptionError";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class DuplicateKeyError extends DatabaseError {
    constructor(id: string, collectionName: string) {
        super(`Duplicate _id '${id}' found in collection '${collectionName}'.`);
        this.name = "DuplicateKeyError";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
