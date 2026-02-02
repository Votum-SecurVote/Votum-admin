/**
 * Browser-native RSA-OAEP encryption utility using Web Crypto API.
 * STRICTLY for Frontend usage. NO Node.js dependencies.
 */

// Import Public Key from SPKI Base64 format
async function importPublicKey(base64Key) {
    try {
        if (!base64Key) throw new Error("Public Key is missing");

        // Clean up key string if needed (remove headers/newlines if present)
        const cleanKey = base64Key
            .replace(/-----BEGIN PUBLIC KEY-----/g, "")
            .replace(/-----END PUBLIC KEY-----/g, "")
            .replace(/[\n\r]/g, "");

        // Decode Base64 to binary
        const binaryDerString = window.atob(cleanKey);
        const binaryDer = new Uint8Array(binaryDerString.length);
        for (let i = 0; i < binaryDerString.length; i++) {
            binaryDer[i] = binaryDerString.charCodeAt(i);
        }

        // Import key using Web Crypto API
        return await window.crypto.subtle.importKey(
            "spki",
            binaryDer.buffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,   // extractable
            ["encrypt"]
        );
    } catch (error) {
        console.error("Failed to import public key:", error);
        throw new Error("Invalid Public Key format from server.");
    }
}

/**
 * Encrypts data using RSA-OAEP (SHA-256)
 * @param {string} data - Plaintext data to encrypt
 * @param {string} publicKeyBase64 - SPKI Public Key in Base64
 * @returns {Promise<string>} - Base64 encoded encrypted string
 */
export async function encryptData(data, publicKeyBase64) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error("Web Crypto API is not supported in this browser.");
    }

    if (!data || !publicKeyBase64) {
        throw new Error("Data and Public Key are required for encryption");
    }

    try {
        const publicKey = await importPublicKey(publicKeyBase64);
        const encodedData = new TextEncoder().encode(data);

        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            publicKey,
            encodedData
        );

        // Convert ArrayBuffer to Base64
        const encryptedArray = new Uint8Array(encryptedData);
        const binaryString = String.fromCharCode.apply(null, encryptedArray);
        return window.btoa(binaryString);

    } catch (error) {
        console.error("Encryption failed:", error);
        throw new Error("Encryption process failed locally. Please check inputs.");
    }
}
