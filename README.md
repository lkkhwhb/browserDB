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
    const loadTasks = async () => {
      setTasks(await tasksCollection.find());
    };
    loadTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask = await tasksCollection.insertOne({ title, completed: false });
    setTasks([...tasks, newTask]);
    setTitle("");
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    await tasksCollection.updateOne({ _id: id }, { $set: { completed: !currentStatus } });
    setTasks(await tasksCollection.find());
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
  <title>BrowserDB Demo</title>
  <script src="https://cdn.jsdelivr.net/npm/@lkkhwhb/browserdb@latest/dist/browserdb.global.js"></script>
</head>
<body>
  <h1>BrowserDB Notes</h1>

  <input id="titleInput" type="text" placeholder="Title" />
  <input id="contentInput" type="text" placeholder="Content" />
  <button onclick="addNote()">Insert</button>

  <h2>All Notes</h2>
  <ul id="notesList"></ul>

  <script>
    const db = new window.BrowserDB.BrowserDB();
    const notes = db.collection("notes");

    async function render() {
      const list = document.getElementById("notesList");
      list.innerHTML = "";
      const allNotes = await notes.find();
      allNotes.forEach(n => {
        const li = document.createElement("li");
        li.textContent = n.title + ": " + n.content + " (" + n._id.slice(0,8) + "...)";
        list.appendChild(li);
      });
    }

    async function addNote() {
      const title = document.getElementById("titleInput").value.trim();
      const content = document.getElementById("contentInput").value.trim();
      if (!title) return;
      await notes.insertOne({ title, content });
      document.getElementById("titleInput").value = "";
      document.getElementById("contentInput").value = "";
      render();
    }

    render();
  </script>
</body>
</html>
```

#### unpkg CDN

```html
<script src="https://unpkg.com/@lkkhwhb/browserdb@latest/dist/browserdb.global.js"></script>
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
├── storage.ts         # localStorage async abstraction with native CompressionStream
├── collection.ts      # Collection class providing async document CRUD operations
├── imageStore.ts      # Dedicated Image API with Canvas-based WebP optimization
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
await users.insertOne({
    name: "John",
    age: 25
});

// Query documents
const result = await users.findOne({
    name: "John"
});

console.log(result);
```

---

## CRUD Operations

### Insert One

```ts
await users.insertOne({
    name: "Alice",
    age: 20
});
```

### Insert Many

```ts
await users.insertMany([
    { name: "Alice", age: 20 },
    { name: "Bob", age: 24 }
]);
```

### Find All & Filter

```ts
// Find all documents
const allUsers = await users.find();

// Find matching documents
const adults = await users.find({ age: { $gte: 18 } });
```

### Find One

```ts
const user = await users.findOne({ name: "Alice" });
```

### Update

```ts
await users.updateOne(
    { name: "Alice" },
    { $set: { age: 21 } }
);
```

> Note: Document `_id` is immutable and cannot be altered during update.

### Delete

```ts
await users.deleteOne({ name: "Alice" });
```

### Count & Clear Collection

```ts
const total = await users.count();
await users.clear();
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
const results = await users.find({
    age: { $gte: 18, $lt: 65 }
});
```

---

## Error Handling

BrowserDB exports dedicated exception classes for error management:

```ts
import { DuplicateKeyError, QuotaExceededError, DataCorruptionError } from "@lkkhwhb/browserdb";

try {
    await users.insertOne({ _id: "existing-id", name: "Duplicate" });
} catch (error) {
    if (error instanceof DuplicateKeyError) {
        console.error("Document ID already exists!");
    } else if (error instanceof QuotaExceededError) {
        console.error("localStorage is full!");
    }
}
```

---

## Storage Compression (Auto-Compress)

To mitigate `localStorage`'s ~5MB capacity limits, BrowserDB automatically passes all documents through the browser's native **`CompressionStream` (deflate)** API before saving.
- Reduces JSON size by **60-80%**.
- Turns a 5MB storage limit into **~15-20MB of usable space**.
- Runs transparently without any extra configuration.

---

## Image Optimization API

Storing raw images in `localStorage` quickly consumes quota. BrowserDB provides a dedicated `db.images(name)` API that leverages the HTML `<canvas>` to automatically resize and compress image uploads into highly-efficient `WebP` base64 strings before saving.

```ts
const avatars = db.images("avatars");

const fileInput = document.getElementById("avatarUpload");
fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];

    // Auto-resizes to maxWidth 800px and converts to WebP (quality 0.8)
    await avatars.store("user-1", file, { maxWidth: 800, quality: 0.8 });
    
    // Retrieve base64 Data URL later
    const imgDataUrl = await avatars.get("user-1");
});
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

BrowserDB leverages native browser streams to prevent heavy string operations from blocking the main thread. 

* **Asynchronous Execution:** By using `async/await` for all operations, massive compression streams and stringifications are deferred, keeping the UI perfectly responsive.
* **Fast Reads:** Methods like `findOne` and `find` are heavily optimized. Once decompressed, filtering logic executes at native JavaScript speeds.
* **Storage Compression:** Because `localStorage` quota errors crash standard apps, BrowserDB spends extra CPU cycles dynamically compressing JSON to give you vastly more runway.

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
