/**
 * BrowserDB
 * A lightweight, MongoDB-inspired document database
 * built on top of the browser's localStorage.
 *
 * Copyright (c) 2026–present Bhargav Barman
 *
 * Licensed under the MIT License.
 * You may obtain a copy of the License at:
 *
 * https://opensource.org/licenses/MIT
 *
 */

import { v4 as uuidv4 } from "uuid";

export function uuid(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        try {
            return crypto.randomUUID();
        } catch {
            // Fallback to official uuid library if crypto.randomUUID fails (e.g. non-secure context)
        }
    }
    return uuidv4();
}
