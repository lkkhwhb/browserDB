# Reactive Subscriptions

BrowserDB allows your UI to instantly react to database changes across tabs. 

## The `subscribe` Method

You can listen for changes using `subscribe(filter, callback, options)`.

It immediately invokes the callback with the initial dataset, and then repeatedly fires the callback every time the collection is mutated—even if the mutation happened in a different browser tab.

```typescript
const users = db.collection("users");

// Returns an unsubscribe function!
const unsubscribe = users.subscribe(
    { status: "online" }, 
    (activeUsers) => {
        console.log("Active users updated!", activeUsers);
        renderUI(activeUsers);
    },
    { sort: { lastLogin: -1 } }
);

// Later, when the component unmounts:
unsubscribe();
```

## Cross-Tab Synchronization

BrowserDB uses a combination of techniques to ensure tabs stay synced:
- For `localStorage`, it listens to the window's `"storage"` event.
- For `IndexedDB`, it utilizes the native `BroadcastChannel` API.

Whenever another tab inserts, updates, or deletes a document, your current tab's subscriptions will automatically refetch the filtered data and invoke your callbacks.

## Batching and Subscriptions

When a transaction or `beginBatch()` is active, BrowserDB automatically queues all subscription changes. It will not blast your UI with partial state changes.

When the batch fully completes via `commitBatch()`, your subscribers are fired exactly once with the finalized, atomic state!
