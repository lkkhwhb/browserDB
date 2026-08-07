# BrowserDB

> **⚠️ Beta Release**: This documentation covers `@lkkhwhb/browserdb@2.0.1-beta.0`. APIs are subject to change until the stable release.

A lightweight, MongoDB-inspired client-side document database with hybrid storage (localStorage + IndexedDB), reactive subscriptions, schema validation, and full TypeScript support.  
Designed for browser applications that need a simple yet powerful offline or persistent data layer.

---

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Collection API](#collection-api)
  - [insertOne](#insertone)
  - [insertMany](#insertmany)
  - [find](#find)
  - [findOne](#findone)
  - [updateOne](#updateone)
  - [replaceOne](#replaceone)
  - [deleteOne](#deleteone)
  - [count](#count)
  - [clear](#clear)
- [Query Syntax](#query-syntax)
- [Update Operators](#update-operators)
- [Reactive Subscriptions](#reactive-subscriptions)
- [Transactions](#transactions)
- [Middleware Hooks](#middleware-hooks)
- [Schema Validation](#schema-validation)
- [Lifecycle Management](#lifecycle-management)
- [Database API](#database-api)
- [Error Handling](#error-handling)
- [Storage Statistics](#storage-statistics)
- [React Integration](#react-integration)
- [Architecture](#architecture)
- [Browser Compatibility](#browser-compatibility)
- [Limitations](#limitations)
- [Breaking Changes in v2.0](#breaking-changes-in-v20)
- [License](#license)

---

## Installation

### npm / Yarn / pnpm

```bash
npm install @lkkhwhb/browserdb@2.0.1-beta.0
```

Import the library into your TypeScript or JavaScript project:

```ts
import { BrowserDB } from "@lkkhwhb/browserdb";
```

### CDN (Browser Globals)

Add a `<script>` tag directly to your HTML page. The library exposes `window.BrowserDB`.

```html
<script src="https://cdn.jsdelivr.net/npm/@lkkhwhb/browserdb@2.0.1-beta.0/dist/browserdb.global.js"></script>
<script>
  const db = new BrowserDB.BrowserDB();
</script>
```

The CDN bundle includes all necessary code (the optional `uuid` package is bundled). No additional dependencies are required at runtime.

---

## Getting Started

Create a database instance and define a typed collection. Every operation is asynchronous.

```ts
import { BrowserDB } from "@lkkhwhb/browserdb";

// Define your document shape
interface User {
  name: string;
  age: number;
  email?: string;
}

const db = new BrowserDB();
const users = db.collection<User>("users");

// Insert a document – an _id is auto-generated if not provided
const newUser = await users.insertOne({ name: "Alice", age: 30 });
console.log(newUser._id); // e.g. "550e8400-e29b-41d4-a716-446655440000"
```

Collections are created automatically on first access. You can optionally pass configuration options to control the storage backend and eviction policy (see [Database API](#database-api)).

---

## Collection API

### insertOne

**Signature**  
`collection.insertOne(doc: T, options?: InsertOptions): Promise<WithId<T>>`

Inserts a single document. If `_id` is present it must be a string; duplicates throw `DuplicateKeyError`.  
Pass `ttlMs` inside `options` to set a time‑to‑live (in milliseconds).

```ts
// Auto-generated ID
const doc1 = await users.insertOne({ name: "Bob", age: 25 });

// Custom ID
const doc2 = await users.insertOne({ _id: "custom-id", name: "Charlie", age: 22 });

// With TTL (expires after 1 hour)
await users.insertOne(
  { name: "Session" },
  { ttlMs: 1000 * 60 * 60 }
);
```

### insertMany

**Signature**  
`collection.insertMany(docs: T[], options?: InsertOptions): Promise<WithId<T>[]>`

Inserts multiple documents atomically. Duplicate IDs within the batch or existing in storage cause a `DuplicateKeyError` before any write.

```ts
const newDocs = await users.insertMany([
  { name: "Dana", age: 28 },
  { name: "Evan", age: 35 }
]);
```

### find

**Signature**  
`collection.find(filter?: Filter<T>, options?: FindOptions<T>): Promise<WithId<T>[]>`

Returns all documents matching a filter. Without arguments it returns every document.

**Options**:

| Option | Type | Description |
|--------|------|-------------|
| `sort` | `Record<keyof T, 1 \| -1>` | Sort by one or more fields. `1` for ascending, `-1` for descending. |
| `skip` | `number` | Number of documents to skip (for pagination). |
| `limit` | `number` | Maximum number of documents to return. |
| `projection` | `Record<keyof T, 1 \| 0>` | Inclusive (`1`) or exclusive (`0`) field selection. `_id` is always included. |

```ts
// All documents
const all = await users.find();

// Adults, sorted by age descending, first page of 10
const adults = await users.find(
  { age: { $gte: 18 } },
  {
    sort: { age: -1 },
    skip: 0,
    limit: 10,
    projection: { name: 1, email: 1 }
  }
);
```

### findOne

**Signature**  
`collection.findOne(filter: Filter<T>, options?: FindOptions<T>): Promise<WithId<T> | null>`

Returns the first document that matches the filter, or `null` if nothing matches. Accepts the same `options` as `find`.

```ts
const user = await users.findOne({ name: "Alice" });
if (user) {
  console.log(user.email);
}
```

### updateOne

**Signature**  
`collection.updateOne(filter: Filter<T>, update: Update<T>): Promise<{ matched: boolean; modified: boolean }>`

Updates the first document matching the filter using the specified update operators (see [Update Operators](#update-operators)).  
Returns `matched` (did a document match?) and `modified` (did values actually change?).

```ts
const result = await users.updateOne(
  { name: "Alice" },
  { $set: { age: 31 }, $inc: { loginCount: 1 } }
);
// result = { matched: true, modified: true }
```

**Important:** The `_id` field is immutable and cannot be changed via `$set`.

### replaceOne

**Signature**  
`collection.replaceOne(filter: Filter<T>, replacement: T): Promise<{ matched: boolean; modified: boolean }>`

Replaces the **entire document** that matches the filter with the provided object. The original `_id` is preserved, and if the original document had a TTL (`__expiresAt`) it is kept in the replacement.  
This is useful when you want to swap the whole content while keeping the same identity.

```ts
await users.replaceOne(
  { name: "Alice" },
  { name: "Alicia", age: 32, email: "alicia@example.com" }
);
// _id and __expiresAt are inherited from the original document
```

### deleteOne

**Signature**  
`collection.deleteOne(filter: Filter<T>): Promise<{ deletedCount: number }>`

Deletes the first document matching the filter. Returns the number of deleted documents (0 or 1).

```ts
const result = await users.deleteOne({ name: "Bob" });
// result = { deletedCount: 1 }
```

### count

**Signature**  
`collection.count(): Promise<number>`

Returns the total number of documents in the collection.

```ts
const total = await users.count();
```

### clear

**Signature**  
`collection.clear(): Promise<void>`

Removes all documents from the collection. The collection itself still exists and can be used again.

```ts
await users.clear();
```

---

## Query Syntax

Filters are plain objects where keys correspond to document fields. Values can be literal (exact match) or query operator objects prefixed with `$`.  
Nested objects are compared using a deep equality algorithm (handles `undefined` correctly).

**Comparison operators**

| Operator | Description | Supported Types |
|----------|-------------|-----------------|
| `$eq`    | Deep equality (same as literal value) | Any |
| `$ne`    | Not equal | Any |
| `$gt`    | Greater than | `string`, `number` |
| `$gte`   | Greater than or equal | `string`, `number` |
| `$lt`    | Less than | `string`, `number` |
| `$lte`   | Less than or equal | `string`, `number` |
| `$in`    | Value is in an array | Any |
| `$nin`   | Value is **not** in an array | Any |

**Logical operators**

- `$and` – array of filters, all must match.
- `$or`  – array of filters, at least one must match.

**Example**

```ts
const result = await users.find({
  age: { $gte: 18, $lte: 65 },
  name: { $ne: "Bob" },
  $or: [
    { status: "active" },
    { role: "admin" }
  ]
});
```

Nested object filters are also supported and are compared with deep equality:

```ts
await users.find({ address: { city: "New York" } });
```

---

## Update Operators

Update operators are passed as the second argument to `updateOne`. Multiple operators can be combined in a single call.

| Operator | Description |
|----------|-------------|
| `$set`   | Set the value of a field. If the field does not exist it is created. |
| `$inc`   | Increment a numeric field by a given value. Throws if the field is not a number. |
| `$unset` | Remove a field from the document. Pass `1` or `true` for each field to unset. |
| `$push`  | Append a value to an array field. Creates the array if it does not exist. |
| `$pull`  | Remove all elements from an array that match a value or an object (uses `deepEqual`). |

**Example**

```ts
await users.updateOne(
  { name: "Alice" },
  {
    $set: { status: "premium" },
    $inc: { points: 50 },
    $unset: { tempToken: 1 },
    $push: { tags: "vip" },
    $pull: { tags: "old-tag" }
  }
);
```

---

## Reactive Subscriptions

Subscribe to a filter and receive real‑time updates whenever matching documents are inserted, updated, deleted, or expire (via TTL). The callback fires immediately with the current result.

```ts
const unsubscribe = users.subscribe(
  { status: "active" },
  (activeUsers) => {
    // activeUsers is a fresh array of WithId<User>
    console.log(`Active users: ${activeUsers.length}`);
  }
);

// Later, when the component unmounts
unsubscribe();
```

**Cross‑tab synchronization** works automatically: changes made in one browser tab notify all other tabs using the same collection (via `localStorage` events or `BroadcastChannel`).

**Batch‑aware behavior:** If a subscription is created while a transaction is in progress, the initial data is delivered only after the transaction commits, ensuring consistency.

---

## Transactions

Group multiple write operations across one or more collections into an atomic unit. If any collection fails to commit, all collections are rolled back to their pre‑transaction state.

```ts
await db.transaction(async () => {
  await users.insertOne({ name: "Eve" });
  await orders.deleteOne({ userId: "xyz" });
  // If either operation fails, both are undone
});
```

**How it works:**
- A snapshot of every involved collection is taken before the transaction begins.
- All mutations inside the callback are performed in memory (batched).
- When the callback finishes successfully, all batches are committed to storage.
- If a commit fails, all collections are rolled back and the snapshot is restored.

Nested transactions are not supported; calling `transaction` while another is active throws a `DatabaseError`.

---

## Middleware Hooks

Hooks allow you to intercept and modify documents during CRUD operations. They can be synchronous or asynchronous.

| Hook | Signature | Fires |
|------|-----------|-------|
| `beforeInsert` | `(doc: T) => T \| Promise<T>` | Before a new document is saved |
| `afterInsert`  | `(doc: WithId<T>) => void \| Promise<void>` | After a successful insert |
| `beforeUpdate` | `(doc: WithId<T>) => WithId<T> \| Promise<WithId<T>>` | Before an existing document is modified |
| `afterUpdate`  | `(doc: WithId<T>) => void \| Promise<void>` | After an update completes |
| `beforeDelete` | `(doc: WithId<T>) => void \| Promise<void>` | Before a document is removed |
| `afterDelete`  | `(doc: WithId<T>) => void \| Promise<void>` | After a deletion |

Each hook registration returns an unsubscribe function:

```ts
const removeHook = users.beforeInsert(async (doc) => {
  doc.createdAt = new Date().toISOString();
  return doc;
});

// Remove the hook later
removeHook();
```

---

## Schema Validation

Define a MongoDB‑style `$jsonSchema` to enforce document structure at runtime. Violations throw a `ValidationError` before any write occurs.

```ts
users.setValidator({
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "age"],
    properties: {
      name: { bsonType: "string" },
      age: { bsonType: "number", minimum: 18 },
      email: { bsonType: "string" },
      tags: {
        bsonType: "array",
        items: { bsonType: "string" }
      }
    }
  }
});
```

You can use `bsonType` (MongoDB style) or `type`, which supports `"string"`, `"number"`, `"boolean"`, `"object"`, `"array"`, `"null"`, `"double"`, `"int"`, `"bool"`.  
`required`, `enum`, `minimum`, `maximum`, `items`, and nested `properties` are all supported.

---

## Lifecycle Management

BrowserDB manages underlying storage engines (localStorage and IndexedDB) as well as broadcast channels. To properly release resources or permanently delete data, use the following methods.

**Collection‑level**

- `collection.close()` – Closes the underlying IndexedDB connection and broadcast channel. No data is deleted.
- `collection.destroy(): Promise<void>` – Calls `close()` and permanently deletes all persistent data (including the metadata key).

```ts
users.close();
await users.destroy();
```

**Database‑level**

- `db.dropCollection(name: string): Promise<void>` – Removes a collection entirely (data + metadata) from every storage backend.
- `db.clear(): Promise<void>` – Destroys all collections and removes all BrowserDB keys from localStorage and IndexedDB.

```ts
await db.dropCollection("users");
await db.clear();
```

Both `dropCollection` and `clear` are asynchronous; you must `await` them.

---

## Database API

`new BrowserDB()` creates a new database instance. It requires a browser environment (`window` and `localStorage`).

**Methods**

| Method | Signature | Description |
|--------|-----------|-------------|
| `collection` | `<T>(name: string, options?: CollectionOptions): Collection<T>` | Creates or retrieves a typed collection. |
| `has` | `(name: string): boolean` | Returns `true` if the collection exists (checks both localStorage and IndexedDB metadata). |
| `dropCollection` | `(name: string): Promise<void>` | Permanently removes the collection. |
| `clear` | `(): Promise<void>` | Removes all collections and data. |
| `stats` | `(): Promise<DatabaseStats>` | Returns storage usage and document counts. |
| `storage.info` | `(): Promise<StorageInfo>` | Provides browser‑level storage estimates and available collections. |
| `transaction` | `(callback: () => Promise<void>): Promise<void>` | Runs a group of writes atomically. |

**CollectionOptions**

```ts
interface CollectionOptions {
  backend?: "auto" | "localStorage" | "indexedDB";  // default "auto"
  eviction?: "none" | "ttl" | "lru" | "fifo";      // default "none"
}
```

- `backend`: which storage engine to prefer. `"auto"` starts with localStorage and migrates to IndexedDB on quota pressure.
- `eviction`: automatic data removal strategy when storage is full. `"ttl"` removes documents closest to expiry, `"fifo"` removes oldest first, `"lru"` approximates least‑recently‑used.

```ts
const settings = db.collection<User>("settings", {
  backend: "indexedDB",
  eviction: "lru"
});
```

---

## Error Handling

All errors extend `DatabaseError`. You can import them directly and use `instanceof` checks.

| Error Class | Thrown When |
|-------------|-------------|
| `DatabaseError` | General failure (missing APIs, invalid operations) |
| `QuotaExceededError` | localStorage quota exceeded and migration/eviction failed |
| `DataCorruptionError` | Stored data cannot be parsed |
| `DuplicateKeyError` | A document with the same `_id` already exists |
| `ValidationError` | Document failed `$jsonSchema` validation |

```ts
import { DuplicateKeyError, QuotaExceededError } from "@lkkhwhb/browserdb";

try {
  await users.insertOne({ _id: "existing-id", name: "Test" });
} catch (error) {
  if (error instanceof DuplicateKeyError) {
    console.warn("ID already taken");
  } else if (error instanceof QuotaExceededError) {
    console.error("Storage full");
  } else {
    throw error;
  }
}
```

---

## Storage Statistics

Use `db.stats()` to get a snapshot of storage usage.

```ts
const stats = await db.stats();
console.log(stats);
```

**Return type** (`DatabaseStats`):

| Property | Type | Description |
|----------|------|-------------|
| `usedBytes` | `number` | Estimated bytes occupied by BrowserDB data |
| `usedKB` | `string` | Formatted KB string (e.g. `"2.50 KB"`) |
| `usedMB` | `string` | Formatted MB string (e.g. `"0.01 MB"`) |
| `quotaBytes` | `number` | Total storage quota for the origin (from `navigator.storage.estimate()`) |
| `availableBytes` | `number` | `quotaBytes - usedBytes` |
| `percentUsed` | `string` | Percentage of quota used |
| `collections` | `number` | Number of BrowserDB collections |
| `documents` | `number` | Total number of documents across all collections |

`usedBytes` is calculated by measuring the raw bytes of BrowserDB’s `localStorage` keys (including metadata). The quota values are provided by the browser when available.

**`db.storage.info()`** gives additional backend details:

```ts
const info = await db.storage.info();
// { backend: "hybrid", usedBytes: 1048576, estimatedQuota: 52428800, compressed: true, collections: ["users"] }
```

---

## React Integration

BrowserDB works with any framework. Here is a minimal React hook example using subscriptions.

```tsx
import { useState, useEffect } from "react";
import { BrowserDB, WithId } from "@lkkhwhb/browserdb";

interface Task {
  title: string;
  completed: boolean;
}

const db = new BrowserDB();
const tasks = db.collection<Task>("tasks");

export function TaskList() {
  const [items, setItems] = useState<WithId<Task>[]>([]);

  useEffect(() => {
    // Subscribe to all tasks; the callback fires immediately with current data
    const unsub = tasks.subscribe({}, setItems);
    return unsub; // cleanup on unmount
  }, []);

  const addTask = async (title: string) => {
    await tasks.insertOne({ title, completed: false });
    // no need to manually call setItems — subscription handles it
  };

  return (
    <ul>
      {items.map((task) => (
        <li key={task._id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

For simpler scenarios you can also manually fetch data with `useEffect` + `find()`.

---

## Architecture

The library is composed of single‑responsibility modules:

```
src/
├── types.ts                  # All TypeScript types and interfaces
├── errors.ts                 # Custom error classes
├── utils/
│   ├── uuid.ts               # UUID v4 generation (native crypto + optional fallback)
│   ├── schemaSerializer.ts   # Row‑based JSON compression for localStorage
│   └── utf16Packer.ts        # Binary → UTF‑16 packing for compression streams
├── query.ts                  # Query matching engine (deep equality, operators)
├── engines/
│   ├── HybridStorageEngine.ts    # Orchestrator; handles migration from localStorage to IndexedDB
│   ├── LocalStorageEngine.ts     # Deflate‑compressed localStorage backend
│   └── IndexedDBEngine.ts        # IndexedDB backend with BroadcastChannel sync
├── collection.ts             # CRUD operations, subscriptions, hooks, schema validation, lifecycle
├── database.ts               # Collection management, transactions, statistics, global clear/drop
└── index.ts                  # Public API re‑exports
```

Build outputs:
- **ESM** (`dist/index.mjs`)
- **CommonJS** (`dist/index.js`)
- **IIFE** (`dist/browserdb.global.js`) – for direct browser inclusion

---

## Browser Compatibility

| Browser | Supported |
|---------|-----------|
| Chrome 80+ | ✓ |
| Firefox 75+ | ✓ |
| Safari 13.1+ | ✓ |
| Edge 80+ | ✓ |
| Mobile Chrome | ✓ |
| Mobile Safari | ✓ |
| Internet Explorer | ✗ |
| Node.js (SSR) | ✗ (requires a browser environment) |

---

## Limitations

1. **Storage quota** – The hybrid engine automatically migrates to IndexedDB under pressure, but if forced to `localStorage` only, a `QuotaExceededError` may still be thrown unless an eviction policy is set.

2. **JSON serialisation** – Data is stored as JSON, so some JavaScript types are not preserved:
   - `Date` becomes an ISO 8601 string; queries compare strings, not dates.
   - `Map`, `Set` are serialised as empty objects `{}`.
   - `BigInt` throws a `TypeError` during serialisation.
   - `undefined` fields are omitted; use `null` instead.
   - `Function` values are stripped.

3. **Multi‑tab race conditions** – The `localStorage` backend has no cross‑tab locking mechanism. Concurrent writes from different tabs may result in lost updates. Use the IndexedDB backend for safer concurrent workloads.

4. **Environment** – `window`, `localStorage`, and related Web APIs must be available. It cannot run in Web Workers or server‑side Node.js without polyfills.

---

## Breaking Changes in v2.0

If you are migrating from v1.x, note the following:

- `dropCollection(name)` and `clear()` are now **asynchronous** and return `Promise<void>`. Always `await` them.
- `Collection.close()` and `Collection.destroy()` have been added to properly release resources; in v1.x there was no way to close IndexedDB connections.
- Transactions now implement **snapshot‑based rollback**; previously writes were batched but not rolled back on failure.
- `replaceOne` now preserves the document's TTL (`__expiresAt`) if it existed.
- The internal `StorageEngine` interface requires `close()` and `destroy()` methods; custom engines must implement them.

---

## License

MIT © 2026–present Bhargav

[GitHub Repository](https://github.com/lkkhwhb/browserDB)