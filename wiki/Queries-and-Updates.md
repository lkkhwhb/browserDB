# Queries and Updates

BrowserDB implements a subset of the MongoDB query and update operators to cleanly target and manipulate your documents.

## Find

- **`findOne(filter, options?)`**: Returns the first document that matches the filter, or `null`.
- **`find(filter, options?)`**: Returns an array of all matching documents.

### Query Operators

BrowserDB supports deep equal matching via object literals, as well as the following operators:
- `$eq`, `$ne`
- `$gt`, `$gte`, `$lt`, `$lte`
- `$in`, `$nin`
- Logical `$and`, `$or`

```typescript
// Find users over 18 but under 65
const users = await db.collection("users").find({
    age: { $gte: 18, $lt: 65 }
});

// Find admins OR moderators
const staff = await db.collection("users").find({
    $or: [
        { role: "admin" },
        { role: "moderator" }
    ]
});
```

### Find Options

You can control pagination and shape using `FindOptions`:
- **`sort`**: `{ field: 1 }` (ascending) or `{ field: -1 }` (descending)
- **`skip`**: Number of documents to skip.
- **`limit`**: Maximum number of documents to return.
- **`projection`**: Include (`1`) or exclude (`0`) fields.

```typescript
const top10Scores = await db.collection("scores").find({}, {
    sort: { score: -1 },
    limit: 10,
    projection: { _id: 0, player: 1, score: 1 }
});
```

## Updates

- **`updateOne(filter, update)`**: Updates the first matching document. Returns `{ matched: boolean, modified: boolean }`.
- **`replaceOne(filter, document)`**: Completely overwrites the first matching document (preserving the `_id` and any `__expiresAt` TTL).

### Update Operators

BrowserDB supports the following mutation operators:
- `$set`: Set the value of a field.
- `$unset`: Delete a field entirely.
- `$inc`: Increment a numeric field by a given amount.
- `$push`: Append a value to an array.
- `$pull`: Remove a value from an array.

```typescript
await db.collection("users").updateOne({ name: "Bob" }, {
    $set: { status: "active" },
    $inc: { loginCount: 1 },
    $push: { accessLogs: Date.now() },
    $unset: { temporaryFlag: 1 }
});
```

## Deletions

- **`deleteOne(filter)`**: Deletes the first matching document. Returns `{ deletedCount: number }`.

```typescript
await db.collection("users").deleteOne({ name: "Spammer" });
```
