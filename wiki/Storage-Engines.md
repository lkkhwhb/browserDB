# Storage Engines and Eviction

BrowserDB v2.0 introduces the **Hybrid Storage Engine**, giving you the speed of synchronous local storage with the deep capacity limits of IndexedDB.

## The Hybrid Storage Engine

By default, every collection is assigned the `auto` backend.

1. **Phase 1 (`localStorage`)**: BrowserDB will start by writing to the fastest layer possible, heavily compressing your data on the fly.
2. **Phase 2 (`indexedDB` Migration)**: Once `localStorage` hits the 5MB browser quota limit, the Hybrid Storage Engine kicks in. It takes the entire collection and seamlessly migrates it into an async `IndexedDB` backend in the background. Your code does not have to change.

If a migration fails midway (e.g., the browser tab is closed abruptly), BrowserDB safely recovers from the orphaned state and restarts without data loss.

### Manual Backend Selection

If you prefer, you can lock a collection to a specific backend:

```typescript
const logs = db.collection("system_logs", { backend: "indexedDB" });
```
- `localStorage`: Fast, highly compressed, limited to ~5-60MB. Vulnerable to lost-update cross-tab race conditions if written concurrently without locks.
- `indexedDB`: Async, high capacity (GBs), safest cross-tab consistency guarantees.

## Eviction Policies

If you are strictly using `localStorage` or if the user's hard drive runs entirely out of space, the browser will throw a `QuotaExceededError`.

To handle this gracefully, you can apply an **Eviction Policy**. If the quota is exceeded, BrowserDB will automatically discard 20% of your data to keep the database alive.

```typescript
const telemetry = db.collection("telemetry", { eviction: "fifo" });
```

Available Policies:
- **`fifo`** (First-In, First-Out): Deletes the oldest 20% of documents.
- **`ttl`**: Specifically targets documents that have a Time-To-Live attached (the ones nearest to expiration) before touching permanent documents.
- **`lru`**: Approximates Least Recently Used (falls back to FIFO currently).
- **`none`**: (Default). Throws a `QuotaExceededError` and aborts the save.

## Storage Compression

BrowserDB leverages native `CompressionStream` (deflate) combined with a custom UTF-16 binary packer. 
`localStorage` technically only stores text, so BrowserDB packs 15 bits of raw binary deflate-output into a single UTF-16 character. 

**The Result:** You can squeeze up to ~60MB of JSON text into the 5MB text-string limit, a ~12x expansion in usable size.
