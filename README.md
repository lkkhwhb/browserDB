# BrowserDB
(@lkkhwhb/browserdb)

> A lightweight, MongoDB-inspired document database built on top of the browser's `localStorage`.

BrowserDB provides a clean, strongly typed API for storing and querying JSON documents without dealing directly with `localStorage` or manual serialization.

---

## Features

* **Zero External Config**: Works out of the box in modern browsers, Vite (React TS / JS), Next.js, and vanilla applications.
* **Direct CDN Support**: Import via standard HTML `<script>` tags (`window.BrowserDB`).
* **Modular Architecture**: Cleanly architected into single-responsibility modules in `src/`.
* **MongoDB-Inspired API**: Intuitive collections and query filtering.
* **Cryptographically Secure UUIDs**: Uses official `uuid` (v4) with `crypto.randomUUID` fallback.
* **Automatic Serialization**: Handles JSON parsing/stringify seamlessly.
* **Strong TypeScript Support**: Complete type safety for document structures.
* **Custom Error Classes**: Specific error types for quota exceeded, corruption, duplicates, etc.
* **Storage Statistics**: Introspect collection sizes, total documents, and quota metrics.

---

## Installation & Import Options

### 1. NPM / Vite / React (TypeScript & JavaScript)

Install via npm:

```bash
npm install @lkkhwhb/browserdb
```

#### React (TypeScript) Component Example

```tsx
import React, { useState, useEffect } from "react";
import { BrowserDB, WithId } from "@lkkhwhb/browserdb";

interface Task {
  title: string;
  completed: boolean;
}

const db = new BrowserDB();
const tasksCollection = db.collection<Task>("tasks");

export const TaskApp: React.FC = () => {
  const [tasks, setTasks] = useState<WithId<Task>[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTasks(tasksCollection.find());
  }, []);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask = tasksCollection.insertOne({ title, completed: false });
    setTasks([...tasks, newTask]);
    setTitle("");
  };

  const toggleTask = (id: string, currentStatus: boolean) => {
    tasksCollection.updateOne({ _id: id }, { $set: { completed: !currentStatus } });
    setTasks(tasksCollection.find());
  };

  return (
    <div>
      <h2>Task Manager (BrowserDB + React TS)</h2>
      <form onSubmit={addTask}>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="New Task..." 
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task._id} onClick={() => toggleTask(task._id, task.completed)}>
            <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

### 2. Direct CDN Access (Vanilla HTML / Browser Scripts)

Import directly into any HTML page using a CDN link (jsDelivr or unpkg). No bundler or build step required!

#### jsDelivr CDN

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BrowserDB CDN Example</title>
  <!-- Load BrowserDB Standalone CDN Bundle from jsDelivr -->
  <script src="https://cdn.jsdelivr.net/npm/@lkkhwhb/browserdb/dist/browserdb.global.js"></script>
</head>
<body>
  <h1>BrowserDB CDN Quickstart</h1>

  <script>
    // Access BrowserDB from window global
    const db = new window.BrowserDB.BrowserDB();
    const notes = db.collection("notes");

    notes.insertOne({ title: "My First Note", content: "Hello World!" });
    console.log("Notes in BrowserDB:", notes.find());
  </script>
</body>
</html>
```

#### unpkg CDN

```html
<script src="https://unpkg.com/@lkkhwhb/browserdb/dist/browserdb.global.js"></script>
```

---

## Architecture Overview

The `src/` directory is split into modular components for high maintainability:

```
src/
├── types.ts           # Document, Filter, Update, QueryOperators, DatabaseStats types
├── errors.ts          # DatabaseError, QuotaExceededError, DataCorruptionError, DuplicateKeyError
├── utils/
│   └── uuid.ts        # Secure UUID generator using official uuid package & crypto.randomUUID
├── query.ts           # Query matching engine ($gt, $gte, $lt, $lte, $ne, literal equality)
├── storage.ts         # localStorage abstraction with JSON error handling
├── collection.ts      # Collection class providing document CRUD operations
├── database.ts        # Main BrowserDB class managing collections & database stats
└── index.ts           # Main entry point re-exporting all modules
```

---

## Quick Start

```ts
import { BrowserDB } from "@lkkhwhb/browserdb";

type User = {
    name: string;
    age: number;
};

const db = new BrowserDB();
const users = db.collection<User>("users");

// Insert a document
users.insertOne({
    name: "John",
    age: 25
});

// Query documents
const result = users.findOne({
    name: "John"
});

console.log(result);
```

---

## CRUD Operations

### Insert One

```ts
users.insertOne({
    name: "Alice",
    age: 20
});
```

### Insert Many

```ts
users.insertMany([
    { name: "Alice", age: 20 },
    { name: "Bob", age: 24 }
]);
```

### Find All & Filter

```ts
// Find all documents
const allUsers = users.find();

// Find matching documents
const adults = users.find({ age: { $gte: 18 } });
```

### Find One

