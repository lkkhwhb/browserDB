# Welcome to the BrowserDB Wiki

BrowserDB is a lightweight, MongoDB-inspired document database built entirely on top of the browser's storage engines (`localStorage` and `IndexedDB`). It provides a clean, strongly typed API for storing and querying JSON documents without dealing directly with `localStorage` limits or manual serialization.

## Features at a Glance
- **MongoDB-Inspired API**: Intuitive collections, queries, updates, and filtering.
- **Hybrid Storage Engine**: Automatically fallback from `localStorage` to `IndexedDB` when storage limits are reached.
- **Auto-Compression**: Documents are automatically compressed using `CompressionStream` and a custom UTF-16 bit-packer, heavily expanding your usable storage limit.
- **Schema Validation**: Built-in runtime `$jsonSchema` validation to enforce strict data shapes.
- **Middleware Hooks**: Add `beforeInsert`, `afterUpdate`, and more to track or alter changes.
- **Reactive Subscriptions**: Automatically sync UIs across tabs in real-time when data changes.
- **Transactions & Batching**: Safely execute batch writes with rollback capabilities.
- **Gallery API**: Easily store binary files/blobs and retrieve them directly as object URLs.

## Quick Start

### Installation

```bash
npm install @lkkhwhb/browserdb
```

### Basic Example

```typescript
import { BrowserDB } from "@lkkhwhb/browserdb";

// 1. Initialize Database
const db = new BrowserDB();

// 2. Access a Collection
const users = db.collection("users");

// 3. Insert Documents
await users.insertOne({ name: "Alice", age: 28 });
await users.insertOne({ name: "Bob", age: 34 });

// 4. Query Documents
const adults = await users.find({ age: { $gte: 30 } });
console.log(adults); // [{ _id: "...", name: "Bob", age: 34 }]

// 5. Update Documents
await users.updateOne({ name: "Alice" }, { $inc: { age: 1 } });
```

## Table of Contents
- [Home](Home)
- [Database](Database)
- [Collections](Collections)
- [Queries and Updates](Queries-and-Updates)
- [Storage Engines](Storage-Engines)
- [Subscriptions](Subscriptions)
- [Gallery API](Gallery)
