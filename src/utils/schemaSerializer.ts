export interface SerializedData {
    keys: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows: any[][];
}

/**
 * Converts an array of objects into a schema-aware row-based format.
 * This significantly reduces JSON size by eliminating repeated keys.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeToRows<T extends Record<string, any>>(docs: T[]): SerializedData {
    if (docs.length === 0) return { keys: [], rows: [] };

    // Find all possible keys across all documents to form a unified schema
    const keySet = new Set<string>();
    for (const doc of docs) {
        for (const key in doc) {
            keySet.add(key);
        }
    }

    const keys = Array.from(keySet);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[][] = new Array(docs.length);

    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row: any[] = new Array(keys.length);
        for (let j = 0; j < keys.length; j++) {
            row[j] = doc[keys[j]];
        }
        rows[i] = row;
    }

    return { keys, rows };
}

/**
 * Reconstructs an array of objects from a row-based format.
 */
export function deserializeFromRows<T>(data: SerializedData): T[] {
    if (!data || !data.keys || !data.rows) {
        // Fallback in case the data is not in the row format (e.g. legacy data)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data as any;
    }

    const { keys, rows } = data;
    const docs = new Array(rows.length);

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc: any = {};
        for (let j = 0; j < keys.length; j++) {
            if (row[j] !== undefined) {
                doc[keys[j]] = row[j];
            }
        }
        docs[i] = doc;
    }

    return docs;
}
