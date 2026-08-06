import { beforeEach, describe, expect, it } from "vitest";
import {
    BrowserDB,
    DataCorruptionError,
    DatabaseError,
    DuplicateKeyError,
    QuotaExceededError,
    ValidationError
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

    it("should insert single document with generated UUID", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string; age: number }>("users");

        const doc = await users.insertOne({ name: "Bhargav", age: 25 });
        expect(doc._id).toBeDefined();
        expect(typeof doc._id).toBe("string");
        expect(doc.name).toBe("Bhargav");
        expect(doc.age).toBe(25);
        expect(await users.count()).toBe(1);
    });

    it("should insert multiple documents and retain custom _id", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string; age: number }>("users");

        const docs = await users.insertMany([
            { _id: "custom-1", name: "Alice", age: 30 },
            { name: "Bob", age: 35 }
        ]);

        expect(docs[0]._id).toBe("custom-1");
        expect(docs[1]._id).toBeDefined();
        expect(await users.count()).toBe(2);
    });

    it("should throw DuplicateKeyError on duplicate _id insertion", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");

        await users.insertOne({ _id: "id-123", name: "Alice" });

        await expect(users.insertOne({ _id: "id-123", name: "Bob" })).rejects.toThrow(DuplicateKeyError);
    });

    it("should throw DuplicateKeyError on batch insert with duplicate _id", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");

        await expect(users.insertMany([
            { _id: "id-1", name: "Alice" },
            { _id: "id-1", name: "Bob" }
        ])).rejects.toThrow(DuplicateKeyError);
    });

    it("should query documents with operators ($gt, $gte, $lt, $lte, $ne)", async () => {
        const db = new BrowserDB();
        const items = db.collection<{ title: string; price: number }>("items");

        await items.insertMany([
            { title: "Item A", price: 10 },
            { title: "Item B", price: 20 },
            { title: "Item C", price: 30 }
        ]);

        const gtRes = await items.find({ price: { $gt: 15 } });
        expect(gtRes.length).toBe(2);

        const lteRes = await items.find({ price: { $lte: 20 } });
        expect(lteRes.length).toBe(2);

        const neRes = await items.find({ price: { $ne: 20 } });
        expect(neRes.length).toBe(2);
    });

    it("should handle object literal filtering accurately", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ profile: { role: string } }>("users");

        await users.insertMany([
            { profile: { role: "admin" } },
            { profile: { role: "user" } }
        ]);

        const admin = await users.findOne({ profile: { role: "admin" } });
        expect(admin).not.toBeNull();
        expect(admin?.profile.role).toBe("admin");

        const nonExistent = await users.findOne({ profile: { role: "superadmin" } });
        expect(nonExistent).toBeNull();
    });

    it("should update a document while keeping _id immutable", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string; status: string }>("users");

        const doc = await users.insertOne({ name: "Charlie", status: "pending" });
        const res = await users.updateOne({ _id: doc._id }, { $set: { status: "active", _id: "hacked" } as any });

        expect(res.matched).toBe(true);
        expect(res.modified).toBe(true);

        const updated = await users.findOne({ _id: doc._id });
        expect(updated?.status).toBe("active");
        expect(updated?._id).toBe(doc._id);
    });

    it("should delete a document", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");

        const doc = await users.insertOne({ name: "David" });
        expect(await users.count()).toBe(1);

        const delRes = await users.deleteOne({ _id: doc._id });
        expect(delRes.deletedCount).toBe(1);
        expect(await users.count()).toBe(0);
    });

    it("should report database stats accurately", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");
        await users.insertOne({ name: "Eve" });

        const stats = await db.stats();
        expect(stats.collections).toBe(1);
        expect(stats.documents).toBe(1);
        expect(stats.usedBytes).toBeGreaterThan(0);
        expect(stats.usedKB).toContain("KB");
    });

    it("should drop collection and clear database", async () => {
        const db = new BrowserDB();
        await db.collection("col1").insertOne({ a: 1 });
        await db.collection("col2").insertOne({ b: 2 });

        expect(db.has("col1")).toBe(true);
        db.dropCollection("col1");
        expect(db.has("col1")).toBe(false);

        db.clear();
        expect(db.has("col2")).toBe(false);
    });

    it("should throw DataCorruptionError when reading invalid JSON", async () => {
        const db = new BrowserDB();
        localStorage.setItem("browserdb_corrupt", "INVALID_JSON{");

        const corruptCol = db.collection("corrupt");
        await expect(corruptCol.find()).rejects.toThrow(DataCorruptionError);
    });

    it("should filter out expired documents (TTL)", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");

        // Insert one doc that expires in 100ms, and one that doesn't expire
        await users.insertOne({ name: "Alice" }, { ttlMs: 100 });
        await users.insertOne({ name: "Bob" });

        expect(await users.count()).toBe(2);
        
        // Wait 150ms for TTL to expire
        await new Promise(resolve => setTimeout(resolve, 150));

        // Alice should be gone, Bob should remain
        const remaining = await users.find();
        expect(remaining.length).toBe(1);
        expect(remaining[0].name).toBe("Bob");
        expect(await users.count()).toBe(1);
    });
    it("should support logical and array operators ($and, $or, $in, $nin)", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ age: number; role: string }>("users");

        await users.insertMany([
            { age: 20, role: "user" },
            { age: 30, role: "admin" },
            { age: 40, role: "user" }
        ]);

        const orRes = await users.find({ $or: [{ age: 20 }, { role: "admin" }] });
        expect(orRes.length).toBe(2);

        const inRes = await users.find({ role: { $in: ["admin", "superadmin"] } });
        expect(inRes.length).toBe(1);

        const ninRes = await users.find({ role: { $nin: ["admin"] } });
        expect(ninRes.length).toBe(2);
    });

    it("should support advanced update operators ($inc, $push, $pull, $unset)", async () => {
        const db = new BrowserDB();
        const stats = db.collection<{ views: number; tags: string[]; name?: string }>("stats");
        
        await stats.insertOne({ views: 10, tags: ["a", "b"], name: "test" });
        
        await stats.updateOne({}, { 
            $inc: { views: 5 }, 
            $push: { tags: "c" },
            $unset: { name: 1 } 
        });

        let doc = (await stats.find())[0];
        expect(doc.views).toBe(15);
        expect(doc.tags).toEqual(["a", "b", "c"]);
        expect(doc.name).toBeUndefined();

        await stats.updateOne({}, { $pull: { tags: "b" } });
        doc = (await stats.find())[0];
        expect(doc.tags).toEqual(["a", "c"]);
    });

    it("should execute transactions and batch writes", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");

        await db.transaction(async () => {
            await users.insertOne({ name: "TxUser" });
            await users.insertOne({ name: "TxUser2" });
        });

        expect(await users.count()).toBe(2);
    });

    it("should trigger reactive subscriptions", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string }>("users");

        let callCount = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let lastData: any[] = [];
        const unsub = users.subscribe({}, (data) => {
            callCount++;
            lastData = data;
        });

        // initial call wait
        await new Promise(r => setTimeout(r, 10));
        expect(callCount).toBe(1);

        await users.insertOne({ name: "SubUser" });
        await new Promise(r => setTimeout(r, 10));

        expect(callCount).toBe(2);
        expect(lastData[0].name).toBe("SubUser");

        unsub();
        await users.insertOne({ name: "SubUser2" });
        await new Promise(r => setTimeout(r, 10));

        // should not trigger again
        expect(callCount).toBe(2);
    });
    it("should validate using $jsonSchema and throw ValidationError", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string; age: number; role?: string }>("users");

        users.setValidator({
            $jsonSchema: {
                bsonType: "object",
                required: ["name", "age"],
                properties: {
                    name: { bsonType: "string" },
                    age: { bsonType: "number", minimum: 18, maximum: 100 },
                    role: { enum: ["admin", "user"] }
                }
            }
        });

        // Valid insert
        await users.insertOne({ name: "Alice", age: 20 });
        
        // Missing required field
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await expect(users.insertOne({ age: 25 } as any)).rejects.toThrow(ValidationError);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await expect(users.insertOne({ age: 25 } as any)).rejects.toThrow("Field 'name' is required");

        // Invalid type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await expect(users.insertOne({ name: 123, age: 25 } as any)).rejects.toThrow("Field 'name' must be one of [string], got number");

        // Out of bounds minimum
        await expect(users.insertOne({ name: "Bob", age: 17 })).rejects.toThrow("Field 'age' must be >= 18");

        // Invalid enum
        await expect(users.insertOne({ name: "Charlie", age: 30, role: "superadmin" })).rejects.toThrow("Field 'role' must be one of [admin, user]");
        
        // Should also validate on update
        await expect(users.updateOne({ name: "Alice" }, { $set: { age: 10 } })).rejects.toThrow("Field 'age' must be >= 18");
    });

    it("should trigger middleware hooks on insert and update", async () => {
        const db = new BrowserDB();
        const users = db.collection<{ name: string; logs?: string[] }>("users");

        let afterCallCount = 0;

        users.beforeInsert(async (doc) => {
            return { ...doc, logs: ["inserted"] };
        });

        users.afterInsert(async (doc) => {
            expect(doc.logs).toContain("inserted");
            afterCallCount++;
        });

        users.beforeUpdate(async (doc) => {
            return { ...doc, logs: [...(doc.logs || []), "updated"] };
        });

        users.afterUpdate(async (doc) => {
            expect(doc.logs).toContain("updated");
            afterCallCount++;
        });

        const doc = await users.insertOne({ name: "MiddlewareTest" });
        expect(doc.logs).toEqual(["inserted"]);
        expect(afterCallCount).toBe(1);

        const up = await users.updateOne({ name: "MiddlewareTest" }, { $set: { name: "MWT" } });
        expect(up.modified).toBe(true);

        const updatedDoc = await users.findOne({ name: "MWT" });
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(updatedDoc!.logs).toEqual(["inserted", "updated"]);
        expect(afterCallCount).toBe(2);
    });
});
