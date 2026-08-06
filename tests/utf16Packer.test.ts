import { describe, expect, it } from "vitest";
import { packToUTF16, unpackFromUTF16 } from "../src/utils/utf16Packer";

describe("UTF-16 Binary Packer", () => {
    it("should handle empty arrays", () => {
        const input = new Uint8Array(0);
        const packed = packToUTF16(input);
        expect(packed).toBe("");
        const unpacked = unpackFromUTF16(packed);
        expect(unpacked.length).toBe(0);
    });

    it("should pack and unpack a simple string", () => {
        const str = "Hello, World!";
        const encoder = new TextEncoder();
        const input = encoder.encode(str);
        
        const packed = packToUTF16(input);
        const unpacked = unpackFromUTF16(packed);
        
        const decoded = new TextDecoder().decode(unpacked);
        expect(decoded).toBe(str);
    });

    it("should pack and unpack random binary data (stress test)", () => {
        // Test various lengths to test padding edge cases
        for (let length = 1; length <= 100; length++) {
            const input = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                input[i] = Math.floor(Math.random() * 256);
            }
            
            const packed = packToUTF16(input);
            const unpacked = unpackFromUTF16(packed);
            
            expect(unpacked).toEqual(input);
        }
    });

    it("should pack and unpack specific byte patterns", () => {
        const input = new Uint8Array([0x00, 0xFF, 0x55, 0xAA, 0x12, 0x34, 0x56, 0x78]);
        const packed = packToUTF16(input);
        const unpacked = unpackFromUTF16(packed);
        expect(unpacked).toEqual(input);
    });
});
