import { DatabaseError, QuotaExceededError } from "./errors";

export interface ImageOptions {
    maxWidth?: number;
    quality?: number; // 0.0 to 1.0
}

export class ImageStore {
    private readonly prefix: string;
    private readonly storeName: string;

    constructor(name: string, prefix: string) {
        this.storeName = name;
        this.prefix = `${prefix}img_${name}_`;
    }

    /**
     * Optimizes a Blob/File image using Canvas to WebP and returns Base64.
     */
    private async optimizeImage(file: Blob, options: ImageOptions = {}): Promise<string> {
        if (typeof window === "undefined" || !window.URL || !window.Image) {
            throw new DatabaseError("Image optimization requires a browser environment.");
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                const canvas = document.createElement("canvas");
                
                let width = img.width;
                let height = img.height;
                const maxWidth = options.maxWidth || 1920;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new DatabaseError("Failed to get canvas context."));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to webp with given quality (default 0.8)
                const dataUrl = canvas.toDataURL("image/webp", options.quality ?? 0.8);
                resolve(dataUrl);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new DatabaseError("Failed to load image."));
            };

            img.src = url;
        });
    }

    /**
     * Stores an image with the given ID.
     */
    async store(id: string, file: Blob, options?: ImageOptions): Promise<void> {
        if (typeof localStorage === "undefined") {
            throw new DatabaseError("localStorage is not available.");
        }
        
        try {
            const optimizedBase64 = await this.optimizeImage(file, options);
            localStorage.setItem(`${this.prefix}${id}`, optimizedBase64);
        } catch (e) {
            if (
                (typeof DOMException !== "undefined" && e instanceof DOMException && e.name === "QuotaExceededError") ||
                (e && typeof e === "object" && "name" in e && (e as { name?: string }).name === "QuotaExceededError")
            ) {
                throw new QuotaExceededError();
            }
            if (e instanceof DatabaseError) throw e;
            throw new DatabaseError("Failed to store image.");
        }
    }

    /**
     * Retrieves an image by ID (returns Base64 Data URL).
     */
    async get(id: string): Promise<string | null> {
        if (typeof localStorage === "undefined") return null;
        return localStorage.getItem(`${this.prefix}${id}`);
    }

    /**
     * Removes an image by ID.
     */
    async remove(id: string): Promise<void> {
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem(`${this.prefix}${id}`);
        }
    }

    /**
     * Clears all images in this store.
     */
    async clear(): Promise<void> {
        if (typeof localStorage === "undefined") return;
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    }
}
