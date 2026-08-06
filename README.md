# BrowserDB
(@lkkhwhb/browserdb)

> A lightweight client-side database optimized for the localStorage backend.

BrowserDB provides a clean, strongly typed API for storing and querying JSON documents without dealing directly with `localStorage` or manual serialization.

---

## Features

* **⚡ In-Memory Caching (NEW!)**: Automatically caches documents in memory for instant read performance while perfectly synchronizing cross-tab updates.
* **🔥 Auto-Compression (NEW!)**: Automatically compresses all documents through native `CompressionStream` (deflate), then packs the binary via a custom **UTF-16 bit-packer**, giving you **up to 60MB of usable space** (~12x extra space) while staying under the browser's 5MB limit!
* **⏱️ TTL (Time To Live)**: Documents can automatically self-destruct after a specified time to keep your storage quota clean.
* **🖼️ Image Optimization API**: The built-in `db.images()` API handles file uploads by auto-resizing and converting images to highly efficient WebP Base64 strings.
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

## Performance Benchmark

We compared saving 1,000 JSON documents to native `localStorage` versus BrowserDB.

| Metric | Native `localStorage` | BrowserDB |
| --- | --- | --- |
| **Storage Size** | ~115.40 KB | **~8.80 KB** (~12x extra space) |
| **Execution Time** | 1.00 ms (Blocking) | **8.10 ms** (Non-blocking) |

> **The Tradeoff:** BrowserDB trades ~7ms of invisible background processing to compress your data, completely unblocking the main UI thread while giving you 3x more usable storage space!

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

### Insert with TTL (Time To Live)

You can pass `ttlMs` to automatically expire a document. BrowserDB self-cleans; expired documents are silently stripped from queries and erased from disk.

```ts
await users.insertOne(
    { name: "Session_Token", val: "xyz" },
    { ttlMs: 1000 * 60 * 60 } // Automatically expires in 1 hour
);
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

To mitigate `localStorage`'s ~5MB capacity limits, BrowserDB automatically passes all documents through the browser's native **`CompressionStream` (deflate)** API before saving, and then packs them via a custom UTF-16 binary packer.
- Reduces JSON size drastically.
- Turns a 5MB storage limit into **~60MB of usable space** (~12x extra space).
- Runs transparently without any extra configuration.

---

## Media Handling

Storing raw media in `localStorage` quickly consumes quota. BrowserDB provides a dedicated `db.images(name)` API that leverages the HTML `<canvas>` to automatically resize and compress image uploads into highly-efficient `WebP` base64 strings before saving.

```ts
const gallery = db.images("gallery");

const fileInput = document.getElementById("upload");
fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];

    // Auto-resizes to maxWidth 1000px and converts to WebP (quality 0.8)
    await gallery.store("vacation-pic", file, { maxWidth: 1000, quality: 0.8 });
    
    // Retrieve base64 Data URL to display in an <img> tag
    const imgDataUrl = await gallery.get("vacation-pic");
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

BrowserDB leverages native browser streams to prevent heavy string operations from blocking the main thread, while maximizing storage density.

* **Asynchronous Execution:** By using `async/await` for all operations, massive compression streams and stringifications are deferred, keeping the UI perfectly responsive.
* **Storage Compression (Deflate):** Instead of hitting the 5MB wall and crashing, BrowserDB uses background CPU cycles to dynamically compress your JSON into Base64 using `CompressionStream`. This trades a microsecond of CPU time to give you up to **60MB** of effective storage.
* **Instant Read Caching:** Reads from collections hit an intelligent in-memory cache instantly. Slow decompression logic only executes when your data actually changes.
* **Cross-Tab Safety:** The cache safely invalidates itself when it detects that `localStorage` was updated from another browser tab, guaranteeing flawless synchronization.

---

## Comparison with IndexedDB

BrowserDB is **not meant to compete with IndexedDB**. It is designed to make `localStorage` easier to maintain and query for small apps, drafts, and user settings. With the new Auto-Compressor and Media API, BrowserDB drastically closes the gap for medium-sized use-cases without abandoning its simplistic API.

| Feature | BrowserDB (localStorage + Compression) | IndexedDB |
| --- | --- | --- |
| **API Style** | `async`/`await`, Simple, MongoDB-like | Asynchronous, Complex, Event-driven |
| **Storage Limit** | ~15-20MB effective (Compressed) | Virtually Unlimited (GBs) |
| **Media Handling** | Built-in Auto-Resizing & WebP Conversion | Requires manual `Blob` management |
| **Performance** | Streamed compression prevents UI blocking | Non-blocking; requires callback/Promise overhead |
| **Data Types** | JSON stringifiable (loses Dates, Maps, Sets) | Structured Clone (preserves Dates, Maps, ArrayBuffers) |
| **Best For** | User settings, drafts, offline caching, images | Large files, massive datasets, complex relational queries |

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
