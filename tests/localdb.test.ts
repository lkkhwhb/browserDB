import { beforeEach, describe, expect, it } from "vitest";
import {
    BrowserDB,
    DataCorruptionError,
    DatabaseError,
    DuplicateKeyError,
    QuotaExceededError
} from "../src";

// Mock localStorage for Node environment testing
const storageMap = new Map<string, string>();
const localStorageMock: Storage = {
    getItem: (key: string) => storageMap.get(key) ?? null,
    setItem: (key: string, value: string) => { storageMap.set(key, value); },
    removeItem: (key: string) => { storageMap.delete(key); },
    clear: () => { storageMap.clear(); },
    key: (index: number) => Array.from(storageMap.keys())[index] ?? null,
    get length() { return storageMap.size; }
};

Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    writable: true
});

Object.defineProperty(globalThis, "window", {
    value: globalThis,
    writable: true
});

describe("BrowserDB Test Suite", () => {
    beforeEach(() => {
        storageMap.clear();
    });

    it("should instantiate BrowserDB in a browser-like environment", () => {
        const db = new BrowserDB();
        expect(db).toBeInstanceOf(BrowserDB);
    });

    it("should insert single document with generated UUID", () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string; age: number }>("users");

        const doc = users.insertOne({ name: "Bhargav", age: 25 });
        expect(doc._id).toBeDefined();
        expect(typeof doc._id).toBe("string");
        expect(doc.name).toBe("Bhargav");
        expect(doc.age).toBe(25);
        expect(users.count()).toBe(1);
    });

    it("should insert multiple documents and retain custom _id", () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string; age: number }>("users");

        const docs = users.insertMany([
            { _id: "custom-1", name: "Alice", age: 30 },
            { name: "Bob", age: 35 }
        ]);

        expect(docs[0]._id).toBe("custom-1");
        expect(docs[1]._id).toBeDefined();
        expect(users.count()).toBe(2);
    });

    it("should throw DuplicateKeyError on duplicate _id insertion", () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");

        users.insertOne({ _id: "id-123", name: "Alice" });

        expect(() => {
            users.insertOne({ _id: "id-123", name: "Bob" });
        }).toThrow(DuplicateKeyError);
    });

    it("should throw DuplicateKeyError on batch insert with duplicate _id", () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");

        expect(() => {
            users.insertMany([
                { _id: "id-1", name: "Alice" },
                { _id: "id-1", name: "Bob" }
            ]);
        }).toThrow(DuplicateKeyError);
    });

    it("should query documents with operators ($gt, $gte, $lt, $lte, $ne)", () => {
        const db = new BrowserDB();
        const items = db.collection<{ title: string; price: number }>("items");

        items.insertMany([
            { title: "Item A", price: 10 },
            { title: "Item B", price: 20 },
            { title: "Item C", price: 30 }
        ]);

        const gtRes = items.find({ price: { $gt: 15 } });
        expect(gtRes.length).toBe(2);

        const lteRes = items.find({ price: { $lte: 20 } });
        expect(lteRes.length).toBe(2);

        const neRes = items.find({ price: { $ne: 20 } });
        expect(neRes.length).toBe(2);
    });

    it("should handle object literal filtering accurately", () => {
        const db = new BrowserDB();
        const users = db.collection<{ profile: { role: string } }>("users");

        users.insertMany([
            { profile: { role: "admin" } },
            { profile: { role: "user" } }
        ]);

        const admin = users.findOne({ profile: { role: "admin" } });
        expect(admin).not.toBeNull();
        expect(admin?.profile.role).toBe("admin");

        const nonExistent = users.findOne({ profile: { role: "superadmin" } });
        expect(nonExistent).toBeNull();
    });

    it("should update a document while keeping _id immutable", () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string; status: string }>("users");

        const doc = users.insertOne({ name: "Charlie", status: "pending" });
        const res = users.updateOne({ _id: doc._id }, { $set: { status: "active", _id: "hacked" } as any });

        expect(res.matched).toBe(true);
        expect(res.modified).toBe(true);

        const updated = users.findOne({ _id: doc._id });
        expect(updated?.status).toBe("active");
        expect(updated?._id).toBe(doc._id);
    });

    it("should delete a document", () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");

        const doc = users.insertOne({ name: "David" });
        expect(users.count()).toBe(1);

        const delRes = users.deleteOne({ _id: doc._id });
        expect(delRes.deletedCount).toBe(1);
        expect(users.count()).toBe(0);
    });

    it("should report database stats accurately", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");
        users.insertOne({ name: "Eve" });

        const stats = await db.stats();
        expect(stats.collections).toBe(1);
        expect(stats.documents).toBe(1);
        expect(stats.usedBytes).toBeGreaterThan(0);
        expect(stats.usedKB).toContain("KB");
    });

    it("should drop collection and clear database", () => {
        const db = new BrowserDB();
        db.collection("col1").insertOne({ a: 1 });
        db.collection("col2").insertOne({ b: 2 });

        expect(db.has("col1")).toBe(true);
        db.dropCollection("col1");
        expect(db.has("col1")).toBe(false);

        db.clear();
        expect(db.has("col2")).toBe(false);
    });

    it("should throw DataCorruptionError when reading invalid JSON", () => {
        const db = new BrowserDB();
        localStorage.setItem("browserdb_corrupt", "INVALID_JSON{");

        const corruptCol = db.collection("corrupt");
        expect(() => corruptCol.find()).toThrow(DataCorruptionError);
    });
});
