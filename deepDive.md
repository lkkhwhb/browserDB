# BrowserDB

> A lightweight, MongoDB-inspired document database designed specifically for modern browsers.


# Table of Contents

- [BrowserDB](#browserdb)
- [Why BrowserDB?](#why-browserdb)
- [Philosophy](#philosophy)
  - [Browser First](#1-browser-first)
  - [JSON Documents](#2-json-documents)
  - [Familiar APIs](#3-familiar-apis)
  - [Safe By Default](#4-safe-by-default)
  - [Zero Configuration](#5-zero-configuration)
- [Features](#features)
  - [Hybrid Storage Engine](#hybrid-storage-engine)
  - [MongoDB-Inspired Query Engine](#mongodb-inspired-query-engine)
  - [Automatic Compression](#automatic-compression)
  - [Transactions](#transactions)
  - [Reactive Collections](#reactive-collections)
  - [JSON Schema Validation](#json-schema-validation)
  - [Middleware Hooks](#middleware-hooks)
  - [Automatic Document Expiration](#automatic-document-expiration)
  - [Gallery API](#gallery-api)
  - [TypeScript First](#typescript-first)
- [Installation](#installation)
  - [npm](#npm)
  - [pnpm](#pnpm)
  - [Yarn](#yarn)
  - [Bun](#bun)
- [Importing](#importing)
- [Your First Database](#your-first-database)
- [Your First Document](#your-first-document)
- [Finding Documents](#finding-documents)
- [Updating Documents](#updating-documents)
- [Deleting Documents](#deleting-documents)

---

## Core Concepts

- [Collection API](#collection-api)
  - [Creating Collections](#creating-collections)
  - [Collection Names](#collection-names)
  - [Generic Types](#generic-types)
  - [Collection Options](#collection-options)
  - [Storage Backends](#choosing-a-backend)
  - [Eviction Policies](#eviction-policies)
  - [Document Lifetime](#document-lifetime)
  - [Internal Metadata](#internal-metadata)
  - [Deep Cloning](#deep-cloning)
  - [Thread Safety](#thread-safety)
  - [Fast `_id` Lookups](#fast-_id-lookups)
  - [Collection Lifecycle](#collection-lifecycle)
  - [Best Practices](#best-practices)

---

## CRUD Operations

- [CRUD Operations](#crud-operations)

### Create
- [`insertOne()`](#insertone)
- [`insertMany()`](#insertmany)

### Read
- [`find()`](#find)
- [`findOne()`](#findone)
- [Find Options](#find-options)
- [Sorting](#sorting)
- [Pagination](#pagination)
- [Projection](#projection)

### Update
- [`updateOne()`](#updateone)
- [Update Operators](#update-operators)
  - [`$set`](#set)
  - [`$inc`](#inc)
  - [`$unset`](#unset)
  - [`$push`](#push)
  - [`$pull`](#pull)
- [`replaceOne()`](#replaceone)

### Delete
- [`deleteOne()`](#deleteone)
- [`count()`](#count)
- [`clear()`](#clear)
- [Collection Lifetime](#collection-lifetime)

---

## Query Engine

- [Query Engine](#query-engine)
- [Filters](#filters)
- [Equality Matching](#equality-matching)
- [Comparison Operators](#comparison-operators)
  - [`$eq`](#eq)
  - [`$ne`](#ne)
  - [`$gt`](#gt)
  - [`$gte`](#gte)
  - [`$lt`](#lt)
  - [`$lte`](#lte)
  - [`$in`](#in)
  - [`$nin`](#nin)
- [Logical Operators](#logical-operators)
  - [`$and`](#and)
  - [`$or`](#or)
- [Deep Equality](#deep-equality)
- [Performance Considerations](#performance-considerations)

---

## Transactions

- [Transactions](#transactions)
- [Creating a Transaction](#creating-a-transaction)
- [Snapshot Backups](#snapshot-backups)
- [Batch Mode](#batch-mode)
- [Deferred Writes](#deferred-writes)
- [Deferred Subscriptions](#deferred-subscriptions)
- [Cross-Collection Transactions](#cross-collection-transactions)
- [Automatic Rollback](#automatic-rollback)
- [Nested Transactions](#nested-transactions)
- [Performance](#performance)

---

## Reactive Subscriptions

- [Reactive Subscriptions](#reactive-subscriptions)
- [Creating a Subscription](#creating-a-subscription)
- [Filtered Subscriptions](#filtered-subscriptions)
- [Cross-Tab Synchronization](#cross-tab-synchronization)
- [Subscription Lifecycle](#subscription-lifecycle)

---

## Hybrid Storage Engine

- [Hybrid Storage Engine](#hybrid-storage-engine)
- [Why Hybrid Storage?](#why-hybrid-storage)
- [Automatic Mode](#automatic-mode)
- [localStorage Mode](#localstorage-mode)
- [IndexedDB Mode](#indexeddb-mode)
- [Automatic Migration](#automatic-migration)
- [Quota Handling](#quota-handling)
- [Storage Isolation](#storage-isolation)

---

## Compression & Serialization

- [Compression & Serialization](#compression--serialization)
- [Schema-Aware Serialization](#schema-aware-serialization)
- [Optional Compression](#optional-compression)
- [UTF-16 Packing](#utf-16-packing)
- [Compression Pipeline](#complete-storage-pipeline)
- [Performance](#performance-1)

---

## Schema Validation

- [Schema Validation](#schema-validation)
- [Creating a Validator](#creating-a-validator)
- [Required Fields](#required-fields)
- [Primitive Types](#primitive-types)
- [Nested Objects](#nested-objects)
- [Arrays](#arrays)
- [Enumerations](#enumerations)
- [Numeric Constraints](#numeric-constraints)
- [Validation During Updates](#validation-during-updates)

---

## Middleware & Hooks

- [Middleware & Hooks](#middleware--hooks)
- [Available Hooks](#available-hooks)
- [`beforeInsert()`](#beforeinsert)
- [`afterInsert()`](#afterinsert)
- [`beforeUpdate()`](#beforeupdate)
- [`afterUpdate()`](#afterupdate)
- [`beforeDelete()`](#beforedelete)
- [`afterDelete()`](#afterdelete)
- [Execution Order](#execution-order)
- [Middleware & Transactions](#middleware-and-transactions)

---

## Gallery API

- [Gallery API](#gallery-api)
- [Creating a Gallery](#creating-a-gallery)
- [Storing Files](#storing-files)
- [Retrieving Files](#retrieving-files)
- [Replacing Files](#replacing-files)
- [Deleting Files](#deleting-files)
- [Listing Stored Files](#listing-stored-files)
- [Storage Architecture](#storage-architecture)
- [Typical Workflow](#typical-workflow)

---

## Error Handling

- [Error Handling & Exceptions](#error-handling--exceptions)
- [DuplicateKeyError](#duplicatekeyerror)
- [ValidationError](#validationerror)
- [DatabaseError](#databaseerror)
- [TransactionError](#transactionerror)
- [QuotaExceededError](#quotaexceedederror)
- [DataCorruptionError](#datacorruptionerror)
- [Recovery Strategy](#recovery-strategy)

---

## Internal Architecture

- [How BrowserDB Works Internally](#how-browserdb-works-internally)
- [High-Level Architecture](#high-level-architecture)
- [Insert Pipeline](#insert-pipeline)
- [Internal Mutex](#internal-mutex)
- [Validation Layer](#validation-layer)
- [Middleware Layer](#middleware-layer)
- [Query Engine](#query-engine-1)
- [Transaction Manager](#transaction-manager)
- [Subscription Manager](#subscription-manager)
- [Storage Layer](#storage-layer)
- [Compression Pipeline](#compression-pipeline)
- [Memory Model](#memory-model)
- [Design Principles](#design-principles)
- [Putting Everything Together](#putting-everything-together)
- [Final Thoughts](#final-thoughts)


BrowserDB is an offline-first document database that brings many of the conveniences of server-side databases directly into the browser. It combines the simplicity of JSON documents with automatic storage management, reactive data synchronization, schema validation, transactions, hybrid storage, and efficient compression—all without requiring a backend server.

Unlike wrappers around `localStorage`, BrowserDB is a complete persistence layer capable of managing thousands of documents while transparently handling browser storage limitations and synchronizing changes across browser tabs.

Whether you're building a Progressive Web App (PWA), an offline note-taking application, a shopping cart, a dashboard, or a fully client-side SaaS prototype, BrowserDB provides a familiar and expressive API inspired by MongoDB while remaining lightweight enough to ship directly to users.

---

# Why BrowserDB?

Most browser storage libraries solve only one problem.

Some wrap **localStorage**.

Some wrap **IndexedDB**.

Others provide reactive state but no persistence.

Some offer persistence but lack validation.

Some provide querying but no transactions.

BrowserDB was designed to combine all of these capabilities into a single cohesive database.

Instead of forcing developers to choose between multiple libraries, BrowserDB provides a unified document database that includes:

- Document-oriented storage
- MongoDB-inspired queries
- Automatic storage backend selection
- Transactions
- JSON Schema validation
- Middleware hooks
- Cross-tab synchronization
- Binary file storage
- Automatic document expiration
- Built-in compression
- Storage quota recovery
- TypeScript support

The result is a database that feels familiar to backend developers while remaining optimized for the unique constraints of browsers.

---

# Philosophy

BrowserDB is built around several design principles.

## 1. Browser First

Every feature exists because browsers have limitations.

Instead of pretending those limitations don't exist, BrowserDB embraces them and provides solutions.

For example:

- localStorage is fast but small.
- IndexedDB is powerful but verbose.
- BrowserDB automatically combines both.

---

## 2. JSON Documents

Instead of forcing developers into relational tables, BrowserDB stores ordinary JavaScript objects.

```ts
await users.insertOne({
    name: "Alice",
    age: 24,
    online: true
});
```

If you already understand JavaScript objects, you already understand BrowserDB documents.

---

## 3. Familiar APIs

The query language intentionally resembles MongoDB.

```ts
await users.find({
    age: {
        $gte: 18
    },
    status: "active"
});
```

The goal isn't to copy MongoDB perfectly.

The goal is to make BrowserDB immediately understandable to developers who have previously worked with MongoDB.

---

## 4. Safe By Default

BrowserDB attempts to prevent many common mistakes automatically.

Examples include:

- Automatic UUID generation
- Duplicate key detection
- Schema validation
- Transaction rollback
- Deep cloning returned documents
- Storage corruption detection
- Automatic migration
- Type-safe comparisons

The safest behaviour should also be the default behaviour.

---

## 5. Zero Configuration

Creating a database should require almost no setup.

```ts
const db = new BrowserDB();

const users = db.collection<User>("users");
```

That's enough to start storing data.

No migrations.

No schemas.

No configuration files.

No server.

---

# Features

BrowserDB is considerably more than a localStorage wrapper.

## Hybrid Storage Engine

BrowserDB intelligently combines two browser persistence mechanisms.

| Storage | Purpose |
|---------|----------|
| localStorage | Extremely fast document storage |
| IndexedDB | Large persistent datasets |

Collections can explicitly choose a backend or allow BrowserDB to decide automatically.

When configured with the default `"auto"` backend, BrowserDB initially stores documents in compressed localStorage.

If browser quota limits are reached, the collection transparently migrates into IndexedDB without requiring application code to change.

This allows applications to begin lightweight while scaling to significantly larger datasets.

---

## MongoDB-Inspired Query Engine

BrowserDB supports expressive document queries using familiar operators.

Supported operators include:

- `$eq`
- `$ne`
- `$gt`
- `$gte`
- `$lt`
- `$lte`
- `$in`
- `$nin`
- `$and`
- `$or`

Example:

```ts
const adults = await users.find({
    age: {
        $gte: 18
    },
    role: {
        $in: ["admin", "editor"]
    }
});
```

Unlike JavaScript comparisons, BrowserDB intentionally avoids implicit type coercion to produce predictable results.

---

## Automatic Compression

Browser storage is limited.

Instead of storing raw JSON directly, BrowserDB compresses data before writing it.

Internally this includes several optimizations:

- Schema-aware serialization
- Row-based encoding
- Deflate compression (when supported)
- UTF-16 binary packing for localStorage

The result is significantly smaller storage usage compared to storing raw JSON strings.

Compression happens automatically and requires no configuration.

---

## Transactions

Multiple write operations can be grouped into a single atomic transaction.

```ts
await db.transaction(async () => {

    await users.insertOne({
        name: "Alice"
    });

    await orders.deleteOne({
        orderId: 101
    });

});
```

If any operation fails, BrowserDB restores every involved collection to its previous state.

Applications never observe partially completed transactions.

---

## Reactive Collections

Applications often need to update immediately when data changes.

BrowserDB collections can be observed using subscriptions.

```ts
users.subscribe(
    {
        online: true
    },
    users => {

        render(users);

    }
);
```

Whenever matching documents change, subscribers automatically receive updated results.

Changes made in another browser tab are also propagated automatically.

---

## JSON Schema Validation

Collections can enforce document structure using JSON Schema.

```ts
users.setValidator({

    $jsonSchema: {

        required: ["name"],

        properties: {

            name: {

                bsonType: "string"

            }

        }

    }

});
```

Invalid documents are rejected before they are written to storage.

---

## Middleware Hooks

Lifecycle hooks make it possible to intercept operations.

Examples include:

- Creating timestamps
- Audit logging
- Authentication
- Automatic field generation
- Soft deletes

Hooks exist for insert, update and delete operations.

---

## Automatic Document Expiration

Documents may optionally expire after a specified duration.

```ts
await sessions.insertOne(
    {
        token: "...",
        user: "Alice"
    },
    {
        ttlMs: 3600000
    }
);
```

Expired documents are automatically removed from queries and cleaned from storage.

---

## Gallery API

Structured documents and binary files are different kinds of data.

Instead of embedding Base64 strings inside JSON documents, BrowserDB provides a dedicated Gallery API backed by IndexedDB.

```ts
const gallery = db.gallery("avatars");

await gallery.store("alice", file);
```

Images, videos and other Blob objects remain separate from document collections, resulting in better performance and significantly smaller JSON payloads.

---

## TypeScript First

Every public API is fully typed.

Collections preserve generic types across CRUD operations.

```ts
interface User {

    name: string;

    age: number;

}

const users = db.collection<User>("users");
```

This enables autocomplete, compile-time validation and excellent IDE support.

---

# Installation

Install BrowserDB using your preferred package manager.

## npm

```bash
npm install @lkkhwhb/browserdb
```

## pnpm

```bash
pnpm add @lkkhwhb/browserdb
```

## yarn

```bash
yarn add @lkkhwhb/browserdb
```

## bun

```bash
bun add @lkkhwhb/browserdb
```

---

# Importing

```ts
import {

    BrowserDB

} from "@lkkhwhb/browserdb";
```

For backwards compatibility:

```ts
import {

    LocalDB

} from "@lkkhwhb/browserdb";
```

Both names reference the same implementation.

---

# Your First Database

Creating a database takes a single line.

```ts
const db = new BrowserDB();
```

Collections are created lazily.

```ts
const users = db.collection("users");
```

No schema is required.

No migrations are required.

No setup process exists.

Collections automatically persist themselves as soon as data is inserted.

---

# Your First Document

Insert a document.

```ts
await users.insertOne({

    name: "Alice",

    age: 23,

    online: true

});
```

BrowserDB automatically generates a UUID if one is not supplied.

```ts
{
    _id: "3bfa4a3b-...",
    name: "Alice",
    age: 23,
    online: true
}
```

---

# Finding Documents

Retrieve every document.

```ts
const results = await users.find();
```

Or filter documents.

```ts
const admins = await users.find({

    role: "admin"

});
```

Queries return ordinary JavaScript objects.

No proxies.

No custom model classes.

No hidden behaviour.

---

# Updating Documents

```ts
await users.updateOne(

    {

        name: "Alice"

    },

    {

        $set: {

            online: false

        }

    }

);
```

Only the specified fields are modified.

Everything else remains unchanged.

---

# Deleting Documents

```ts
await users.deleteOne({

    name: "Alice"

});
```

---

# Collection API

Collections are the primary building block of BrowserDB.

Every document belongs to exactly one collection, and every database operation—creating, reading, updating, deleting, validating, subscribing, or expiring data—is performed through a collection.

If you're familiar with MongoDB, a BrowserDB collection serves the same conceptual purpose.

```ts
const users = db.collection<User>("users");
```

Collections are lightweight handles that provide a type-safe interface over an underlying storage engine.

Unlike SQL databases, collections are schema-less by default. Every document inside a collection is simply a JavaScript object with an automatically managed `_id` field.

---

# Creating Collections

Collections are created lazily.

This means no storage is allocated until the collection actually needs to persist data.

```ts
const users = db.collection<User>("users");
```

If the collection already exists, BrowserDB returns the existing instance.

Calling:

```ts
const a = db.collection<User>("users");

const b = db.collection<User>("users");
```

returns the same collection object.

---

## Collection Names

Collection names should uniquely identify a logical group of documents.

Examples include:

```
users
posts
messages
orders
sessions
products
notifications
```

Collection names are also used internally to generate browser storage keys.

---

# Generic Types

BrowserDB is designed with TypeScript in mind.

Supplying a generic type allows BrowserDB to infer document shapes throughout the API.

```ts
interface User {

    name: string;

    age: number;

    online: boolean;

}

const users = db.collection<User>("users");
```

Now every operation becomes type-safe.

```ts
await users.insertOne({

    name: "Alice",

    age: 25,

    online: true

});
```

Attempting to insert invalid properties immediately produces TypeScript errors before your code even runs.

---

# Collection Options

Collections may optionally define storage behaviour.

```ts
const users = db.collection<User>("users", {

    backend: "auto",

    eviction: "ttl"

});
```

All options are completely optional.

---

## backend

Determines where documents are physically stored.

Possible values:

```ts
"auto"

"localStorage"

"indexedDB"
```

---

### auto

(Default)

```ts
backend: "auto"
```

BrowserDB initially stores data inside compressed localStorage.

If storage capacity is exhausted, the collection transparently migrates itself into IndexedDB.

No application code needs to change.

This provides the best balance between performance and scalability.

---

### localStorage

```ts
backend: "localStorage"
```

Forces BrowserDB to always use the compressed localStorage engine.

Advantages:

- Extremely fast reads
- Extremely fast writes
- Synchronous cache availability
- Small runtime overhead

Disadvantages:

- Limited browser quota
- Cannot efficiently store very large datasets

Recommended for:

- Settings
- Preferences
- User sessions
- Small caches

---

### indexedDB

```ts
backend: "indexedDB"
```

Forces BrowserDB to use IndexedDB immediately.

Advantages:

- Much larger storage limits
- Better for thousands of documents
- Better for large objects

Disadvantages:

- Slightly slower
- Asynchronous storage layer

Recommended for:

- Offline applications
- Large datasets
- Document archives
- Complex PWAs

---

# Eviction Policies

When browser storage becomes full, BrowserDB can automatically reclaim space.

This behaviour is controlled by the `eviction` option.

```ts
eviction: "ttl"
```

Available policies:

```
none
ttl
fifo
lru
```

---

## none

No automatic deletion occurs.

If storage becomes full and migration is impossible, BrowserDB throws a `QuotaExceededError`.

---

## ttl

BrowserDB preferentially removes documents that are closest to expiration.

This is ideal for caches and temporary data.

---

## fifo

First-In, First-Out.

The oldest approximately 20% of stored documents are removed.

Useful when insertion order naturally reflects importance.

---

## lru

Least Recently Used.

Currently BrowserDB approximates LRU using FIFO because access history is intentionally not tracked to avoid runtime overhead.

Future versions may implement true LRU eviction.

---

# How Collections Store Documents

Every document stored by BrowserDB automatically receives an `_id` field.

```ts
await users.insertOne({

    name: "Alice"

});
```

Internally becomes:

```ts
{

    _id: "af7d9f4d...",

    name: "Alice"

}
```

Developers may also supply their own identifiers.

```ts
await users.insertOne({

    _id: "alice",

    name: "Alice"

});
```

Identifiers must be unique within a collection.

Attempting to insert duplicates throws a `DuplicateKeyError`.

---

# Automatic UUID Generation

If no identifier is provided, BrowserDB automatically generates a Version 4 UUID.

```ts
await users.insertOne({

    name: "Alice"

});
```

This guarantees uniqueness without requiring application code to manage IDs.

---

# Document Lifetime

Documents remain stored until one of the following occurs:

- They are explicitly deleted.
- Their TTL expires.
- The collection is cleared.
- The collection is dropped.
- An eviction policy removes them.

Otherwise, documents persist indefinitely.

---

# Internal Metadata

BrowserDB may attach internal metadata fields to documents.

Current metadata includes:

```ts
__expiresAt
```

This timestamp is used internally for automatic expiration.

Applications should avoid modifying internal metadata manually.

---

# Deep Cloning

Every document returned by BrowserDB is deep cloned before being returned to the application.

```ts
const user = await users.findOne({

    name: "Alice"

});

user.name = "Bob";
```

Changing `user` does **not** modify the stored document.

The change only exists in memory until an update operation is explicitly performed.

This prevents accidental mutations that commonly occur when object references are shared.

---

# Thread Safety

Although JavaScript is single-threaded, asynchronous operations can overlap.

For example:

```ts
users.insertOne(...);

users.insertOne(...);

users.updateOne(...);
```

BrowserDB internally serializes write operations using a lightweight asynchronous mutex.

This guarantees that concurrent writes execute in a deterministic order and prevents race conditions that could otherwise corrupt stored data.

Developers do not need to manually lock collections.

---

# Fast _id Lookups

Searching by `_id` is one of the most common operations.

Instead of scanning every document each time, BrowserDB maintains an in-memory index for document identifiers whenever possible.

```ts
await users.findOne({

    _id: "alice"

});
```

This lookup avoids a full collection scan, providing significantly faster access for primary-key searches.

---

# Collection Lifecycle

Collections transition through several stages during their lifetime.

```
Created
      │
      ▼

Initialized
      │
      ▼

Active
      │
      ▼

Persisted
      │
      ▼

Destroyed
```

Creating a collection does not immediately allocate browser storage.

Persistence occurs only after data is written.

---

# Reusing Collections

Collections behave like singletons inside a BrowserDB instance.

```ts
const users1 = db.collection("users");

const users2 = db.collection("users");
```

Both variables reference the same underlying collection.

This ensures subscriptions, transactions, and cached data remain consistent throughout the application.

---

# Best Practices

✅ One collection per entity type.

```
users
orders
products
messages
```

Avoid storing unrelated document types together.

---

Prefer UUIDs unless your application already has stable identifiers.

---

Use IndexedDB for large datasets.

---

Use TTL for caches.

---

Avoid storing large binary objects inside JSON documents.

Use the Gallery API instead.

---

Treat returned documents as immutable snapshots.

Always use update operations instead of modifying returned objects directly.

---

# CRUD Operations

CRUD stands for **Create**, **Read**, **Update**, and **Delete**.

These four operations form the foundation of every BrowserDB collection.

Unlike many browser storage libraries, BrowserDB treats every CRUD operation as a first-class database operation rather than a simple object mutation. Every operation passes through validation, middleware, transaction management, storage synchronization, and notification pipelines before changes become visible to the rest of the application.

```
Application
      │
      ▼
Collection API
      │
      ▼
Middleware
      │
      ▼
Schema Validation
      │
      ▼
Transaction Layer
      │
      ▼
Storage Engine
      │
      ▼
Subscriptions
```

Every CRUD method is asynchronous and returns a Promise.

```ts
await users.insertOne(...);

await users.find(...);

await users.updateOne(...);

await users.deleteOne(...);
```

---

# Creating Documents

Creating documents is performed using one of two methods.

| Method | Description |
|---------|-------------|
| insertOne() | Inserts a single document |
| insertMany() | Inserts multiple documents atomically |

---

# insertOne()

Inserts exactly one document into the collection.

```ts
await users.insertOne({

    name: "Alice",

    age: 24

});
```

Returns the inserted document including its generated `_id`.

```ts
const user = await users.insertOne({

    name: "Alice"

});

console.log(user);
```

Output

```ts
{

    _id: "2fd7c50f-7d6d-4a35...",

    name: "Alice"

}
```

---

## Signature

```ts
insertOne(

    document,

    options?

): Promise<WithId<T>>
```

---

## Parameters

### document

The document to insert.

```ts
await users.insertOne({

    name: "Alice",

    age: 20

});
```

The document may contain any serializable values.

Examples include

```ts
{

    name: "Alice",

    age: 20,

    verified: true,

    address: {

        city: "London"

    },

    hobbies: [

        "Programming",

        "Photography"

    ]

}
```

---

### options

Optional insertion configuration.

Currently supported:

```ts
{

    ttlMs?: number

}
```

---

## Automatic UUID Generation

If `_id` is omitted, BrowserDB generates a Version 4 UUID automatically.

```ts
await users.insertOne({

    name: "Alice"

});
```

Internally becomes

```ts
{

    _id: "bf79d0cb-3f9d-4c97-8eb6-...",

    name: "Alice"

}
```

This allows applications to ignore identifier management completely.

---

## Custom IDs

Applications may provide their own identifiers.

```ts
await users.insertOne({

    _id: "alice",

    name: "Alice"

});
```

Custom identifiers must

- be strings
- be unique
- remain unchanged after insertion

Attempting to insert a duplicate identifier throws

```ts
DuplicateKeyError
```

---

## Duplicate Detection

BrowserDB guarantees uniqueness.

```ts
await users.insertOne({

    _id: "admin"

});

await users.insertOne({

    _id: "admin"

});
```

Result

```text
DuplicateKeyError:
Duplicate _id 'admin'
found in collection 'users'
```

Duplicate detection occurs before any data is written.

---

## Schema Validation

If a validator exists, BrowserDB validates the document before insertion.

```ts
users.setValidator({

    $jsonSchema: {

        required: [

            "name"

        ]

    }

});
```

Valid

```ts
await users.insertOne({

    name: "Alice"

});
```

Invalid

```ts
await users.insertOne({

});
```

Throws

```text
ValidationError
```

Nothing is written to storage.

---

## Middleware

Insert middleware executes automatically.

Execution order

```
beforeInsert()

↓

Schema Validation

↓

Storage Write

↓

afterInsert()
```

Example

```ts
users.beforeInsert(doc=>{

    doc.createdAt=Date.now();

    return doc;

});
```

Now every inserted document receives

```ts
{

    createdAt:171812912

}
```

without changing application code.

---

## TTL

Documents may expire automatically.

```ts
await sessions.insertOne(

    {

        token:"abc123"

    },

    {

        ttlMs:3600000

    }

);
```

BrowserDB stores an internal expiration timestamp.

```ts
{

    _id:"...",

    token:"abc123",

    __expiresAt:1718200000000

}
```

Expired documents disappear automatically from queries.

---

## Returned Value

The returned document is **not** a reference to storage.

```ts
const user = await users.insertOne({

    name:"Alice"

});

user.name="Bob";
```

The stored document remains unchanged.

```ts
const dbUser = await users.findOne({

    _id:user._id

});

console.log(dbUser.name);
```

Output

```
Alice
```

Returned documents are defensive copies.

---

# insertMany()

Inserts multiple documents.

```ts
await users.insertMany([

    {

        name:"Alice"

    },

    {

        name:"Bob"

    },

    {

        name:"Charlie"

    }

]);
```

Returns

```ts
Promise<WithId<T>[]>
```

Every returned document contains its generated identifier.

---

## Why insertMany()?

Instead of

```ts
for(const user of users){

    await collection.insertOne(user);

}
```

use

```ts
await collection.insertMany(users);
```

This performs significantly fewer storage operations and reduces notification overhead.

---

## Batch Validation

Every document is validated before storage.

If **any** document fails

- validation
- duplicate detection
- identifier verification

the entire insertion fails.

Example

```ts
await users.insertMany([

    {

        _id:"alice"

    },

    {

        _id:"alice"

    }

]);
```

Nothing is inserted.

This prevents partially completed batches.

---

## Shared TTL

A single TTL applies to every inserted document.

```ts
await cache.insertMany(

    data,

    {

        ttlMs:60000

    }

);
```

All documents expire simultaneously.

---

# Reading Documents

Reading operations never modify storage.

BrowserDB provides two retrieval methods.

| Method | Description |
|---------|-------------|
| find() | Returns every matching document |
| findOne() | Returns first matching document |

---

# find()

Returns every document matching a filter.

```ts
const results = await users.find();
```

If no filter is provided, every document is returned.

---

## Simple Equality

```ts
await users.find({

    role:"admin"

});
```

Equivalent to

```
role == "admin"
```

---

## Multiple Fields

```ts
await users.find({

    role:"admin",

    online:true

});
```

BrowserDB treats multiple fields as an implicit logical AND.

```
role == admin

AND

online == true
```

---

## Nested Objects

Nested objects are compared using deep equality.

```ts
await users.find({

    address:{

        city:"London"

    }

});
```

Unlike JavaScript reference comparison, BrowserDB compares object contents.

---

## Empty Filter

```ts
await users.find({});
```

Returns every valid document.

Expired TTL documents are automatically excluded.

---

## Return Type

```ts
Promise<WithId<T>[]>
```

Example

```ts
[

    {

        _id:"1",

        name:"Alice"

    },

    {

        _id:"2",

        name:"Bob"

    }

]
```

---

# findOne()

Returns only the first matching document.

```ts
const user = await users.findOne({

    email:"alice@example.com"

});
```

If nothing matches

```ts
null
```

is returned.

---

## Signature

```ts
findOne(

    filter,

    options?

)
```

Returns

```ts
Promise<WithId<T>|null>
```

---

## Typical Usage

Authentication

```ts
const account = await users.findOne({

    email

});
```

Settings

```ts
const settings = await config.findOne({

    userId

});
```

Shopping cart

```ts
const cart = await carts.findOne({

    customerId

});
```

---

# Find Options

Both `find()` and `findOne()` accept optional processing options.

```ts
await users.find(

    {},

    {

        sort:{

            age:-1

        },

        skip:20,

        limit:10

    }

);
```

Find options never modify stored documents.

They only transform returned results.

---

# Sorting

Sort ascending

```ts
sort:{

    age:1

}
```

Sort descending

```ts
sort:{

    age:-1

}
```

Multiple fields

```ts
sort:{

    age:-1,

    name:1

}
```

BrowserDB compares fields in declaration order.

---

# Pagination

Skip

```ts
skip:20
```

Limit

```ts
limit:10
```

Together

```ts
await users.find(

    {},

    {

        skip:20,

        limit:10

    }

);
```

Equivalent SQL

```sql
OFFSET 20

LIMIT 10
```

Useful for

- infinite scrolling
- tables
- search results
- dashboards

---

# Projection

Projection allows selecting only required fields.

Inclusive projection

```ts
projection:{

    name:1,

    age:1

}
```

Output

```ts
{

    _id:"...",

    name:"Alice",

    age:22

}
```

Notice `_id` is always preserved.

---

Exclusive projection

```ts
projection:{

    password:0

}
```

Output

```ts
{

    _id:"...",

    name:"Alice",

    email:"alice@example.com"

}
```

Projection reduces object size and prevents exposing unnecessary information.

---

# Deep Cloning

Every retrieved document is cloned before returning.

This prevents accidental mutations.

```ts
const user = await users.findOne({

    name:"Alice"

});

user.age=999;
```

Database

```
Age = 22
```

Local variable

```
Age = 999
```

No changes reach storage until

```ts
updateOne()
```

or

```ts
replaceOne()
```

is explicitly called.

---

# Performance Notes

BrowserDB performs several optimizations during read operations.

✔ Expired TTL documents are filtered automatically.

✔ `_id` lookups avoid full scans whenever possible.

✔ Returned documents are cloned to prevent shared references.

✔ Sorting, pagination, and projection occur after filtering, reducing unnecessary work.

✔ Read operations never trigger subscriptions or modify stored data.

---

# Updating Documents

Reading data is only half of working with a database.

Eventually, documents need to change.

BrowserDB provides two distinct ways to modify existing documents.

| Method | Description |
|---------|-------------|
| updateOne() | Updates specific fields while preserving the rest of the document |
| replaceOne() | Replaces the entire document |

Choosing the correct method is important.

Use **updateOne()** when changing only a few fields.

Use **replaceOne()** when the new document should completely replace the old one.

---

# updateOne()

Updates the first document matching a filter.

```ts
await users.updateOne(

    {

        name: "Alice"

    },

    {

        $set: {

            age: 25

        }

    }

);
```

Only the specified fields change.

Everything else remains untouched.

---

## Signature

```ts
updateOne(

    filter,

    update

): Promise<{

    matched:boolean,

    modified:boolean

}>
```

---

## Return Value

BrowserDB returns information about the operation.

```ts
{

    matched:true,

    modified:true

}
```

### matched

Indicates whether any document satisfied the filter.

```ts
{

    matched:false,

    modified:false

}
```

means no document existed.

---

### modified

Indicates whether anything actually changed.

Example

```ts
await users.updateOne(

    {

        name:"Alice"

    },

    {

        $set:{

            age:22

        }

    }

);
```

If Alice is already 22

```
matched = true

modified = false
```

No unnecessary storage write occurs.

---

# Update Operators

BrowserDB intentionally keeps update operations predictable.

Supported operators:

```
$set

$inc

$unset

$push

$pull
```

Operators may be combined.

```ts
await users.updateOne(

    {

        _id:"alice"

    },

    {

        $set:{

            online:true

        },

        $inc:{

            loginCount:1

        }

    }

);
```

BrowserDB applies every operator before validating and saving the document.

---

# $set

Sets or creates fields.

```ts
await users.updateOne(

    {

        _id:"alice"

    },

    {

        $set:{

            age:25

        }

    }

);
```

Before

```ts
{

    age:20

}
```

After

```ts
{

    age:25

}
```

---

## Creating New Fields

`$set` also creates missing properties.

```ts
$set:{

    premium:true

}
```

Result

```ts
{

    premium:true

}
```

---

## Multiple Fields

```ts
$set:{

    age:25,

    verified:true,

    country:"UK"

}
```

All fields update together.

---

## Immutable _id

The primary key cannot be modified.

```ts
$set:{

    _id:"new-id"

}
```

BrowserDB ignores attempts to overwrite `_id`.

This guarantees identifier stability.

---

# $inc

Increments numeric fields.

```ts
await users.updateOne(

    {

        _id:"alice"

    },

    {

        $inc:{

            points:5

        }

    }

);
```

Before

```ts
points = 10
```

After

```ts
points = 15
```

---

## Missing Fields

If the field doesn't exist

```ts
{

}
```

then

```ts
$inc:{

    score:1

}
```

creates it.

```ts
{

    score:1

}
```

---

## Existing Numbers

```ts
views = 50

↓

views = 51
```

---

## Invalid Types

```ts
{

    points:"ten"

}
```

```ts
$inc:{

    points:1

}
```

throws

```
DatabaseError
```

because strings cannot be incremented.

This prevents accidental data corruption.

---

# $unset

Removes fields.

```ts
await users.updateOne(

    {

        _id:"alice"

    },

    {

        $unset:{

            password:true

        }

    }

);
```

Before

```ts
{

    password:"secret"

}
```

After

```ts
{

}
```

---

## Multiple Fields

```ts
$unset:{

    temp:true,

    cache:true,

    draft:true

}
```

Every listed field disappears.

---

# $push

Appends values to arrays.

```ts
await users.updateOne(

    {

        _id:"alice"

    },

    {

        $push:{

            hobbies:"Programming"

        }

    }

);
```

Before

```ts
{

    hobbies:[

        "Music"

    ]

}
```

After

```ts
{

    hobbies:[

        "Music",

        "Programming"

    ]

}
```

---

## Automatic Array Creation

If the property doesn't exist

```ts
{

}
```

then

```ts
$push:{

    hobbies:"Music"

}
```

creates

```ts
{

    hobbies:[

        "Music"

    ]

}
```

No manual initialization required.

---

# $pull

Removes values from arrays.

```ts
$pull:{

    hobbies:"Music"

}
```

Before

```ts
[

    "Music",

    "Programming",

    "Gaming"

]
```

After

```ts
[

    "Programming",

    "Gaming"

]
```

---

## Removing Objects

Unlike JavaScript's reference comparison, BrowserDB compares objects by value.

```ts
$pull:{

    addresses:{

        city:"London"

    }

}
```

removes

```ts
{

    city:"London"

}
```

even if it isn't the exact same object instance.

This uses BrowserDB's deep equality engine.

---

# Combining Operators

Operators execute together.

```ts
await users.updateOne(

    {

        _id:"alice"

    },

    {

        $inc:{

            logins:1

        },

        $set:{

            online:true

        },

        $push:{

            devices:"Desktop"

        }

    }

);
```

Everything becomes one update.

---

# Validation After Updates

Schema validation occurs **after** operators modify the document.

```
Original Document

↓

Apply Operators

↓

Validate Schema

↓

Save
```

If validation fails

nothing is written.

Example

```ts
$set:{

    age:-5

}
```

If the schema requires

```ts
minimum:0
```

BrowserDB throws

```
ValidationError
```

and the original document remains untouched.

---

# Middleware

Update middleware executes automatically.

Execution order

```
beforeUpdate()

↓

Apply Operators

↓

Validation

↓

Storage

↓

afterUpdate()
```

Example

```ts
users.beforeUpdate(doc=>{

    doc.updatedAt=Date.now();

    return doc;

});
```

Now every update automatically records modification time.

---

# replaceOne()

Sometimes updating individual fields isn't desirable.

Instead, replace the entire document.

```ts
await users.replaceOne(

    {

        _id:"alice"

    },

    {

        name:"Alice",

        age:25,

        verified:true

    }

);
```

Everything except the internal identifier is replaced.

---

## Signature

```ts
replaceOne(

    filter,

    replacement

)
```

Returns

```ts
{

    matched,

    modified

}
```

---

## Identifier Preservation

Suppose the stored document is

```ts
{

    _id:"alice",

    name:"Alice",

    age:20

}
```

Replacement

```ts
{

    name:"Alice",

    age:25

}
```

Result

```ts
{

    _id:"alice",

    name:"Alice",

    age:25

}
```

Notice

```
_id
```

never changes.

Even if the replacement object contains another identifier

```ts
{

    _id:"bob"

}
```

BrowserDB ignores it.

The original primary key is always preserved.

---

# TTL Preservation

Documents with expiration dates retain their original TTL.

Suppose

```ts
{

    _id:"abc",

    __expiresAt:171900000
}
```

Replacing the document

```ts
replaceOne(...)
```

does **not** remove the expiration timestamp.

This prevents updates from accidentally making temporary documents permanent.

---

# Complete Replacement

Unlike `$set`, replacement removes omitted fields.

Original

```ts
{

    name:"Alice",

    age:20,

    country:"UK"
}
```

Replacement

```ts
{

    name:"Alice"
}
```

Result

```ts
{

    name:"Alice"
}
```

Both

```
age
```

and

```
country
```

are gone.

---

# When Should I Use replaceOne()?

Use replacement when

✔ importing data

✔ synchronizing with a server

✔ restoring backups

✔ replacing configuration objects

✔ replacing nested state entirely

Use update operators when changing only a few fields.

---

# Internal Update Pipeline

Every successful update follows the same sequence.

```
Locate Document

↓

Clone Document

↓

beforeUpdate()

↓

Apply Operators

↓

Schema Validation

↓

Persist Storage

↓

Notify Subscribers

↓

afterUpdate()

↓

Return Result
```

Because BrowserDB works on cloned copies internally, partially modified documents are never visible to subscribers.

Either the entire update succeeds—

—or nothing changes.

---

# Performance Notes

BrowserDB optimizes updates in several ways.

✔ Primary-key searches use the internal `_id` index whenever possible.

✔ Storage writes are skipped if nothing changed.

✔ Validation only occurs after all operators have finished.

✔ Subscribers are notified only after persistence succeeds.

✔ Middleware executes exactly once per update.

✔ The original document remains unchanged until the update commits.

---

# Deleting Documents

Deleting documents removes them permanently from the collection.

BrowserDB provides a single deletion method.

| Method | Description |
|---------|-------------|
| deleteOne() | Deletes the first matching document |

Unlike SQL databases, BrowserDB intentionally keeps deletion explicit.

There is no automatic cascading, no soft-delete system, and no hidden behaviour.

When a document is deleted, it disappears immediately from future queries and subscribers are notified of the change.

---

# deleteOne()

Deletes the first document matching a filter.

```ts
await users.deleteOne({

    _id:"alice"

});
```

---

## Signature

```ts
deleteOne(

    filter

): Promise<{

    deletedCount:number

}>
```

---

## Return Value

Successful deletion

```ts
{

    deletedCount:1

}
```

Nothing matched

```ts
{

    deletedCount:0

}
```

BrowserDB never throws simply because no document matched.

---

# Examples

Delete by ID

```ts
await users.deleteOne({

    _id:"alice"

});
```

Delete by email

```ts
await users.deleteOne({

    email:"alice@example.com"

});
```

Delete using query operators

```ts
await users.deleteOne({

    age:{

        $lt:18

    }

});
```

Deletes the first matching document.

---

# Middleware

Delete operations participate in middleware.

Execution order

```
Find Document

↓

beforeDelete()

↓

Delete Storage

↓

Notify Subscribers

↓

afterDelete()
```

Example

```ts
users.beforeDelete(doc=>{

    console.log(

        "Deleting",

        doc.name

    );

});
```

After deletion

```ts
users.afterDelete(doc=>{

    console.log(

        "Deleted",

        doc.name

    );

});
```

---

# What Gets Deleted?

Everything.

BrowserDB removes the complete stored document.

Before

```ts
{

    _id:"1",

    name:"Alice",

    age:25

}
```

After

```
Document does not exist.
```

---

# Deleting Expired Documents

Normally applications never delete expired documents manually.

BrowserDB automatically ignores expired documents during queries.

Eventually those expired documents are removed during cleanup.

For this reason you generally don't need

```ts
deleteOne()
```

for temporary cache data.

TTL handles that automatically.

---

# count()

Returns the number of valid documents currently stored.

```ts
const total = await users.count();
```

Returns

```ts
number
```

Example

```ts
42
```

---

## Signature

```ts
count():Promise<number>
```

---

## Expired Documents

`count()` ignores expired TTL documents.

Suppose storage contains

```
User A

User B

Expired Session

Expired Cache
```

Result

```ts
2
```

The expired entries are excluded.

---

## Typical Uses

Statistics

```ts
const totalUsers =

await users.count();
```

Pagination

```ts
const pages =

Math.ceil(

    await users.count()/10

);
```

Dashboards

```ts
Active Users

Registered Users

Cached Files
```

---

# clear()

Deletes every document from a collection.

```ts
await users.clear();
```

After clearing

```ts
await users.find();
```

returns

```ts
[]
```

---

## Signature

```ts
clear():Promise<void>
```

---

## What Happens?

```
Read Collection

↓

Delete Every Document

↓

Persist Empty Collection

↓

Notify Subscribers
```

---

## Example

Before

```ts
[

    {

        name:"Alice"

    },

    {

        name:"Bob"

    }

]
```

After

```ts
[]
```

---

# When Should clear() Be Used?

Good use cases

✔ Logout

✔ Cache invalidation

✔ Reset application

✔ Development

✔ Tests

Avoid using it when only a few documents should be removed.

Use

```ts
deleteOne()
```

instead.

---

# Collection Lifetime

Collections themselves continue to exist after

```ts
clear()
```

Only documents disappear.

```ts
const users = db.collection("users");

await users.clear();

await users.insertOne({

    name:"Alice"

});
```

The same collection continues working normally.

---

# Destroying Collections

To completely remove a collection from BrowserDB use

```ts
await db.dropCollection(

    "users"

);
```

Unlike

```ts
clear()
```

this removes

- stored documents
- metadata
- storage engine
- IndexedDB database
- localStorage entries

The collection effectively ceases to exist.

---

# close()

Collections expose a lightweight cleanup method.

```ts
users.close();
```

This disconnects the underlying storage engine from browser resources such as BroadcastChannel listeners.

Normally applications do **not** need to call this manually.

BrowserDB handles cleanup automatically.

---

# destroy()

Internally BrowserDB also exposes

```ts
await users.destroy();
```

This permanently destroys the collection storage backend.

Unlike

```ts
clear()
```

this removes both the data and the storage implementation itself.

Most applications should instead use

```ts
db.dropCollection()
```

which safely performs every cleanup step.

---

# CRUD Summary

BrowserDB intentionally keeps CRUD operations predictable.

| Operation | Method |
|----------|---------|
| Create one | insertOne() |
| Create many | insertMany() |
| Read many | find() |
| Read one | findOne() |
| Update fields | updateOne() |
| Replace document | replaceOne() |
| Delete | deleteOne() |
| Count | count() |
| Remove everything | clear() |

---

# Error Handling

CRUD operations may throw several BrowserDB-specific exceptions.

## DuplicateKeyError

Occurs when inserting an existing identifier.

```ts
await users.insertOne({

    _id:"alice"

});

await users.insertOne({

    _id:"alice"

});
```

---

## ValidationError

Occurs when a validator rejects a document.

```ts
{

    age:-5

}
```

may violate

```ts
minimum:0
```

---

## DatabaseError

Represents invalid operations.

Examples include

- incrementing strings
- browser storage failures
- invalid identifiers
- unsupported environments

---

## QuotaExceededError

Thrown when browser storage is full and BrowserDB cannot recover using cleanup, migration, or eviction.

Applications can catch this and prompt the user to free storage.

---

# CRUD Best Practices

## Prefer updateOne() over replaceOne()

Updating individual fields avoids rewriting the entire document.

---

## Let BrowserDB Generate IDs

Unless your application already has stable identifiers, allow BrowserDB to generate UUIDs.

```ts
await users.insertOne({

    name:"Alice"

});
```

This eliminates an entire class of duplicate identifier bugs.

---

## Use TTL for Temporary Data

Instead of manually deleting cache entries

```ts
await cache.insertOne(

    result,

    {

        ttlMs:60000

    }

);
```

BrowserDB automatically expires them.

---

## Never Mutate Returned Objects

Always

```ts
updateOne()
```

instead of

```ts
user.age++;

save(user);
```

BrowserDB intentionally returns defensive copies.

---

## Batch Inserts

Instead of

```ts
for(const user of users){

    await collection.insertOne(user);

}
```

prefer

```ts
await collection.insertMany(users);
```

It performs fewer storage operations and is significantly more efficient.

---

# Under the Hood

Although CRUD operations appear simple, BrowserDB performs considerably more work than a traditional localStorage wrapper.

For a single insertion the internal workflow resembles

```
Clone Document

↓

Run beforeInsert()

↓

Validate Schema

↓

Generate UUID

↓

Detect Duplicate IDs

↓

Apply TTL

↓

Write Storage Engine

↓

Notify Subscribers

↓

Run afterInsert()

↓

Return Defensive Copy
```

Similarly, updates and deletions follow carefully ordered execution pipelines to guarantee consistency even when transactions, subscriptions, validation, middleware, and storage synchronization all occur simultaneously.

The goal is simple:

> Every successful CRUD operation should either complete entirely—or leave the database exactly as it was before the operation began.

---

# Query Engine

One of BrowserDB's primary goals is to provide a familiar querying experience for developers coming from MongoDB while remaining lightweight enough to run entirely inside a browser.

Instead of forcing developers to iterate over arrays manually, BrowserDB allows expressive filters that describe *what* data should be returned rather than *how* to retrieve it.

```ts
const users = await db.collection<User>("users");

const results = await users.find({

    age: {

        $gte: 18

    },

    verified: true

});
```

Although BrowserDB stores ordinary JavaScript objects, its query engine behaves much more like a document database than simple array filtering.

---

# How Queries Work

Every query follows the same execution pipeline.

```
Load Collection

↓

Remove Expired Documents

↓

Evaluate Filter

↓

Sort

↓

Skip

↓

Limit

↓

Projection

↓

Clone Results

↓

Return
```

Every step is deterministic.

Queries never modify stored data.

---

# Filters

A filter describes which documents should be returned.

```ts
await users.find({

    name: "Alice"

});
```

returns every document whose `name` equals `"Alice"`.

---

An empty filter returns every document.

```ts
await users.find({});
```

or simply

```ts
await users.find();
```

Both are equivalent.

---

# Equality Matching

The simplest filter compares values directly.

```ts
await users.find({

    country: "India"

});
```

Equivalent logic

```
country === "India"
```

BrowserDB intentionally performs **strict comparisons**.

Unlike JavaScript

```ts
5 == "5"
```

BrowserDB never performs implicit type coercion.

```
5 !== "5"
```

This eliminates an entire class of subtle bugs.

---

# Multiple Conditions

Multiple properties are automatically combined using logical AND.

```ts
await users.find({

    verified: true,

    online: true

});
```

Equivalent

```
verified == true

AND

online == true
```

No `$and` operator is required for simple cases.

---

# Deep Object Matching

Unlike JavaScript's reference comparison,

BrowserDB compares objects structurally.

```ts
await users.find({

    address: {

        city: "London",

        country: "UK"

    }

});
```

Two objects containing identical values are considered equal even if they are different object instances.

This makes nested documents behave naturally.

---

# Comparison Operators

Comparison operators allow matching ranges instead of exact values.

Supported operators are intentionally similar to MongoDB.

| Operator | Description |
|----------|-------------|
| `$eq` | Equal |
| `$ne` | Not Equal |
| `$gt` | Greater Than |
| `$gte` | Greater Than or Equal |
| `$lt` | Less Than |
| `$lte` | Less Than or Equal |
| `$in` | Exists inside array |
| `$nin` | Does not exist inside array |

---

# $eq

Explicit equality.

```ts
await users.find({

    role: {

        $eq: "admin"

    }

});
```

Equivalent to

```ts
role: "admin"
```

Useful when dynamically generating filters.

---

# $ne

Matches everything except the supplied value.

```ts
await users.find({

    status: {

        $ne: "deleted"

    }

});
```

Returns every document whose status is not `"deleted"`.

---

# $gt

Greater than.

```ts
await users.find({

    age: {

        $gt: 18

    }

});
```

Matches

```
19

20

21

...
```

---

# $gte

Greater than or equal.

```ts
await users.find({

    age: {

        $gte: 18

    }

});
```

Matches

```
18

19

20

...
```

---

# $lt

Less than.

```ts
await users.find({

    score: {

        $lt: 100

    }

});
```

Matches every value strictly below 100.

---

# $lte

Less than or equal.

```ts
await users.find({

    score: {

        $lte: 100

    }

});
```

Matches

```
100

99

98

...
```

---

# Numeric Comparisons

Numeric operators only compare compatible numeric values.

```ts
age:{

    $gt:18

}
```

works.

However

```ts
age:{

    $gt:"18"

}
```

never matches.

BrowserDB intentionally avoids JavaScript's implicit coercion.

```
18

>

"18"

```

is considered invalid rather than silently converted.

This behaviour produces predictable queries and prevents difficult debugging sessions.

---

# String Comparisons

Comparison operators also work on strings.

```ts
await products.find({

    category:{

        $gte:"M"

    }

});
```

Comparison follows JavaScript's standard lexicographical ordering.

---

# $in

Matches values contained inside a supplied array.

```ts
await users.find({

    role:{

        $in:[

            "admin",

            "editor",

            "moderator"

        ]

    }

});
```

Equivalent logic

```
role == admin

OR

role == editor

OR

role == moderator
```

This operator is ideal when users may belong to several acceptable categories.

---

# $nin

Inverse of `$in`.

```ts
await users.find({

    role:{

        $nin:[

            "guest",

            "banned"

        ]

    }

});
```

Returns every document except those roles.

---

# Logical Operators

For more complex conditions BrowserDB provides logical operators.

```
$and

$or
```

Unlike comparison operators, logical operators combine multiple complete filters.

---

# $and

Every condition must succeed.

```ts
await users.find({

    $and:[

        {

            verified:true

        },

        {

            age:{

                $gte:18

            }

        },

        {

            premium:true

        }

    ]

});
```

Equivalent

```
verified

AND

adult

AND

premium
```

Although multiple fields already imply AND,

explicit `$and` becomes useful when composing filters dynamically.

---

# $or

At least one condition must succeed.

```ts
await users.find({

    $or:[

        {

            role:"admin"

        },

        {

            role:"owner"

        }

    ]

});
```

Matches either role.

---

# Combining Logical Operators

Complex expressions are possible.

```ts
await users.find({

    $and:[

        {

            verified:true

        },

        {

            $or:[

                {

                    role:"admin"

                },

                {

                    role:"editor"

                }

            ]

        }

    ]

});
```

Equivalent

```
verified

AND

(

admin

OR

editor

)
```

Nested logical operators may be combined as deeply as necessary.

---

# Deep Equality

Suppose a document contains

```ts
{

    preferences:{

        theme:"dark",

        compact:true

    }

}
```

Then

```ts
await users.find({

    preferences:{

        theme:"dark",

        compact:true

    }

});
```

matches successfully.

BrowserDB compares nested structures recursively rather than checking object identity.

This allows nested documents to behave exactly as developers expect.

---

# Query Evaluation

Internally, BrowserDB evaluates filters one property at a time.

For each property the engine determines whether it represents

```
Simple Equality

↓

Operator Expression

↓

Logical Operator

↓

Deep Object Comparison
```

Every document must satisfy every applicable condition before being returned.

---

# Unsupported Operators

BrowserDB intentionally keeps its query language small.

The following MongoDB operators are **not** currently supported.

```
$regex

$exists

$expr

$text

$geoWithin

$elemMatch

$not

$nor
```

Keeping the operator set compact allows BrowserDB to remain lightweight while covering the overwhelming majority of client-side filtering needs.

Future releases may expand this list without breaking existing queries.

---

# Query Examples

Find active adults

```ts
await users.find({

    age:{

        $gte:18

    },

    active:true

});
```

---

Find premium users from several countries

```ts
await users.find({

    premium:true,

    country:{

        $in:[

            "India",

            "Japan",

            "Canada"

        ]

    }

});
```

---

Find administrators or moderators

```ts
await users.find({

    role:{

        $in:[

            "admin",

            "moderator"

        ]

    }

});
```

---

Find verified users older than 30

```ts
await users.find({

    verified:true,

    age:{

        $gt:30

    }

});
```

---

Find inactive accounts

```ts
await users.find({

    active:false

});
```

---

# Performance Considerations

Although BrowserDB evaluates queries entirely inside the browser, several optimizations help keep filtering efficient.

- Queries by `_id` are optimized using an internal in-memory index instead of scanning every document.
- Expired TTL documents are removed before query evaluation begins.
- Filters are evaluated before sorting or pagination to reduce unnecessary work.
- Returned documents are cloned to prevent accidental mutations.
- Primary-key lookups bypass the general filter path whenever possible.

For most client-side applications, these optimizations provide excellent performance even for collections containing thousands of documents.

---

# Find Options

Finding the correct documents is only the first step.

Real-world applications rarely display every matching document exactly as it exists in storage.

Instead, applications often need to:

- Sort results
- Skip previous records
- Limit returned documents
- Hide sensitive fields
- Select only the information required

BrowserDB provides these capabilities through **Find Options**.

```ts
await users.find(

    {},

    {

        sort: {

            age: -1

        },

        skip: 20,

        limit: 10,

        projection: {

            password: 0

        }

    }

);
```

Find options never modify stored documents.

They only affect the returned result set.

---

# Overview

Available options

| Option | Purpose |
|----------|---------|
| sort | Order returned documents |
| skip | Ignore first N results |
| limit | Return only N documents |
| projection | Include or exclude specific fields |

These options may be freely combined.

---

# Sorting

Sorting determines the order in which documents are returned.

Ascending

```ts
sort:{

    age:1

}
```

Descending

```ts
sort:{

    age:-1

}
```

---

## Ascending Order

```ts
await users.find(

    {},

    {

        sort:{

            age:1

        }

    }

);
```

Stored documents

```text
Charlie 31

Alice 22

Bob 27
```

Returned

```text
Alice 22

Bob 27

Charlie 31
```

---

## Descending Order

```ts
await users.find(

    {},

    {

        sort:{

            age:-1

        }

    }

);
```

Returned

```text
Charlie 31

Bob 27

Alice 22
```

---

# Sorting Multiple Fields

Sorting is not limited to a single property.

```ts
await users.find(

    {},

    {

        sort:{

            country:1,

            age:-1

        }

    }

);
```

BrowserDB compares fields in declaration order.

Equivalent logic

```
Compare Country

↓

Same Country?

↓

Compare Age
```

This produces stable, predictable ordering.

---

Example

Stored

```text
India 21

India 30

USA 18

USA 42
```

Result

```text
India 30

India 21

USA 42

USA 18
```

---

# Skip

`skip` ignores a specified number of documents.

```ts
await users.find(

    {},

    {

        skip:10

    }

);
```

Equivalent

```
Ignore first 10

↓

Return remaining
```

---

Example

Stored

```
1

2

3

4

5
```

```ts
skip:2
```

Result

```
3

4

5
```

---

# Limit

Limits the number of returned documents.

```ts
await users.find(

    {},

    {

        limit:5

    }

);
```

Only five documents are returned even if thousands exist.

---

Example

Stored

```
1

2

3

4

5

6

7
```

Limit

```ts
3
```

Result

```
1

2

3
```

---

# Pagination

Skip and Limit work together to implement pagination.

Page 1

```ts
skip:0,

limit:10
```

Page 2

```ts
skip:10,

limit:10
```

Page 3

```ts
skip:20,

limit:10
```

General formula

```text
skip =

(page - 1)

×

pageSize
```

Example

```ts
const page = 3;

const pageSize = 25;

await users.find(

    {},

    {

        skip:(page-1)*pageSize,

        limit:pageSize

    }

);
```

Perfect for

- Data tables
- Infinite scrolling
- Search results
- Dashboards
- APIs

---

# Projection

Projection controls which fields appear in returned documents.

Instead of returning every property,

BrowserDB can include or exclude specific fields.

There are two projection modes.

```
Inclusive

Exclusive
```

---

# Inclusive Projection

Select only required fields.

```ts
projection:{

    name:1,

    age:1

}
```

Stored

```ts
{

    _id:"1",

    name:"Alice",

    age:22,

    password:"secret",

    email:"alice@example.com"

}
```

Returned

```ts
{

    _id:"1",

    name:"Alice",

    age:22

}
```

Everything else disappears.

---

## Why Use Inclusive Projection?

Imagine displaying a user list.

You probably don't need

- passwords
- addresses
- permissions
- preferences
- profile settings

Instead

```ts
projection:{

    name:1,

    avatar:1
}
```

returns only what the UI needs.

Smaller objects mean

- less memory
- less cloning
- cleaner code

---

# Exclusive Projection

Sometimes it's easier to hide only a few fields.

```ts
projection:{

    password:0

}
```

Stored

```ts
{

    name:"Alice",

    password:"secret",

    email:"alice@example.com"

}
```

Returned

```ts
{

    name:"Alice",

    email:"alice@example.com"

}
```

Everything except

```
password
```

remains.

---

# The Special _id Field

BrowserDB always preserves `_id`.

Even when using projection.

```ts
projection:{

    name:1
}
```

Result

```ts
{

    _id:"123",

    name:"Alice"

}
```

Why?

Because `_id` uniquely identifies the document.

Without it,

subsequent updates become difficult.

---

# Combining Options

Every option can be combined.

```ts
await users.find(

    {

        verified:true

    },

    {

        sort:{

            age:-1

        },

        skip:20,

        limit:10,

        projection:{

            password:0

        }

    }

);
```

Execution order

```
Filter

↓

Sort

↓

Skip

↓

Limit

↓

Projection

↓

Clone

↓

Return
```

Notice that projection occurs **after** pagination.

BrowserDB never projects documents that will later be discarded.

---

# Common Patterns

## Latest Users

```ts
await users.find(

    {},

    {

        sort:{

            createdAt:-1

        },

        limit:10

    }

);
```

---

## Highest Scores

```ts
await scores.find(

    {},

    {

        sort:{

            score:-1

        },

        limit:100

    }

);
```

---

## Hide Passwords

```ts
projection:{

    password:0
}
```

---

## Mobile API Response

```ts
projection:{

    name:1,

    avatar:1,

    online:1
}
```

Only the fields required by the mobile interface are returned.

---

## Infinite Scroll

```ts
await posts.find(

    {},

    {

        sort:{

            createdAt:-1

        },

        skip:page*20,

        limit:20

    }

);
```

---

# Internal Processing

BrowserDB processes options in a fixed sequence.

```
Collection

↓

Remove Expired Documents

↓

Apply Filter

↓

Sort

↓

Slice (Skip/Limit)

↓

Projection

↓

Clone

↓

Return
```

This order is intentional.

For example,

pagination happens **before cloning**, avoiding unnecessary object allocations.

Projection also occurs after pagination, ensuring BrowserDB only reshapes documents that will actually be returned. This minimizes both CPU work and memory usage for large result sets.

---

# Performance Considerations

Sorting is generally the most expensive operation because every matching document must be compared.

Pagination is inexpensive because it uses array slicing after filtering.

Projection is relatively cheap since BrowserDB only copies the requested properties into new objects.

Primary-key lookups (`_id`) remain the fastest retrieval path because BrowserDB maintains an in-memory index for identifiers instead of scanning the collection. Other filters fall back to the general query matcher.

---

# Best Practices

✔ Always use `limit()` for large collections.

Returning thousands of documents when only twenty are displayed wastes memory.

---

✔ Project only required fields.

Instead of

```ts
find()
```

prefer

```ts
projection:{

    name:1,

    avatar:1
}
```

when building list views.

---

✔ Sort before paginating.

BrowserDB already does this internally.

Never attempt to sort pages individually in application code.

---

✔ Prefer `_id` lookups whenever possible.

```ts
await users.findOne({

    _id:userId

});
```

This is the fastest query BrowserDB can execute.

---

# Under the Hood

Although Find Options appear simple, BrowserDB performs several optimizations internally.

- TTL cleanup occurs before any filtering.
- Simple `_id` lookups use an in-memory index instead of a linear scan.
- Sorting is performed only after filtering reduces the candidate set.
- Pagination uses efficient array slicing.
- Projection creates new lightweight document objects.
- Returned documents are deeply cloned before leaving the database layer, preventing accidental mutations from affecting stored data.

These implementation details help BrowserDB remain responsive even when collections contain thousands of documents.

---

# Transactions

Transactions allow multiple database operations to execute as a single atomic unit.

Either **every operation succeeds**, or **none of them are applied**.

This property is known as **atomicity**, one of the core principles of reliable database systems.

Without transactions, applications risk leaving the database in an inconsistent state whenever an operation fails halfway through.

BrowserDB prevents this by ensuring that a transaction either commits completely or rolls back every affected collection.

---

# Why Transactions Matter

Imagine transferring money.

```ts
await accounts.updateOne(

    {

        _id: "alice"

    },

    {

        $inc: {

            balance: -100

        }

    }

);

await accounts.updateOne(

    {

        _id: "bob"

    },

    {

        $inc: {

            balance: 100

        }

    }

);
```

Now imagine the browser crashes after the first update.

Result

```
Alice

↓

-100

Bob

↓

No Change
```

Money has disappeared.

Transactions eliminate this possibility.

---

# Creating a Transaction

Transactions are created through the database instance.

```ts
await db.transaction(

    async () => {

        // Operations...

    }

);
```

Everything executed inside the callback belongs to the same transaction.

---

# Example

```ts
await db.transaction(

    async () => {

        await users.insertOne({

            name: "Alice"

        });

        await orders.insertOne({

            orderId: 123

        });

    }

);
```

Both inserts succeed together.

If either fails,

neither document is stored.

---

# Transaction Lifecycle

Internally BrowserDB follows a carefully ordered sequence.

```
Begin Transaction

↓

Take Collection Snapshots

↓

Enable Batch Mode

↓

Execute User Code

↓

Commit Every Collection

↓

Success?

↓

YES

↓

Notify Subscribers

↓

Finish

──────────────

NO

↓

Rollback

↓

Restore Snapshots

↓

Throw Error
```

Every stage is deterministic.

---

# Snapshot Backups

Before the first write occurs,

BrowserDB creates a snapshot of every collection participating in the transaction.

```
Users

↓

Clone

Orders

↓

Clone

Products

↓

Clone
```

These snapshots remain untouched throughout the transaction.

If rollback becomes necessary,

BrowserDB restores them exactly as they were before execution began.

This guarantees consistency even if dozens of operations have already completed.

---

# Example

Suppose storage contains

```text
Users

Alice

Bob

Orders

#100

#101
```

Transaction

```ts
await db.transaction(

    async()=>{

        await users.deleteOne({

            _id:"alice"

        });

        await orders.insertOne({

            id:102

        });

        throw new Error();

    }

);
```

Result

```
Rollback
```

Final database

```text
Users

Alice

Bob

Orders

#100

#101
```

Nothing changed.

---

# Batch Mode

During a transaction,

BrowserDB does **not** immediately write every operation to storage.

Instead,

collections enter **batch mode**.

```
insertOne()

↓

Pending

↓

updateOne()

↓

Pending

↓

deleteOne()

↓

Pending

↓

Commit
```

This reduces storage writes and guarantees subscribers never observe partially completed transactions.

---

# Deferred Writes

Consider

```ts
await db.transaction(

    async()=>{

        await users.insertOne(...);

        await users.insertOne(...);

        await users.insertOne(...);

    }

);
```

Without batching

```
Write

↓

Write

↓

Write
```

With BrowserDB

```
Queue

↓

Queue

↓

Queue

↓

Single Commit
```

The result is both safer and more efficient.

---

# Deferred Subscriptions

Subscribers should only observe committed data.

Suppose

```ts
users.subscribe(...);
```

and

```ts
await db.transaction(

    async()=>{

        await users.insertOne({

            name:"Alice"

        });

        await users.insertOne({

            name:"Bob"

        });

    }

);
```

Subscribers receive

```
Alice

Bob
```

once.

They never receive

```
Alice

↓

Alice + Bob
```

during the transaction.

BrowserDB intentionally delays subscription delivery until every collection commits successfully.

This prevents inconsistent UI updates and unnecessary re-rendering.

---

# Cross-Collection Transactions

Transactions are not limited to a single collection.

```ts
await db.transaction(

    async()=>{

        await users.insertOne({

            name:"Alice"

        });

        await orders.insertOne({

            id:123

        });

        await inventory.updateOne(

            {

                sku:"ABC"

            },

            {

                $inc:{

                    stock:-1

                }

            }

        );

    }

);
```

All three collections commit together.

---

# Automatic Rollback

If **any** operation throws,

BrowserDB restores every affected collection.

```ts
await db.transaction(

    async()=>{

        await users.insertOne({

            _id:"alice"

        });

        await users.insertOne({

            _id:"alice"

        });

    }

);
```

Second insert

↓

```
DuplicateKeyError
```

↓

Rollback

↓

First insert disappears

The collection returns to its original state.

---

# Nested Transactions

Nested transactions are intentionally prohibited.

```ts
await db.transaction(

    async()=>{

        await db.transaction(

            async()=>{

            }

        );

    }

);
```

Throws

```
DatabaseError

Nested transactions are not supported.
```

Allowing nested transactions introduces significant complexity around savepoints and partial rollbacks.

BrowserDB intentionally keeps transaction semantics simple and predictable.

---

# Exception Handling

Applications may handle failures normally.

```ts
try{

    await db.transaction(

        async()=>{

            ...

        }

    );

}

catch(error){

    console.error(error);

}
```

Once the Promise rejects,

the rollback has already completed.

No manual recovery is necessary.

---

# Reading During Transactions

Read operations performed inside a transaction observe the transaction's current state.

```ts
await db.transaction(

    async()=>{

        await users.insertOne({

            name:"Alice"

        });

        const all = await users.find();

    }

);
```

The inserted document is visible inside the transaction,

even though external subscribers cannot yet observe it.

---

# Middleware

Hooks execute normally inside transactions.

```
beforeInsert()

↓

Insert

↓

afterInsert()

↓

Commit
```

If rollback occurs,

the hooks have already executed,

but the data itself is restored.

For this reason,

hooks should avoid irreversible side effects whenever possible.

For example,

sending emails from an `afterInsert()` hook is generally discouraged because the transaction could later fail.

---

# Performance

Transactions improve consistency,

but they also introduce additional work.

BrowserDB must

- Clone every participating collection.
- Maintain rollback snapshots.
- Queue writes.
- Delay subscriptions.
- Commit batches.
- Restore snapshots if necessary.

For small transactions this overhead is negligible.

For very large collections,

snapshot creation becomes the dominant cost.

---

# Best Practices

## Keep Transactions Short

Good

```ts
await db.transaction(

    async()=>{

        await users.insertOne(...);

        await orders.insertOne(...);

    }

);
```

Avoid

```ts
await db.transaction(

    async()=>{

        await fetch(...);

        await sleep(5000);

        await users.insertOne(...);

    }

);
```

Long-running transactions delay commits and increase rollback costs.

---

## Don't Perform Network Requests

Transactions should only perform database work.

Waiting for HTTP requests keeps every participating collection in batch mode longer than necessary.

Instead

```
Fetch

↓

Validate

↓

Begin Transaction

↓

Write
```

---

## Group Related Changes

Use transactions only when operations depend upon one another.

Good examples

- Money transfers
- Shopping checkout
- Inventory updates
- User creation + profile creation
- Multi-collection imports

Independent writes generally do not require a transaction.

---

# Under the Hood

BrowserDB's transaction system is implemented entirely at the database layer.

Unlike IndexedDB transactions, which are limited to a single database context, BrowserDB coordinates every instantiated collection through a shared batching mechanism.

Internally it performs the following steps:

```
Clone Every Collection

↓

Enable Batching

↓

Execute Callback

↓

Commit Every Collection

↓

Failure?

↓

Restore Snapshots

↓

Disable Batching

↓

Flush Pending Subscriptions
```

This approach allows BrowserDB to provide predictable transactional behavior regardless of the active storage backend.

Whether a collection is backed by compressed localStorage or IndexedDB, transaction semantics remain exactly the same.

---
# Reactive Subscriptions

Modern applications should not require developers to manually refresh data after every database operation.

When a document changes, the user interface should immediately reflect that change.

BrowserDB provides **reactive subscriptions** that automatically notify your application whenever matching documents are inserted, updated, deleted, or expire.

Unlike polling, subscriptions are event-driven.

```
Database Changes

↓

BrowserDB

↓

Matching Subscribers

↓

Your UI Updates
```

Applications no longer need code like

```ts
setInterval(async()=>{

    const users = await collection.find();

    render(users);

},1000);
```

Instead

```ts
users.subscribe(

    {},

    render

);
```

The UI updates automatically.

---

# Why Subscriptions?

Consider a chat application.

When a new message arrives,

every connected chat window should update immediately.

Without subscriptions

```
Insert Message

↓

Refresh Chat

↓

Render Again
```

Every component must remember to refresh itself.

With BrowserDB

```
Insert Message

↓

BrowserDB Detects Change

↓

Notify Subscribers

↓

UI Updates Automatically
```

No manual refresh is required.

---

# Creating a Subscription

Subscribe to every document.

```ts
const unsubscribe = users.subscribe(

    {},

    users=>{

        render(users);

    }

);
```

Whenever the collection changes,

the callback executes again.

---

# Signature

```ts
subscribe(

    filter,

    callback

):()=>void
```

The returned function removes the subscription.

---

# Unsubscribing

```ts
const unsubscribe = users.subscribe(

    {},

    callback

);

unsubscribe();
```

After unsubscribing,

future database changes no longer invoke the callback.

Always unsubscribe when components are destroyed to avoid unnecessary work.

---

# Initial Delivery

Unlike many event systems,

BrowserDB immediately invokes the callback with the current query result.

```ts
users.subscribe(

    {

        online:true

    },

    online=>{

        console.log(online);

    }

);
```

If three users are already online,

the callback immediately receives

```
Alice

Bob

Charlie
```

before any future changes occur.

This makes subscriptions ideal for UI frameworks because components can render initial state without performing a separate `find()` call.

---

# Filtered Subscriptions

Subscriptions are query-aware.

Only matching documents are delivered.

```ts
users.subscribe(

    {

        verified:true

    },

    renderVerified

);
```

Changes to unverified users do not trigger the callback.

---

Another example

```ts
orders.subscribe(

    {

        status:"pending"

    },

    renderPendingOrders

);
```

Only pending orders are tracked.

---

# Dynamic Updates

Suppose

```
Alice

verified=false
```

Subscription

```ts
users.subscribe(

    {

        verified:true

    },

    callback

);
```

Alice is not included.

Later

```ts
await users.updateOne(

    {

        name:"Alice"

    },

    {

        $set:{

            verified:true

        }

    }

);
```

BrowserDB reevaluates the query.

Alice now appears in the callback result automatically.

No manual refresh is required.

---

# Insertions

Suppose

```ts
users.subscribe(

    {

        premium:true

    },

    callback

);
```

Insert

```ts
await users.insertOne({

    name:"Alice",

    premium:true

});
```

Alice immediately appears.

---

Insert

```ts
await users.insertOne({

    name:"Bob",

    premium:false

});
```

Bob does **not** appear.

Only matching documents trigger updates.

---

# Updates

Suppose

```
Alice

premium=false
```

Subscription

```ts
premium:true
```

Update

```ts
$set:{

    premium:true

}
```

BrowserDB notices that the document now satisfies the filter.

Subscribers receive

```
Alice
```

automatically.

---

# Deletions

Deleting a matching document also updates subscribers.

Before

```
Alice

Bob

Charlie
```

Delete

```ts
await users.deleteOne({

    name:"Bob"

});
```

Subscribers receive

```
Alice

Charlie
```

---

# TTL Expiration

Subscriptions also respond to automatic expiration.

Suppose

```ts
await cache.insertOne(

    result,

    {

        ttlMs:5000

    }

);
```

Five seconds later

```
Cache Entry

↓

Expires

↓

Removed

↓

Subscribers Notified
```

Applications do not need to manually monitor expiration timers.

---

# Cross-Tab Synchronization

One of BrowserDB's most powerful features is automatic synchronization between browser tabs.

Suppose

```
Tab A

↓

Insert User
```

BrowserDB broadcasts the change.

```
BroadcastChannel

↓

Tab B

↓

Refresh Collection

↓

Notify Subscribers
```

Every open tab remains synchronized.

No page refresh is required.

This makes BrowserDB particularly useful for

- dashboards
- collaborative tools
- admin panels
- PWAs
- multi-window applications

---

# How Cross-Tab Sync Works

Whenever a collection changes,

BrowserDB publishes a lightweight notification through the browser's `BroadcastChannel` API.

Other BrowserDB instances listening on the same channel receive the notification,

reload the affected collection if necessary,

and reevaluate active subscriptions.

The application never has to coordinate browser tabs manually.

---

# Subscription Lifecycle

Every subscription follows the same lifecycle.

```
Create Subscription

↓

Run Initial Query

↓

Deliver Initial Result

↓

Wait For Changes

↓

Collection Modified

↓

Reevaluate Query

↓

Deliver Updated Result

↓

Unsubscribe

↓

Destroy
```

---

# Multiple Subscribers

Collections may have any number of subscribers.

```ts
users.subscribe(...);

users.subscribe(...);

users.subscribe(...);
```

Every subscriber receives independent query results.

One callback cannot interfere with another.

---

# Subscription Isolation

Each subscription maintains its own

- filter
- callback
- cached result

Updating one subscription never affects another.

For example

```ts
users.subscribe(

    {

        online:true

    },

    renderOnline

);

users.subscribe(

    {

        premium:true

    },

    renderPremium

);
```

Each callback receives exactly the documents matching its own filter.

---

# Transactions and Subscriptions

Subscriptions integrate seamlessly with transactions.

Suppose

```ts
await db.transaction(

    async()=>{

        await users.insertOne({

            name:"Alice"

        });

        await users.insertOne({

            name:"Bob"

        });

    }

);
```

Subscribers receive

```
Alice

Bob
```

once.

They do **not** receive

```
Alice

↓

Alice

Bob
```

during the transaction.

BrowserDB intentionally delays notifications until the transaction commits successfully.

This prevents inconsistent UI states and unnecessary rendering.

---

# Performance

Subscriptions are designed to remain lightweight.

BrowserDB avoids

- constant polling
- repeated timers
- unnecessary callbacks

Instead,

callbacks execute only when a change could affect their query result.

Because subscriptions reuse BrowserDB's query engine,

they support exactly the same filtering capabilities as `find()`.

---

# Best Practices

## Always Unsubscribe

```ts
const stop = users.subscribe(...);

stop();
```

Removing unused subscriptions prevents memory leaks.

---

## Use Specific Filters

Instead of

```ts
{}
```

prefer

```ts
{

    online:true

}
```

when only online users matter.

Smaller result sets generally mean less work.

---

## Avoid Heavy Callbacks

Good

```ts
users.subscribe(

    {},

    render

);
```

Avoid

```ts
users.subscribe(

    {},

    async()=>{

        await fetch(...);

    }

);
```

Callbacks should update application state,

not perform expensive background work.

---

## Prefer One Subscription

Instead of repeatedly calling

```ts
find()
```

after every operation,

maintain a single subscription.

BrowserDB will keep it synchronized automatically.

---

# Under the Hood

Internally BrowserDB maintains a registry of active subscriptions for every collection.

Whenever a write operation commits,

the affected collection evaluates which subscriptions may have changed.

Each subscription's query is re-executed,

its result is compared,

and only then is the callback invoked.

During transactions,

these notifications are deferred until commit.

Across browser tabs,

BroadcastChannel messages trigger the same reevaluation process,

ensuring every BrowserDB instance converges on the same state.

The result is a reactive system that behaves consistently regardless of whether the change originated locally, from another tab, or from a committed transaction.

---

# Hybrid Storage Engine

One of BrowserDB's defining features is its **Hybrid Storage Engine**.

Instead of forcing applications to choose between `localStorage` and `IndexedDB`, BrowserDB can intelligently combine both into a single storage abstraction.

Applications interact with collections—not browser storage APIs.

Whether data ultimately lives in localStorage or IndexedDB is entirely managed by BrowserDB.

```text
Application

        │

        ▼

BrowserDB Collection

        │

        ▼

Hybrid Storage Engine

   ┌───────────────┐
   │               │
   ▼               ▼

localStorage   IndexedDB
```

This allows applications to begin lightweight while automatically scaling to much larger datasets without changing application code.

---

# Why Hybrid Storage?

Browsers provide two primary persistence mechanisms.

Neither is perfect.

## localStorage

Advantages

- Extremely fast
- Simple API
- Synchronous
- Universally supported

Disadvantages

- Small storage quota
- Strings only
- Blocks the main thread
- Unsuitable for very large datasets

---

## IndexedDB

Advantages

- Large storage capacity
- Supports Blobs
- Structured storage
- Asynchronous
- Better for large applications

Disadvantages

- Complex API
- Higher latency
- More initialization overhead

---

Most browser libraries force developers to decide between these storage engines.

BrowserDB doesn't.

It uses whichever storage engine best fits the collection.

---

# Choosing a Backend

Collections accept an optional backend configuration.

```ts
const users = db.collection(

    "users",

    {

        backend:"auto"

    }

);
```

Supported values

```
auto

localStorage

indexedDB
```

---

# Automatic Mode

Automatic mode is the default.

```ts
backend:"auto"
```

BrowserDB initially stores every document inside compressed localStorage.

```
Insert

↓

Compress

↓

localStorage
```

This provides the fastest possible startup.

---

If storage eventually becomes full

```
Quota Exceeded

↓

Automatic Migration

↓

IndexedDB

↓

Continue
```

No application code changes.

No data loss.

No user interaction.

The migration is completely transparent.

---

# localStorage Mode

Applications may explicitly request localStorage.

```ts
backend:"localStorage"
```

BrowserDB never migrates this collection unless instructed otherwise.

Recommended for

- Settings
- User preferences
- Feature flags
- Recently viewed items
- Authentication state

Collections remain extremely lightweight.

---

# IndexedDB Mode

Applications may also begin directly inside IndexedDB.

```ts
backend:"indexedDB"
```

Recommended for

- Offline-first applications
- Large datasets
- Thousands of documents
- File metadata
- Long-term storage

Because IndexedDB avoids localStorage's quota limitations,

it becomes the preferred backend for persistent application data.

---

# Automatic Migration

One of BrowserDB's most powerful capabilities is automatic migration.

Imagine a collection begins here.

```
localStorage

↓

500 KB

↓

2 MB

↓

4 MB

↓

Quota Reached
```

Instead of throwing an error,

BrowserDB automatically performs

```
Read Documents

↓

Create IndexedDB Store

↓

Write Documents

↓

Verify

↓

Delete localStorage Copy

↓

Continue
```

The application never notices.

The collection object remains identical.

Existing references continue working.

---

# Migration Example

```ts
const posts = db.collection(

    "posts",

    {

        backend:"auto"

    }

);

await posts.insertMany(

    thousandsOfPosts

);
```

Eventually BrowserDB determines

```
Storage Full
```

Migration begins automatically.

Subsequent operations now target IndexedDB.

No API changes.

No additional configuration.

---

# Migration Safety

Migration is intentionally conservative.

BrowserDB does **not** immediately delete the original storage.

Instead the process resembles

```
Read Original

↓

Write New Backend

↓

Verify Success

↓

Switch Backend

↓

Delete Original
```

If migration fails,

the original data remains untouched.

This greatly reduces the risk of data loss caused by interrupted writes or browser crashes.

---

# Recovery

Suppose the browser closes during migration.

```
Migration

↓

Browser Closed
```

On the next startup,

BrowserDB detects the incomplete migration,

repairs the storage state,

and continues using the correct backend.

Applications generally never need to perform manual recovery.

---

# Storage Keys

Each collection receives its own storage namespace.

```
users

↓

browserdb.users
```

```
orders

↓

browserdb.orders
```

```
settings

↓

browserdb.settings
```

Collections never overwrite one another.

Metadata is stored independently from document contents.

---

# Persistence Format

BrowserDB never stores raw JavaScript objects directly.

Instead documents pass through several stages.

```
Documents

↓

Normalize

↓

Serialize

↓

Compress

↓

Persist
```

The exact storage format is considered an implementation detail.

Applications should always access data through BrowserDB APIs rather than browser storage directly.

---

# Storage Initialization

Creating a collection does not immediately allocate browser storage.

```
db.collection()

↓

Collection Created

↓

No Storage
```

Only the first write triggers persistence.

```
insertOne()

↓

Initialize Backend

↓

Persist
```

Lazy initialization improves startup performance for applications with many collections.

---

# Backend Independence

One of BrowserDB's design goals is ensuring that higher-level features behave identically regardless of storage backend.

Whether a collection lives inside localStorage or IndexedDB,

the following APIs remain exactly the same.

```ts
find()

insertOne()

updateOne()

deleteOne()

subscribe()

transaction()
```

Applications never need conditional logic like

```ts
if(indexedDB){

    ...

}
```

Storage becomes an implementation detail.

---

# Quota Handling

Running out of browser storage is inevitable.

Instead of immediately throwing an exception,

BrowserDB attempts several recovery strategies.

```
Write

↓

Quota Error

↓

Cleanup Expired Documents

↓

Apply Eviction Policy

↓

Retry

↓

Migrate To IndexedDB

↓

Retry

↓

Throw QuotaExceededError
```

Only after every recovery strategy has failed does BrowserDB report the error to the application.

This allows many applications to continue working even under storage pressure.

---

# Eviction Integration

Collections configured with automatic eviction may recover storage before migration occurs.

```
Quota

↓

Remove Expired Documents

↓

Enough Space?

↓

YES

↓

Continue

──────────

NO

↓

Migrate
```

This minimizes unnecessary backend transitions.

---

# Storage Isolation

Each collection manages its own persistence.

```
Users

↓

localStorage

Orders

↓

IndexedDB

Settings

↓

localStorage

Gallery

↓

IndexedDB
```

Different collections may use different storage engines simultaneously.

This allows applications to optimize storage for each type of data.

---

# Why Not Always Use IndexedDB?

A common question is:

> Why not simply store everything in IndexedDB?

Because localStorage still provides important advantages.

For small collections,

localStorage

- initializes instantly,
- requires no asynchronous database setup,
- has lower overhead,
- and often performs faster for lightweight datasets.

BrowserDB therefore treats IndexedDB as a scaling mechanism rather than the default for every workload.

---

# Best Practices

## Use Automatic Mode

Unless your application has specific requirements,

leave the backend as

```ts
backend:"auto"
```

BrowserDB will choose the appropriate storage engine.

---

## Reserve IndexedDB for Large Data

Large collections such as

- messages
- products
- notes
- documents
- offline content

benefit significantly from IndexedDB.

---

## Keep Small Collections Small

Settings,

preferences,

feature flags,

and session information rarely justify IndexedDB's additional complexity.

---

## Don't Access Browser Storage Directly

Avoid

```ts
localStorage.getItem(...)
```

for BrowserDB collections.

Doing so bypasses

- compression
- migrations
- validation
- transactions
- synchronization

Always use the BrowserDB API.

---

# Under the Hood

Although BrowserDB exposes a single Collection API,

its storage layer is composed of interchangeable persistence engines.

Every collection communicates with an abstract storage interface responsible for

- loading documents,
- persisting changes,
- removing data,
- performing migrations,
- broadcasting updates,
- and recovering from failures.

Because the higher-level database never interacts directly with browser storage,

new persistence engines can be introduced in the future without changing the Collection API.

This separation of concerns is what allows BrowserDB to transparently migrate collections, recover from quota exhaustion, and provide identical behavior across both localStorage and IndexedDB.

---

# Compression & Serialization

Modern browsers impose relatively small limits on `localStorage`.

Simply storing JSON strings wastes a surprising amount of space because every document repeats the same property names over and over again.

BrowserDB solves this problem using a multi-stage serialization pipeline designed specifically for browser storage.

Instead of storing raw JSON,

BrowserDB transforms documents through several optimization stages before persistence.

```
Documents

↓

Schema Serialization

↓

JSON

↓

Deflate Compression

↓

UTF-16 Packing

↓

localStorage
```

The reverse process occurs automatically whenever data is loaded.

Applications never need to manually compress or decompress anything.

---

# Why Not Store JSON?

Consider three simple documents.

```json
[
    {
        "name":"Alice",
        "age":22
    },
    {
        "name":"Bob",
        "age":30
    },
    {
        "name":"Charlie",
        "age":28
    }
]
```

Notice how

```
name

age
```

appear repeatedly.

With thousands of documents,

those repeated property names occupy a significant amount of storage.

BrowserDB eliminates this redundancy.

---

# Schema-Aware Serialization

Instead of storing each document independently,

BrowserDB first discovers every field used throughout the collection.

Suppose the collection contains

```ts
[

    {

        name:"Alice",

        age:22

    },

    {

        name:"Bob",

        age:30

    }

]
```

BrowserDB extracts the schema.

```
Keys

↓

[

    "name",

    "age"

]
```

Each document then becomes a row.

```
Rows

↓

[

    [

        "Alice",

        22

    ],

    [

        "Bob",

        30

    ]

]
```

Final serialized structure

```ts
{

    keys:[

        "name",

        "age"

    ],

    rows:[

        [

            "Alice",

            22

        ],

        [

            "Bob",

            30

        ]

    ]

}
```

Property names now exist only once.

---

# Why Rows?

Imagine ten thousand users.

Traditional JSON stores

```
"name"
```

ten thousand times.

BrowserDB stores

```
"name"
```

once.

The same applies to every repeated property.

```
email

age

country

verified

createdAt

...
```

As collections grow,

the space savings become increasingly significant.

---

# Reconstruction

When data is read,

BrowserDB rebuilds normal JavaScript objects.

Stored representation

```ts
{

    keys:[

        "name",

        "age"

    ],

    rows:[

        [

            "Alice",

            22

        ]

    ]

}
```

Becomes

```ts
{

    name:"Alice",

    age:22

}
```

Applications never see the serialized format.

Only ordinary JavaScript objects are returned.

---

# Optional Compression

After serialization,

BrowserDB checks whether the browser supports the native

```
CompressionStream
```

API.

If available,

the serialized JSON is compressed using the browser's built-in Deflate implementation.

```
Serialized JSON

↓

Deflate

↓

Compressed Binary
```

This stage is completely automatic.

No configuration is required.

---

# Browser Compatibility

Not every browser implements

```
CompressionStream
```

If unavailable,

BrowserDB simply stores the serialized JSON directly.

```
Compression Available?

↓

YES

↓

Compress

──────────────

NO

↓

Store Plain Serialized JSON
```

Applications behave identically regardless of browser capabilities.

Compression is an optimization,

not a requirement.

---

# Why Deflate?

Deflate has several advantages.

- Widely supported
- Fast
- Excellent compression ratio
- Native browser implementation
- No external dependencies

Because BrowserDB relies on browser-native compression,

applications avoid shipping additional compression libraries.

---

# UTF-16 Packing

Compressed data is binary.

Unfortunately,

`localStorage` stores **UTF-16 strings**, not binary data.

Many applications solve this by converting binary into Base64.

BrowserDB intentionally does **not** use Base64.

Instead,

it packs compressed bytes directly into UTF-16 characters.

```
Compressed Bytes

↓

UTF-16 Packing

↓

Storage String
```

This representation is considerably more space-efficient than Base64.

---

# Why Not Base64?

Base64 expands data by approximately

```
33%
```

before it even reaches localStorage.

BrowserDB's UTF-16 packing instead packs binary into 15-bit chunks while avoiding surrogate code points.

The result is a denser representation that better matches how browsers internally store strings.

For applications storing thousands of documents,

this difference becomes substantial.

---

# Complete Storage Pipeline

Putting everything together,

a write operation follows this sequence.

```
Documents

↓

Schema Serialization

↓

JSON Encoding

↓

Deflate Compression

↓

UTF-16 Packing

↓

localStorage
```

Reading performs the reverse sequence.

```
localStorage

↓

UTF-16 Unpacking

↓

Inflate

↓

Deserialize Rows

↓

Documents
```

Every stage is completely transparent.

Applications only work with JavaScript objects.

---

# Legacy Compatibility

Earlier BrowserDB versions stored collections as plain JSON arrays.

The storage engine automatically detects this format.

```
Old JSON

↓

Detected

↓

Read Successfully
```

or

```
Row Format

↓

Detected

↓

Deserialize
```

This allows older databases to continue working without manual migration.

---

# Corruption Detection

Compressed storage includes integrity checks throughout the decoding process.

If BrowserDB encounters invalid compressed data,

failed decompression,

or malformed serialized structures,

it throws

```
DataCorruptionError
```

instead of silently returning incorrect documents.

Applications can catch this exception and decide how to recover.

Failing fast is almost always safer than returning corrupted data.

---

# Missing Fields

Because every row follows a shared schema,

some documents may not define every property.

Suppose

```ts
{

    name:"Alice"

}
```

and

```ts
{

    name:"Bob",

    age:30

}
```

The serialized rows become

```text
Alice | undefined

Bob   | 30
```

During reconstruction,

undefined values are simply omitted,

recreating the original documents accurately.

---

# Compression Transparency

Compression never changes BrowserDB's programming model.

These operations behave exactly the same regardless of whether compression is enabled.

```ts
insertOne()

find()

updateOne()

replaceOne()

deleteOne()
```

Applications never need to know

- whether data is compressed,
- which serialization format is used,
- or how the storage engine persists it.

Compression is purely an implementation detail.

---

# Performance

Compression naturally introduces additional CPU work.

However,

BrowserDB minimizes this overhead.

- Schema extraction occurs only when writing.
- Native browser compression is highly optimized.
- Cached collections avoid repeated decompression.
- Reads return ordinary JavaScript objects.
- Serialization is deterministic and allocation-friendly.

For many applications,

the reduction in storage size outweighs the relatively small cost of compression.

---

# Best Practices

## Store Documents Normally

Avoid manually compressing values.

Instead of

```ts
{

    payload:

    compress(data)

}
```

store

```ts
{

    payload:data

}
```

BrowserDB already performs storage optimization automatically.

---

## Prefer Repeated Schemas

Collections containing similarly shaped documents benefit the most from row-based serialization.

For example

```
Users

Products

Orders

Messages
```

typically compress extremely well because every document shares many common fields.

---

## Don't Depend on Storage Format

Never read BrowserDB collections directly from `localStorage`.

The serialized representation may change between versions.

Always use the BrowserDB API.

---

# Under the Hood

BrowserDB's storage pipeline was designed specifically around the strengths and limitations of browser storage.

Instead of treating compression as a single step,

the engine first removes structural redundancy through schema-aware serialization,

then reduces entropy using Deflate,

and finally converts the resulting binary into an efficient UTF-16 representation suitable for `localStorage`.

Because these stages are independent,

each contributes a different kind of optimization:

- Schema serialization removes repeated keys.
- Deflate compresses repeated values and patterns.
- UTF-16 packing minimizes storage overhead for compressed binary.

Together they produce significantly smaller storage footprints than naïvely storing JSON strings.

Most importantly,

every optimization is completely transparent.

Developers continue working with ordinary JavaScript objects while BrowserDB handles serialization, compression, storage, and reconstruction automatically.

---

# Schema Validation

Applications should never allow invalid data to enter the database.

Incorrect data is far more expensive to fix later than it is to reject immediately.

BrowserDB provides built-in **JSON Schema validation** that automatically verifies every document before it is written to storage.

Validation occurs during

- `insertOne()`
- `insertMany()`
- `updateOne()`
- `replaceOne()`

If validation fails,

the operation is cancelled and nothing is written.

---

# Why Validation?

Imagine a user document.

```ts
{

    name:"Alice",

    age:25

}
```

Now suppose another part of the application accidentally inserts

```ts
{

    name:42,

    age:"old"

}
```

Without validation,

both documents would exist together.

Eventually,

parts of the application begin failing because they expect

```
name

↓

string
```

instead of

```
number
```

Validation prevents these problems before they reach storage.

---

# Creating a Validator

Validators are attached to a collection.

```ts
users.setValidator({

    $jsonSchema:{

        bsonType:"object",

        required:[

            "name",

            "age"

        ],

        properties:{

            name:{

                bsonType:"string"

            },

            age:{

                bsonType:"number"

            }

        }

    }

});
```

Every future write operation now uses this schema.

---

# Validation Pipeline

Every write operation follows the same sequence.

```
Clone Document

↓

Run Middleware

↓

Validate Schema

↓

Persist Storage

↓

Notify Subscribers
```

Invalid documents never reach storage.

---

# Required Fields

The `required` property specifies fields that must exist.

```ts
required:[

    "name",

    "email"
]
```

Valid

```ts
{

    name:"Alice",

    email:"alice@example.com"

}
```

Invalid

```ts
{

    name:"Alice"

}
```

Result

```
ValidationError
```

---

# Primitive Types

BrowserDB validates primitive types using

```
bsonType
```

Example

```ts
properties:{

    name:{

        bsonType:"string"

    },

    age:{

        bsonType:"number"

    },

    verified:{

        bsonType:"bool"

    }

}
```

Supported types

| Type | Description |
|------|-------------|
| string | Text |
| number | Numeric values |
| int | Integer (treated as number) |
| double | Floating-point number |
| bool | Boolean |
| object | Object |
| array | Array |
| null | Null |

---

# Multiple Types

Some fields may accept more than one type.

```ts
bsonType:[

    "string",

    "null"

]
```

Valid

```ts
nickname:"Bob"
```

Valid

```ts
nickname:null
```

Invalid

```ts
nickname:123
```

---

# Nested Objects

Schemas may validate nested structures.

```ts
properties:{

    address:{

        bsonType:"object",

        required:[

            "city"

        ],

        properties:{

            city:{

                bsonType:"string"

            },

            country:{

                bsonType:"string"

            }

        }

    }

}
```

Valid

```ts
{

    address:{

        city:"London",

        country:"UK"

    }

}
```

Missing

```
city
```

produces

```
ValidationError
```

---

# Arrays

Arrays may validate every element individually.

```ts
properties:{

    tags:{

        bsonType:"array",

        items:{

            bsonType:"string"

        }

    }

}
```

Valid

```ts
tags:[

    "typescript",

    "browserdb"

]
```

Invalid

```ts
tags:[

    "typescript",

    123
]
```

Every array element must satisfy the item schema.

---

# Enumerations

Restrict values to a predefined list.

```ts
properties:{

    role:{

        enum:[

            "user",

            "admin",

            "owner"

        ]

    }

}
```

Valid

```ts
role:"admin"
```

Invalid

```ts
role:"moderator"
```

Result

```
ValidationError
```

---

# Numeric Constraints

BrowserDB supports numeric ranges.

```ts
properties:{

    age:{

        bsonType:"number",

        minimum:0,

        maximum:120

    }

}
```

Valid

```ts
age:25
```

Invalid

```ts
age:-5
```

Invalid

```ts
age:500
```

---

# Combining Rules

Validation rules may be combined.

```ts
users.setValidator({

    $jsonSchema:{

        required:[

            "name",

            "age",

            "role"

        ],

        properties:{

            name:{

                bsonType:"string"

            },

            age:{

                bsonType:"number",

                minimum:18

            },

            role:{

                enum:[

                    "user",

                    "admin"

                ]

            }

        }

    }

});
```

Every rule must succeed before the document is accepted.

---

# Validation During Updates

Validation also applies to updates.

Suppose

```ts
age:25
```

Update

```ts
$set:{

    age:-10

}
```

BrowserDB applies the update,

then validates the modified document.

If validation fails,

the update is discarded.

The original document remains unchanged.

---

# Replacement Validation

Replacement documents undergo full validation.

```ts
replaceOne(

    {

        _id:"alice"

    },

    replacement
);
```

Unlike `$set`,

replacement validates the **entire** document because every field may change.

---

# Validation Errors

Validation failures throw

```
ValidationError
```

Example

```ts
try{

    await users.insertOne({

        age:-5

    });

}

catch(error){

    console.log(

        error

    );

}
```

Typical messages include

```
Field 'name' is required
```

```
Field 'age' must be >= 0
```

```
Field 'role' must be one of [user, admin]
```

```
Field 'address.city' is required
```

Notice that nested validation errors include the full property path,

making debugging considerably easier.

---

# Validation Order

BrowserDB validates recursively.

```
Root Object

↓

Required Fields

↓

Primitive Types

↓

Numeric Constraints

↓

Enums

↓

Arrays

↓

Nested Objects
```

Every nested property is checked independently.

---

# Middleware Interaction

Validation occurs **after** `beforeInsert()` and `beforeUpdate()` middleware.

```
beforeInsert()

↓

Modify Document

↓

Validate

↓

Persist
```

This allows middleware to automatically populate missing fields before validation.

Example

```ts
users.beforeInsert(doc=>{

    return{

        ...doc,

        createdAt:Date.now()

    };

});
```

If the schema requires

```
createdAt
```

the middleware satisfies the requirement automatically.

---

# Validation Is Atomic

Consider

```ts
await users.updateOne(

    {

        _id:"alice"

    },

    {

        $set:{

            age:-5

        }

    }

);
```

Validation fails.

Result

```
No Storage Write

↓

No Notifications

↓

Original Document Preserved
```

BrowserDB never stores partially valid documents.

---

# Best Practices

## Validate Every Collection

Even small collections benefit from validation.

A few lines of schema definition can prevent hours of debugging later.

---

## Use Required Fields Sparingly

Require fields that every document truly needs.

Optional properties should remain optional.

---

## Prefer Enums

Instead of

```ts
status:"anything"
```

restrict values.

```ts
enum:[

    "pending",

    "approved",

    "rejected"

]
```

This eliminates many accidental typos.

---

## Validate Arrays

Instead of validating only the array,

validate every element.

```ts
items:{

    bsonType:"string"

}
```

This ensures consistent data throughout the collection.

---

## Let Middleware Fill Defaults

Rather than forcing callers to specify timestamps,

IDs,

or metadata,

generate them automatically inside middleware before validation.

---

# Under the Hood

BrowserDB implements validation using a recursive evaluator inspired by MongoDB's `$jsonSchema`.

Instead of relying on an external validation library,

the engine walks the document tree directly,

checking required fields,

primitive types,

nested objects,

arrays,

enumerations,

and numeric constraints as it descends.

Validation stops immediately when the first rule fails,

throwing a descriptive `ValidationError`.

Because validation occurs before persistence,

the database never contains partially valid or structurally inconsistent documents.

Every successful write is guaranteed to satisfy the active schema.

---
# Middleware & Hooks

Applications often need to perform additional work whenever data changes.

For example,

- Automatically adding timestamps
- Logging changes
- Sanitizing input
- Enforcing business rules
- Generating slugs
- Updating metadata
- Performing audit logging

Instead of requiring every database operation to repeat this logic,

BrowserDB provides **Middleware Hooks**.

Hooks allow applications to intercept CRUD operations before or after they occur.

```
Application

↓

beforeInsert()

↓

Validation

↓

Storage

↓

afterInsert()

↓

Subscribers
```

Middleware keeps business logic centralized, reusable, and consistent across the entire application.

---

# Available Hooks

BrowserDB currently provides six lifecycle hooks.

| Hook | Called |
|-------|---------|
| beforeInsert | Before a document is inserted |
| afterInsert | After insertion succeeds |
| beforeUpdate | Before an update is applied |
| afterUpdate | After update succeeds |
| beforeDelete | Before deletion |
| afterDelete | After deletion |

Each hook participates automatically in BrowserDB's write pipeline.

---

# Registering Middleware

Hooks are attached directly to collections.

```ts
users.beforeInsert(

    doc=>{

        return doc;

    }

);
```

Once registered,

the hook executes for every matching operation.

---

# beforeInsert()

The most commonly used middleware.

Runs before validation and persistence.

```ts
users.beforeInsert(

    doc=>{

        doc.createdAt = Date.now();

        return doc;

    }

);
```

Now

```ts
await users.insertOne({

    name:"Alice"

});
```

becomes

```ts
{

    name:"Alice",

    createdAt:1718123000

}
```

without changing application code.

---

# Why beforeInsert?

Instead of

```ts
await users.insertOne({

    name:"Alice",

    createdAt:Date.now(),

    updatedAt:Date.now()

});
```

for every insert,

write

```ts
users.beforeInsert(...);
```

once.

Every future insert automatically receives the same behavior.

---

# Returning Documents

`beforeInsert()` should return the document that should actually be stored.

Example

```ts
users.beforeInsert(

    doc=>{

        return{

            ...doc,

            verified:false

        };

    }

);
```

Returned document

```ts
{

    name:"Alice",

    verified:false

}
```

This makes middleware ideal for generating default values.

---

# Sanitizing Data

Middleware can normalize user input.

```ts
users.beforeInsert(

    doc=>{

        doc.email =

            doc.email

                .trim()

                .toLowerCase();

        return doc;

    }

);
```

Input

```ts
Alice@Example.COM
```

Stored

```ts
alice@example.com
```

Every insert now follows identical formatting rules.

---

# afterInsert()

Runs immediately after successful persistence.

```ts
users.afterInsert(

    doc=>{

        console.log(

            "Created",

            doc.name

        );

    }

);
```

Unlike `beforeInsert()`,

the document has already been stored.

This hook is useful for

- logging
- analytics
- cache invalidation
- metrics

---

# beforeUpdate()

Runs before update operators are committed.

```ts
users.beforeUpdate(

    doc=>{

        doc.updatedAt = Date.now();

        return doc;

    }

);
```

Every successful update automatically records modification time.

---

# Example

Stored

```ts
{

    name:"Alice"

}
```

Update

```ts
$set:{

    age:25

}
```

Middleware adds

```ts
updatedAt
```

Result

```ts
{

    name:"Alice",

    age:25,

    updatedAt:1718124000

}
```

---

# afterUpdate()

Runs after the updated document has been successfully committed.

```ts
users.afterUpdate(

    doc=>{

        analytics.track(

            "User Updated",

            doc._id

        );

    }

);
```

Ideal for

- analytics
- logging
- cache invalidation
- synchronization

Avoid modifying the document inside `afterUpdate()` because it has already been persisted.

---

# beforeDelete()

Runs before removal.

```ts
users.beforeDelete(

    doc=>{

        console.log(

            "Deleting",

            doc.name

        );

    }

);
```

Useful for

- permission checks
- audit trails
- archiving
- confirmation logic

---

# afterDelete()

Runs after successful deletion.

```ts
users.afterDelete(

    doc=>{

        console.log(

            "Deleted",

            doc._id

        );

    }

);
```

Typical uses include

- analytics
- notifications
- cache cleanup
- external synchronization

---

# Execution Order

Every operation follows a predictable lifecycle.

Insert

```
beforeInsert()

↓

Validation

↓

Storage

↓

afterInsert()

↓

Subscriptions
```

Update

```
beforeUpdate()

↓

Apply Operators

↓

Validation

↓

Storage

↓

afterUpdate()

↓

Subscriptions
```

Delete

```
beforeDelete()

↓

Delete Storage

↓

afterDelete()

↓

Subscriptions
```

Knowing this order makes middleware behavior predictable.

---

# Middleware and Validation

Validation happens **after** "before" hooks.

Example

Schema

```ts
required:[

    "createdAt"
]
```

Application

```ts
await users.insertOne({

    name:"Alice"

});
```

Normally this would fail.

Middleware

```ts
beforeInsert(

    doc=>{

        doc.createdAt = Date.now();

        return doc;

    }

);
```

Now validation succeeds automatically.

Middleware can therefore generate required fields before the validator executes.

---

# Middleware and Transactions

Hooks execute normally inside transactions.

```ts
await db.transaction(

    async()=>{

        await users.insertOne({

            name:"Alice"

        });

    }

);
```

Execution

```
beforeInsert()

↓

Validation

↓

Queued Write

↓

afterInsert()

↓

Commit
```

If the transaction later rolls back,

the database returns to its previous state.

For this reason,

hooks should avoid irreversible side effects.

---

# Avoid Side Effects

Bad

```ts
afterInsert(

    async()=>{

        await sendEmail();

    }

);
```

If a later operation causes the transaction to roll back,

the email has already been sent.

Better

```
Commit Transaction

↓

Application Logic

↓

Send Email
```

Middleware should primarily modify documents or perform lightweight bookkeeping.

---

# Multiple Hooks

Multiple hooks of the same type may be registered.

```ts
users.beforeInsert(

    timestampHook

);

users.beforeInsert(

    slugHook

);

users.beforeInsert(

    sanitizeHook

);
```

BrowserDB executes them in registration order.

```
Timestamp

↓

Slug

↓

Sanitize

↓

Validation
```

Keeping hooks small and focused generally produces cleaner code than placing all logic into one large middleware function.

---

# Removing Middleware

Registration returns a cleanup function.

```ts
const remove =

users.beforeInsert(

    hook

);

remove();
```

Once removed,

future operations no longer invoke that middleware.

This is especially useful during testing or when enabling features dynamically.

---

# Common Patterns

## Automatic Timestamps

```ts
users.beforeInsert(

    doc=>{

        const now = Date.now();

        doc.createdAt = now;

        doc.updatedAt = now;

        return doc;

    }

);
```

---

## Updated Timestamp

```ts
users.beforeUpdate(

    doc=>{

        doc.updatedAt = Date.now();

        return doc;

    }

);
```

---

## Slug Generation

```ts
posts.beforeInsert(

    doc=>{

        doc.slug =

            doc.title

                .toLowerCase()

                .replaceAll(" ","-");

        return doc;

    }

);
```

---

## Input Sanitization

```ts
users.beforeInsert(

    doc=>{

        doc.username =

            doc.username.trim();

        return doc;

    }

);
```

---

## Soft Delete

Instead of deleting,

convert delete requests into updates.

```ts
users.beforeDelete(

    doc=>{

        throw new Error(

            "Use archived=true instead."

        );

    }

);
```

Then archive documents using

```ts
updateOne(

    ...

);
```

---

# Best Practices

✔ Keep middleware focused.

Each hook should solve one problem.

---

✔ Prefer `before` hooks for modifying data.

`after` hooks should generally observe, not mutate.

---

✔ Avoid network requests.

Middleware should complete quickly.

---

✔ Use middleware to enforce consistency.

Generating timestamps, slugs, metadata, and default values centrally prevents duplicated application code.

---

✔ Remove temporary hooks during tests.

Registration cleanup functions make this straightforward.

---

# Under the Hood

Internally BrowserDB stores middleware as ordered collections of lifecycle callbacks associated with each collection.

Whenever a CRUD operation begins,

the appropriate hook chain is executed before BrowserDB proceeds to validation or persistence.

Because middleware is integrated directly into the write pipeline,

every document—regardless of whether it originates from an insert, update, transaction, or migration—passes through the same lifecycle.

This guarantees consistent behavior across the entire database.

Combined with validation, transactions, and subscriptions,

middleware forms one of BrowserDB's primary extension points,

allowing applications to customize behavior without modifying BrowserDB itself.

---

# Gallery API

Structured data and binary data have very different storage requirements.

A user profile might look like this.

```ts
{

    name: "Alice",

    age: 24,

    avatar: ?

}
```

Many applications solve this by storing images as Base64 strings.

```ts
{

    name:"Alice",

    avatar:"data:image/png;base64,iVBORw0KGgoAAA..."
}
```

Although this works,

it has several disadvantages.

- Documents become extremely large.
- Every query loads the image.
- JSON compression becomes less effective.
- Updates become slower.
- Memory usage increases dramatically.

BrowserDB solves this problem with the **Gallery API**.

Instead of embedding binary data inside JSON documents,

binary objects are stored separately using IndexedDB while ordinary documents continue using BrowserDB collections.

```
Documents

↓

Collection

↓

JSON Storage

──────────────

Images

↓

Gallery

↓

IndexedDB
```

This separation keeps collections small, queries fast, and binary storage efficient.

---

# Why a Separate Gallery?

Images are fundamentally different from documents.

A user profile

```ts
{

    name:"Alice",

    email:"alice@example.com"
}
```

might occupy only

```
300 bytes
```

A profile picture might occupy

```
4 MB
```

Putting both inside the same document means

every query now moves

```
4 MB
```

even when the application only needs the user's name.

Separating structured data from binary data avoids this unnecessary overhead.

---

# Creating a Gallery

Galleries are created through the database.

```ts
const gallery = db.gallery(

    "avatars"

);
```

Like collections,

galleries are created lazily.

No IndexedDB objects are allocated until the first file is stored.

---

# Storing Files

Store any Blob.

```ts
await gallery.store(

    "alice",

    file
);
```

Where

```ts
file
```

may be

- File
- Blob
- Image
- Video
- Audio
- PDF
- Any binary object

---

Example

```ts
const input =

document.querySelector(

    "input"

);

await gallery.store(

    "avatar",

    input.files[0]

);
```

---

# Retrieving Files

Retrieve an object URL.

```ts
const url =

await gallery.get(

    "avatar"

);
```

BrowserDB returns

```text
blob:https://...
```

This URL can immediately be used.

```html
<img src="{url}">
```

or

```ts
image.src = url;
```

No manual Blob handling required.

---

# Object URLs

The Gallery API intentionally returns object URLs instead of raw binary.

Why?

Because browsers can display

```
blob:
```

URLs directly.

```
Blob

↓

URL.createObjectURL()

↓

blob:https://...

↓

<img>

↓

Rendered
```

Applications therefore avoid manually converting binary into Base64.

---

# Replacing Files

Calling

```ts
store()
```

with an existing key replaces the previous file.

```ts
await gallery.store(

    "avatar",

    newAvatar

);
```

The previous image is removed automatically.

Applications do not need to delete it first.

---

# Deleting Files

Remove binary objects.

```ts
await gallery.delete(

    "avatar"

);
```

Future calls

```ts
gallery.get(

    "avatar"

);
```

return

```ts
null
```

---

# Checking Existence

Applications sometimes only need to know whether a file exists.

```ts
const exists =

await gallery.has(

    "avatar"

);
```

Returns

```ts
true
```

or

```ts
false
```

without loading the binary itself.

---

# Listing Stored Files

Retrieve every stored identifier.

```ts
const keys =

await gallery.keys();
```

Example

```ts
[

    "alice",

    "bob",

    "charlie"

]
```

Useful for

- galleries
- file browsers
- media managers

---

# Clearing a Gallery

Remove every stored file.

```ts
await gallery.clear();
```

Result

```
Gallery

↓

Empty
```

The gallery itself continues to exist.

---

# Destroying a Gallery

To permanently remove the underlying storage,

```ts
await gallery.destroy();
```

This removes

- every stored Blob
- IndexedDB object stores
- internal metadata

After destruction,

a new gallery begins completely empty.

---

# Storage Architecture

Unlike BrowserDB collections,

the Gallery API always uses IndexedDB.

```
Gallery

↓

IndexedDB

↓

Blob Storage
```

Why?

Because

- IndexedDB stores binary natively.
- localStorage only stores strings.
- Base64 wastes space.
- Blobs avoid unnecessary conversions.

This makes IndexedDB the natural choice for media storage.

---

# Collections + Gallery

The intended design is

```
Collection

↓

Metadata

──────────────

Gallery

↓

Binary
```

Example

Collection

```ts
{

    _id:"alice",

    name:"Alice",

    avatar:"avatar-alice"
}
```

Gallery

```
avatar-alice

↓

PNG Image
```

The document stores only a lightweight reference.

The binary remains separate.

---

# Performance Benefits

Instead of

```
Find User

↓

Load 4 MB Image

↓

Read Name
```

BrowserDB performs

```
Find User

↓

300 Bytes

↓

Display Name
```

Only when the application actually needs the image does it request

```ts
gallery.get(...)
```

This dramatically reduces

- memory usage
- storage overhead
- JSON size
- query latency

---

# Browser Memory

Object URLs should be released once no longer needed.

```ts
URL.revokeObjectURL(

    url
);
```

This allows the browser to reclaim memory associated with the Blob.

Applications displaying many large images should revoke unused URLs whenever possible.

---

# Best Practices

## Store References

Instead of

```ts
{

    avatar:blob
}
```

store

```ts
{

    avatar:"alice-avatar"
}
```

Then retrieve the image from the Gallery.

---

## Keep Documents Small

Collections should contain metadata.

Galleries should contain binary data.

Keeping the two separate produces significantly better performance.

---

## Avoid Base64

Base64

- increases storage size,
- increases memory usage,
- slows serialization.

Store the original Blob instead.

---

## Revoke Object URLs

Whenever images are removed from the page,

call

```ts
URL.revokeObjectURL(url);
```

This helps browsers reclaim memory.

---

# Typical Workflow

Uploading

```
User Selects Image

↓

gallery.store()

↓

Store Blob

↓

Save Gallery Key

↓

Insert User Document
```

Displaying

```
Find User

↓

Read avatar key

↓

gallery.get()

↓

blob:

↓

<img>
```

Notice that user documents remain tiny regardless of image size.

---

# Under the Hood

The Gallery API is intentionally independent from BrowserDB collections.

Collections are optimized for structured JSON documents,

while galleries are optimized for opaque binary objects.

Internally,

BrowserDB stores Blobs directly inside IndexedDB,

avoiding Base64 conversion and allowing browsers to stream binary efficiently.

Because galleries expose object URLs,

applications can immediately display stored images without additional decoding.

This architecture keeps JSON documents compact while allowing BrowserDB to scale naturally from lightweight metadata to large media collections.

---

# Error Handling & Exceptions

No database operation can guarantee success.

A document may violate validation rules.

A duplicate identifier may already exist.

The browser may run out of storage.

IndexedDB may become unavailable.

Rather than returning ambiguous values like `false` or `null`, BrowserDB throws **typed exceptions** describing exactly what went wrong.

This allows applications to recover gracefully.

```ts
try {

    await users.insertOne(user);

} catch (error) {

    console.error(error);

}
```

---

# Why Typed Errors?

Consider this code.

```ts
await users.insertOne({

    _id: "alice"

});
```

Suppose `"alice"` already exists.

Should BrowserDB return

```ts
false
```

?

Should it return

```ts
null
```

?

Neither tells you *why* the operation failed.

Instead BrowserDB throws

```
DuplicateKeyError
```

Applications immediately know the cause.

---

# Error Hierarchy

All BrowserDB exceptions inherit from the standard JavaScript `Error` class.

```
Error

│

├── DatabaseError

│     ├── DuplicateKeyError

│     ├── ValidationError

│     ├── DataCorruptionError

│     ├── QuotaExceededError

│     └── TransactionError

│
└── Other JavaScript Errors
```

This allows applications to catch either

```ts
DatabaseError
```

or individual subclasses.

---

# DuplicateKeyError

Thrown whenever a duplicate `_id` is inserted.

```ts
await users.insertOne({

    _id: "alice"

});

await users.insertOne({

    _id: "alice"

});
```

Result

```
DuplicateKeyError
```

No document is written.

---

## Why Duplicate IDs Matter

Every document inside a collection must have a unique identifier.

Without this guarantee,

operations such as

```ts
findOne()

updateOne()

deleteOne()
```

would become ambiguous.

BrowserDB therefore rejects duplicates immediately.

---

## Handling Duplicate IDs

```ts
try {

    await users.insertOne(user);

}

catch (error) {

    if (

        error instanceof DuplicateKeyError

    ) {

        console.log(

            "User already exists."

        );

    }

}
```

---

# ValidationError

Occurs when a document violates the active validator.

Example

```ts
users.setValidator({

    $jsonSchema:{

        required:[

            "name"

        ]

    }

});
```

Insert

```ts
await users.insertOne({

});
```

Throws

```
ValidationError
```

The collection remains unchanged.

---

# Typical Validation Errors

```
Missing required field

↓

ValidationError
```

```
Wrong data type

↓

ValidationError
```

```
Enum mismatch

↓

ValidationError
```

```
Nested object invalid

↓

ValidationError
```

Validation always occurs before persistence.

---

# DatabaseError

Represents invalid database operations.

Examples include

- unsupported update operations
- invalid query structure
- illegal transaction usage
- invalid storage backend
- malformed configuration

Rather than allowing undefined behavior,

BrowserDB reports the error immediately.

---

# TransactionError

Transaction failures are reported through transaction-related exceptions.

Examples include

```
Nested transaction

↓

TransactionError
```

or

```
Commit failure

↓

TransactionError
```

When a transaction throws,

BrowserDB automatically restores every affected collection before rethrowing the exception.

Applications never perform rollback manually.

---

# QuotaExceededError

Every browser limits available storage.

When BrowserDB cannot recover using

- cleanup,
- eviction,
- migration,

it throws

```
QuotaExceededError
```

Example

```ts
try {

    await hugeCollection.insertMany(

        documents

    );

}

catch (

    error

) {

    if (

        error instanceof QuotaExceededError

    ) {

        console.log(

            "Storage Full"

        );

    }

}
```

---

# Recovery Strategy

BrowserDB does **not** immediately throw.

Instead,

it attempts

```
Write

↓

Storage Full

↓

Remove Expired Documents

↓

Enough Space?

↓

No

↓

Evict Old Documents

↓

Enough Space?

↓

No

↓

Migrate To IndexedDB

↓

Enough Space?

↓

No

↓

Throw QuotaExceededError
```

Only after every recovery strategy fails does BrowserDB report the error.

---

# DataCorruptionError

Stored data may become corrupted because of

- interrupted writes
- browser bugs
- manual modification
- damaged storage

Instead of silently loading invalid documents,

BrowserDB throws

```
DataCorruptionError
```

Failing early prevents applications from operating on inconsistent data.

---

# Storage Errors

Occasionally,

browser APIs themselves may fail.

Examples include

```
IndexedDB unavailable

Permission denied

Storage inaccessible

Private browsing restrictions
```

These surface as database-related exceptions rather than disappearing silently.

Applications may then decide whether to

- retry,
- display an error,
- or continue using temporary memory.

---

# Error Messages

BrowserDB attempts to provide descriptive messages.

Examples

```
Duplicate _id 'alice'
```

```
Field 'email' is required.
```

```
Document exceeds browser storage quota.
```

```
Nested transactions are not supported.
```

Good error messages reduce debugging time significantly.

---

# Catching Specific Errors

Recommended

```ts
try {

    ...

}

catch (error) {

    if (

        error instanceof ValidationError

    ) {

        showValidationError();

    }

    else if (

        error instanceof DuplicateKeyError

    ) {

        showDuplicateError();

    }

    else {

        console.error(error);

    }

}
```

Avoid

```ts
catch (e) {

}
```

Silently ignoring errors usually creates much harder problems later.

---

# Transactions and Errors

Suppose

```ts
await db.transaction(

    async()=>{

        await users.insertOne({

            _id:"alice"

        });

        await users.insertOne({

            _id:"alice"

        });

    }

);
```

Execution

```
Insert

↓

DuplicateKeyError

↓

Rollback

↓

Throw Error
```

After the exception,

the collection remains exactly as it was before the transaction began.

---

# Validation Failures

Validation errors never partially modify a document.

```
Clone

↓

Modify

↓

Validate

↓

Fail

↓

Discard Clone

↓

Keep Original
```

The stored document is never left in an inconsistent state.

---

# Logging

During development,

logging complete errors is recommended.

```ts
try {

    ...

}

catch (error) {

    console.error(error);

}
```

Most BrowserDB exceptions include descriptive messages and stack traces that make debugging straightforward.

---

# Best Practices

## Never Ignore Exceptions

Always assume storage operations can fail.

---

## Catch Specific Errors

Prefer

```ts
DuplicateKeyError
```

over

```ts
Error
```

whenever possible.

---

## Display Friendly Messages

Instead of

```
ValidationError
```

display

```
Please enter a valid email address.
```

to users.

---

## Let Transactions Roll Back

Do **not** attempt to manually restore data after a transaction failure.

BrowserDB already guarantees rollback.

---

## Keep Recovery Simple

Most applications only need to distinguish between

- validation problems,
- duplicate keys,
- storage limitations,
- and unexpected failures.

Everything else can usually be logged for debugging.

---

# Under the Hood

Internally,

BrowserDB throws strongly typed exceptions throughout every subsystem—

validation,

query evaluation,

transactions,

storage,

compression,

and migration.

Rather than allowing lower-level browser exceptions to leak directly into application code,

the database translates failures into predictable, meaningful error types.

This provides a consistent error model regardless of whether the underlying problem originated in localStorage, IndexedDB, compression, validation, or transaction processing.

Because every write operation either succeeds completely or throws an exception,

applications never need to inspect partially completed results.

---


# How BrowserDB Works Internally

Using BrowserDB is intentionally simple.

```ts
await users.insertOne({

    name: "Alice"

});
```

Behind this single line, however, BrowserDB performs a carefully ordered sequence of operations designed to guarantee correctness, consistency, and reliability.

Unlike a simple wrapper around `localStorage`, BrowserDB behaves much more like a miniature database engine.

This chapter explains what actually happens internally.

---

# High-Level Architecture

BrowserDB is organized into several independent layers.

```
                    Application
                          │
                          ▼
                 BrowserDB Database
                          │
                          ▼
                    Collection API
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   Middleware        Validation        Query Engine
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
                  Transaction Manager
                          │
                          ▼
                 Hybrid Storage Engine
                  │                 │
                  ▼                 ▼
            localStorage      IndexedDB
                          │
                          ▼
                 BroadcastChannel
                          │
                          ▼
                   Active Subscribers
```

Each layer has a single responsibility.

This separation keeps BrowserDB maintainable while allowing features such as transactions, validation, and subscriptions to remain independent of the storage backend.

---

# Database Instance

Everything begins with a database.

```ts
const db = new BrowserDB();
```

The database itself stores very little data.

Instead,

it acts as a coordinator.

Responsibilities include

- collection registry
- transaction management
- gallery management
- synchronization
- lifecycle management

Collections contain documents.

The database coordinates them.

---

# Collection Registry

Whenever

```ts
db.collection("users")
```

is called,

BrowserDB first checks whether that collection already exists.

```
Collection Requested

↓

Already Exists?

↓

YES

↓

Return Existing Collection

──────────────

NO

↓

Create Collection

↓

Register Collection

↓

Return Collection
```

Collections therefore behave like singletons inside a database instance.

Every caller receives the same object.

---

# Insert Pipeline

Suppose the application executes

```ts
await users.insertOne({

    name:"Alice"

});
```

Internally,

BrowserDB performs roughly the following sequence.

```
Acquire Mutex

↓

Clone Document

↓

Generate UUID

↓

Run beforeInsert()

↓

Apply TTL Metadata

↓

Validate Schema

↓

Check Duplicate IDs

↓

Persist Storage

↓

Update Internal Index

↓

Broadcast Change

↓

Notify Subscribers

↓

Run afterInsert()

↓

Return Clone
```

Every step must succeed.

Otherwise,

the insertion is cancelled.

---

# Why Clone Documents?

Suppose the application inserts

```ts
const user = {

    name:"Alice"

};

await users.insertOne(

    user

);
```

If BrowserDB stored the same object reference,

later modifications would accidentally change stored data.

```ts
user.name = "Bob";
```

To prevent this,

BrowserDB clones documents before processing them.

```
Application Object

↓

Clone

↓

Database Copy

↓

Persist
```

The original object remains completely independent.

---

# Internal Mutex

Although JavaScript executes on a single thread,

asynchronous operations may overlap.

Example

```ts
users.insertOne(...);

users.insertOne(...);

users.updateOne(...);
```

Without coordination,

operations could interleave unpredictably.

BrowserDB therefore serializes write operations using an internal asynchronous mutex.

```
Insert A

↓

Insert B

↓

Update

↓

Delete
```

Only one write operation modifies a collection at any moment.

This guarantees deterministic behavior even when many asynchronous operations are started simultaneously.

---

# Validation Layer

Before any document reaches storage,

BrowserDB validates it.

```
Clone

↓

Schema Validation

↓

Valid?

↓

YES

↓

Continue

────────────

NO

↓

Throw ValidationError
```

Because validation occurs before persistence,

invalid data never reaches storage.

---

# Middleware Layer

Middleware wraps write operations.

```
beforeInsert()

↓

Validation

↓

Storage

↓

afterInsert()
```

Hooks may

- generate timestamps
- sanitize input
- add metadata
- enforce business rules

without modifying BrowserDB itself.

---

# Query Engine

Read operations follow a completely different path.

```
Load Collection

↓

Remove Expired Documents

↓

Evaluate Query

↓

Sort

↓

Skip

↓

Limit

↓

Projection

↓

Clone

↓

Return
```

Notice that reads never modify storage.

---

# Primary Key Optimization

One particularly common query is

```ts
findOne({

    _id:id

});
```

Instead of scanning every document,

BrowserDB maintains an internal in-memory lookup table.

```
_id

↓

Hash Lookup

↓

Document
```

Complex filters continue through the normal query engine.

This optimization dramatically improves primary-key lookups.

---

# Transaction Manager

Transactions temporarily place participating collections into batch mode.

```
Transaction Begins

↓

Snapshot Collections

↓

Queue Writes

↓

Execute Operations

↓

Commit

↓

Notify Subscribers
```

If any operation fails

```
Restore Snapshots

↓

Throw Error
```

Subscribers never observe partially committed transactions.

---

# Subscription Manager

Subscriptions are maintained independently of CRUD operations.

Whenever a collection changes,

BrowserDB performs

```
Collection Changed

↓

Affected Subscribers

↓

Re-run Queries

↓

Results Changed?

↓

YES

↓

Invoke Callback
```

This guarantees that subscribers always receive up-to-date query results.

---

# Cross-Tab Synchronization

Suppose two tabs are open.

```
Tab A

↓

Insert User
```

BrowserDB publishes

```
BroadcastChannel Message
```

Tab B receives

```
Reload Collection

↓

Notify Subscribers

↓

UI Updates
```

Applications therefore remain synchronized without polling.

---

# Storage Layer

Collections never communicate directly with browser APIs.

Instead,

they use an abstract storage engine.

```
Collection

↓

Storage Interface

↓

Backend
```

Possible backends

```
localStorage

IndexedDB
```

The Collection API remains identical regardless of backend.

---

# Automatic Migration

When using

```ts
backend:"auto"
```

the storage engine monitors capacity.

```
Write

↓

Quota Full

↓

Migrate

↓

IndexedDB

↓

Continue
```

Migration is transparent.

The collection object never changes.

---

# Compression Pipeline

Documents are optimized before persistence.

```
Documents

↓

Schema Serialization

↓

JSON

↓

Compression

↓

UTF-16 Packing

↓

Storage
```

Reading performs the reverse pipeline automatically.

Applications only interact with ordinary JavaScript objects.

---

# Internal Indexes

Collections maintain lightweight indexes for frequently accessed information.

Current optimizations include

- `_id` lookup
- cached collection metadata
- active subscriptions
- transaction snapshots

Keeping these structures in memory allows BrowserDB to avoid repeatedly scanning or rebuilding data during common operations.

---

# Lazy Initialization

Most BrowserDB objects are created only when first needed.

```
Database

↓

Collection

↓

Storage

↓

Write

↓

Initialize Backend
```

This minimizes startup cost.

Applications with dozens of collections do not pay initialization overhead for collections that are never used.

---

# Memory Model

BrowserDB intentionally separates

```
Stored Data
```

from

```
Returned Objects
```

Every read operation produces fresh object copies.

```
Storage

↓

Clone

↓

Application
```

This prevents accidental mutation bugs that frequently occur when object references are shared.

---

# Design Principles

Every subsystem inside BrowserDB follows a small set of design principles.

### Predictability

Operations always execute in a deterministic order.

---

### Atomicity

Write operations either complete successfully or leave the database unchanged.

---

### Backend Independence

Features behave identically regardless of whether the collection uses localStorage or IndexedDB.

---

### Safety

Validation,

transactions,

deep cloning,

typed errors,

and rollback all exist to prevent silent data corruption.

---

### Transparency

Applications should never need to understand BrowserDB's internal storage format.

Everything behind the Collection API is an implementation detail.

---

# Putting Everything Together

The following diagram summarizes the complete lifecycle of a write operation.

```
Application

↓

Collection

↓

Acquire Mutex

↓

Clone Document

↓

beforeInsert()

↓

Validation

↓

Transaction Manager

↓

Storage Engine

↓

Compression

↓

Persist

↓

Update Internal Index

↓

BroadcastChannel

↓

Subscriptions

↓

afterInsert()

↓

Return Clone
```

Despite the complexity of the internal pipeline,

the public API remains remarkably simple.

```ts
await users.insertOne({

    name:"Alice"

});
```

This is one of BrowserDB's core design goals:

> **Hide the complexity of building a reliable browser database without hiding the power.**

