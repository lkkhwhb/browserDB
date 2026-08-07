# Database API

The `BrowserDB` class is the main entry point to your database. It manages collections, galleries, statistics, and transactions.

## Initialization

```typescript
import { BrowserDB } from "@lkkhwhb/browserdb";

const db = new BrowserDB();
```

## Retrieving Collections and Galleries

You can safely request collections and galleries dynamically. BrowserDB manages their lifecycle internally.

```typescript
// Get a standard document collection
const users = db.collection<{ name: string }>("users");

// Get a gallery for storing binary blob files
const avatars = db.gallery("avatars");
```

You can optionally configure a collection's storage backend and eviction policy:

```typescript
const logs = db.collection("logs", { 
    backend: "indexedDB", 
    eviction: "fifo" 
});
```

## Transactions

BrowserDB supports pseudo-two-phase commit transactions. A transaction takes a snapshot of all involved collections and runs the writes in a batch. If anything fails (e.g. quota limits, duplicate keys), all collections are automatically restored to their exact state prior to the transaction.

```typescript
await db.transaction(async () => {
    await users.insertOne({ name: "Alice" });
    await stats.updateOne({}, { $inc: { userCount: 1 } });
});
```

*Note: Nested transactions are not supported and will throw an error.*

## Dropping and Clearing Data

- **`db.has(name)`**: Returns a boolean indicating if a collection exists.
- **`await db.dropCollection(name)`**: Completely wipes a collection and its associated gallery from memory, `localStorage`, and `IndexedDB`.
- **`await db.clear()`**: Drops absolutely everything associated with BrowserDB from the origin.

```typescript
if (db.has("users")) {
    await db.dropCollection("users");
}

// Clear the whole DB
await db.clear();
```

## Storage Statistics

BrowserDB can provide accurate metrics about your database's footprint on the client device.

```typescript
const stats = await db.stats();
console.log(stats.percentUsed); // e.g., "4.50%"
console.log(stats.documents);   // Total number of documents

const info = await db.storage.info();
console.log(info.compressed);   // Are we using CompressionStream?
```
