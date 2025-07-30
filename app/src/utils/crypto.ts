// Crypto utilities for AES-GCM encryption with PBKDF2 key derivation
// This file contains all cryptographic functions for transparent security auditing

export interface EncryptedData {
  iv: string;
  encrypted: string;
  iterations: number;
  salt: string;
}

/**
 * Encrypts plaintext using AES-GCM with PBKDF2 key derivation
 * @param password - User password for encryption
 * @param plaintext - Text to encrypt
 * @returns Promise resolving to encrypted data object
 */
export async function encryptText(password: string, plaintext: string): Promise<EncryptedData> {
  // Generate random salt for PBKDF2 (16 bytes)
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  
  // Use 100,000 iterations for PBKDF2 (secure against brute force)
  const iterations = 100000;
  
  // Import password as key material for PBKDF2
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive AES-GCM key from password using PBKDF2
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  // Generate random initialization vector (12 bytes for GCM)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the plaintext using AES-GCM
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  
  // Return all necessary data for decryption
  return {
    iv: arrayBufferToBase64(iv),
    encrypted: arrayBufferToBase64(encrypted),
    iterations: iterations,
    salt: arrayBufferToBase64(salt)
  };
}

/**
 * Decrypts encrypted data using AES-GCM with PBKDF2 key derivation
 * @param password - User password for decryption
 * @param encryptedData - Encrypted data object
 * @returns Promise resolving to decrypted plaintext
 */
export async function decryptText(password: string, encryptedData: EncryptedData): Promise<string> {
  // Import password as key material for PBKDF2
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive the same AES-GCM key using stored salt and iterations
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: base64ToArrayBuffer(encryptedData.salt),
      iterations: encryptedData.iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  // Decrypt using stored IV and encrypted data
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToArrayBuffer(encryptedData.iv) },
    key,
    base64ToArrayBuffer(encryptedData.encrypted)
  );
  
  // Convert decrypted ArrayBuffer back to string
  return new TextDecoder().decode(decrypted);
}

/**
 * Converts ArrayBuffer to base64 string for storage/transmission
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return window.btoa(binary);
}

/**
 * Converts base64 string back to ArrayBuffer for cryptographic operations
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Validates that encrypted data has all required fields
 */
export function isValidEncryptedData(data: any): data is EncryptedData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.iv === 'string' &&
    typeof data.encrypted === 'string' &&
    typeof data.salt === 'string' &&
    typeof data.iterations === 'number'
  );
}