```ts
const user = users.findOne({ name: "Alice" });
```

### Update

```ts
users.updateOne(
    { name: "Alice" },
    { $set: { age: 21 } }
);
```

> Note: Document `_id` is immutable and cannot be altered during update.

### Delete

```ts
users.deleteOne({ name: "Alice" });
```

### Count & Clear Collection

```ts
const total = users.count();
users.clear();
```

---

## Query Operators

Supported query comparison operators:

| Operator | Description           | Supported Types   |
| -------- | --------------------- | ----------------- |
| `$ne`    | Not equal             | All primitive     |
| `$gt`    | Greater than          | Number, String    |
| `$gte`   | Greater than or equal | Number, String    |
| `$lt`    | Less than             | Number, String    |
| `$lte`   | Less than or equal    | Number, String    |

Example:

```ts
const results = users.find({
    age: { $gte: 18, $lt: 65 }
});
```

---

## Error Handling

BrowserDB exports dedicated exception classes for error management:

```ts
import { DuplicateKeyError, QuotaExceededError, DataCorruptionError } from "@lkkhwhb/browserdb";

try {
    users.insertOne({ _id: "existing-id", name: "Duplicate" });
} catch (error) {
    if (error instanceof DuplicateKeyError) {
        console.error("Document ID already exists!");
    } else if (error instanceof QuotaExceededError) {
        console.error("localStorage is full!");
    }
}
```

---

## Storage Statistics & Estimation

Get detailed breakdown of memory and collection usage:

```ts
const stats = await db.stats();
console.log(stats);
```

Returns:

```ts
{
    usedBytes: 1024,
    usedKB: "1.00 KB",
    usedMB: "0.00 MB",
    quotaBytes: 5242880,
    availableBytes: 5241856,
    percentUsed: "0.02%",
    collections: 2,
    documents: 15
}
```

### How Storage Estimation Works
- **BrowserDB Byte Size**: Iterates over all `browserdb_` prefixed keys in `localStorage` and calculates UTF-8 byte lengths via `TextEncoder`.
- **Origin Quota Estimation**: Queries `navigator.storage.estimate()` (when supported by the browser) to determine total available disk quota allocated to the web origin.

---

## Performance

BrowserDB is highly optimized for synchronous read and write operations. Because `localStorage` operations are blocking, performance is critical to prevent UI stutter.

* **Fast Reads:** Methods like `findOne` and `find` are optimized to iterate efficiently. Once documents are retrieved, filtering logic executes at native JavaScript speeds.
* **Batched Writes:** The `insertMany` method validates and serializes documents simultaneously before writing, minimizing consecutive I/O bottlenecks.
* **Lightweight:** Without the overhead of asynchronous events, Promises, or structured cloning found in IndexedDB, small to medium operations execute in less than a millisecond.

---

## Comparison with IndexedDB

BrowserDB is **not meant to compete with IndexedDB**. Instead, it is designed to make `localStorage` easier to maintain and query for small apps, drafts, and user settings. While BrowserDB provides an incredibly fast and simple developer experience, it solves a completely different problem than IndexedDB.

| Feature | BrowserDB (localStorage) | IndexedDB |
| --- | --- | --- |
| **API Style** | Synchronous, Simple, MongoDB-like | Asynchronous, Complex, Event-driven |
| **Storage Limit** | ~5 MB per origin | Virtually Unlimited (GBs) |
| **Performance** | Instant for small datasets; can block main thread on huge reads | Non-blocking; requires callback/Promise overhead |
| **Data Types** | JSON stringifiable (loses Dates, Maps, Sets) | Structured Clone (preserves Dates, Maps, ArrayBuffers) |
| **Best For** | User settings, drafts, offline caching, small apps | Large files, massive datasets, complex relational queries |

---

## Limitations & Where BrowserDB Will NOT Work

1. **Non-Browser / Server-Side Environments (SSR / Node.js)**:
   - BrowserDB requires browser `window` and `localStorage`. Running directly on a Node.js server or during Next.js SSR without polyfilling `localStorage` will throw a `DatabaseError`.
2. **Browser Storage Quota Limits (~5 MB)**:
   - Browsers enforce a ~5 MB limit per origin for `localStorage`. Exceeding this limit throws `QuotaExceededError`. For multi-gigabyte client databases, consider IndexedDB.
3. **Private / Incognito Storage Blocking**:
   - Some legacy mobile browsers or strict iframe privacy modes block `localStorage` access entirely, causing instantiation to fail.
4. **Unsupported Complex JavaScript Types**:
   - Because BrowserDB serializes data using JSON, standard JSON serialization limitations apply:
     - `Date` objects deserialize as strings.
     - `Map`, `Set`, `BigInt`, `Symbol`, `Function`, `undefined`, and class instances are not preserved.

---

## License

Copyright (c) 2026–present lkkhwhb

Licensed under the [MIT License](LICENSE).

[GitHub Repository](https://github.com/lkkhwhb/browserDB)
