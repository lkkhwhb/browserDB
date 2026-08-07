# Collections API

Collections manage individual documents. They provide standard MongoDB-like operations including schema validation, TTL (time-to-live), and middleware hooks.

## Documents and IDs

Every document inserted into a collection must be an object. BrowserDB will automatically assign a cryptographically secure `_id` string to every document using UUID v4.

You may optionally provide your own `_id`. If an ID already exists, a `DuplicateKeyError` will be thrown.

## Core Operations

- **`insertOne(doc, options?)`**: Insert a single document.
- **`insertMany(docs[], options?)`**: Insert multiple documents.
- **`count()`**: Get the total number of documents in the collection.
- **`clear()`**: Wipe all documents from this specific collection.

```typescript
const users = db.collection("users");
const newDoc = await users.insertOne({ name: "Bob" });
console.log(newDoc._id); // "b8b8-4f81..."
```

## TTL (Time To Live)

Documents can be configured to automatically expire and safely evict themselves.

```typescript
// This document will only exist for 5 seconds
await users.insertOne({ name: "Temporary Guest" }, { ttlMs: 5000 });
```

## Schema Validation

You can enforce strict, runtime data validation using the standard `$jsonSchema` specification. If a document fails validation during insert or update, a `ValidationError` is thrown.

```typescript
users.setValidator({
    $jsonSchema: {
        type: "object",
        required: ["name", "age"],
        properties: {
            name: { type: "string" },
            age: { type: "number", minimum: 18 }
        }
    }
});

// Throws ValidationError (age < 18)
await users.insertOne({ name: "Tim", age: 12 });
```

## Middleware Hooks

Hooks allow you to execute code or manipulate data immediately before or after an operation occurs. All hooks can be asynchronous. 

You can bind hooks to `beforeInsert`, `afterInsert`, `beforeUpdate`, `afterUpdate`, `beforeDelete`, and `afterDelete`.

```typescript
// Automatically attach a timestamp to every document before saving
users.beforeInsert((doc) => {
    return { ...doc, createdAt: Date.now() };
});

// React after an update happens
users.afterUpdate((doc) => {
    console.log(`Document ${doc._id} was successfully updated.`);
});
```

*Note: Calling a hook attachment function returns a cleanup closure you can execute to detach the hook later.*
