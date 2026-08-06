/**
 * UTF-16 Binary Packer
 * Compresses raw binary (Uint8Array) into a UTF-16 string by packing 
 * 15 bits of binary data per character.
 *
 * This completely avoids the surrogate pair range (0xD800 - 0xDFFF) 
 * and control characters (by using a 0x0100 offset).
 *
 * Provides a massive space saving over Base64 for localStorage.
 */

const OFFSET = 0x0100;

export function packToUTF16(bytes: Uint8Array): string {
    if (bytes.length === 0) return "";
    
    let result = "";
    let buffer = 0;
    let bitsInBuffer = 0;
    
    for (let i = 0; i < bytes.length; i++) {
        buffer = (buffer << 8) | bytes[i];
        bitsInBuffer += 8;
        
        while (bitsInBuffer >= 15) {
            bitsInBuffer -= 15;
            const chunk = (buffer >> bitsInBuffer) & 0x7FFF;
            result += String.fromCharCode(chunk + OFFSET);
        }
    }
    
    let paddingBits = 0;
    if (bitsInBuffer > 0) {
        // Shift remaining bits to the top of the 15-bit chunk
        paddingBits = 15 - bitsInBuffer;
        const chunk = (buffer << paddingBits) & 0x7FFF;
        result += String.fromCharCode(chunk + OFFSET);
    }
    
    // Store padding size in the last character so we can unpack precisely
    result += String.fromCharCode(paddingBits + OFFSET);
    
    return result;
}

export function unpackFromUTF16(str: string): Uint8Array {
    if (str.length === 0) return new Uint8Array(0);
    
    // Last character holds the padding bit count
    const padding = str.charCodeAt(str.length - 1) - OFFSET;
    const dataLength = str.length - 1;
    
    if (dataLength === 0) return new Uint8Array(0);
    
    // Calculate exact number of original bytes
    const totalBits = dataLength * 15 - padding;
    const totalBytes = Math.floor(totalBits / 8);
    const bytes = new Uint8Array(totalBytes);
    
    let buffer = 0;
    let bitsInBuffer = 0;
    let byteIndex = 0;
    
    for (let i = 0; i < dataLength; i++) {
        const chunk = str.charCodeAt(i) - OFFSET;
        buffer = (buffer << 15) | chunk;
        bitsInBuffer += 15;
        
        while (bitsInBuffer >= 8 && byteIndex < totalBytes) {
            bitsInBuffer -= 8;
            bytes[byteIndex++] = (buffer >> bitsInBuffer) & 0xFF;
        }
    }
    
    return bytes;
}
