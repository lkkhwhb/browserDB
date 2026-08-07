# Gallery API

Because `localStorage` is extremely poor at handling raw binary files (images, audio, video) due to Base64 size expansion, BrowserDB includes a dedicated `Gallery` system.

Galleries operate entirely asynchronously and save files directly to `IndexedDB`, safely bypassing all text-storage quota issues.

## Basic Usage

```typescript
const db = new BrowserDB();
const avatars = db.gallery("avatars");

// Assuming `fileInput.files[0]` is a Blob/File
const userFile = fileInput.files[0];

// Store the binary file securely 
await avatars.store("user_123_avatar", userFile);
```

## Retrieving Files

The Gallery API can give you the raw `Blob` directly, or it can automatically generate a native `URL.createObjectURL` string for you, rendering it instantly compatible with `<img>`, `<audio>`, and `<video>` tags with zero boilerplate.

```typescript
// Get the raw Blob
const blob = await avatars.getBlob("user_123_avatar");

// Or get a ready-to-use URL string
const imgUrl = await avatars.get("user_123_avatar");

if (imgUrl) {
    document.getElementById("profilePic").src = imgUrl;
}
```

## Deletion

```typescript
// Remove a specific file
await avatars.remove("user_123_avatar");

// Completely empty the gallery
await avatars.clear();
```

*Note: If you call `await db.dropCollection("avatars")`, any gallery with the same name will also be seamlessly wiped from the system.*
