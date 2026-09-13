// ULTRON Client-Side End-to-End Encryption (E2EE) & Privacy Engine
// Standard: AES-256-GCM authenticated encryption using native browser Web Crypto API

const STORAGE_KEY_NAME = 'ultron_e2ee_master_key';
let cachedCryptoKey = null;

// ArrayBuffer to Base64 and vice versa helpers
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Initialize or retrieve client-side AES-256-GCM Master Encryption Key
 */
export async function getOrCreateMasterKey() {
  if (cachedCryptoKey) return cachedCryptoKey;
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not available in this environment.');
  }

  const storedKeyJwk = localStorage.getItem(STORAGE_KEY_NAME);

  if (storedKeyJwk) {
    try {
      const keyData = JSON.parse(storedKeyJwk);
      cachedCryptoKey = await window.crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      return cachedCryptoKey;
    } catch (err) {
      console.warn('[E2EE] Failed to import stored key, generating a fresh master key:', err);
    }
  }

  // Generate fresh 256-bit AES-GCM Key
  cachedCryptoKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedJwk = await window.crypto.subtle.exportKey('jwk', cachedCryptoKey);
  localStorage.setItem(STORAGE_KEY_NAME, JSON.stringify(exportedJwk));
  console.log('[E2EE] ✅ New AES-256-GCM Master Key generated and secured in client storage.');

  return cachedCryptoKey;
}

/**
 * Encrypt arbitrary text payload with AES-256-GCM
 * @param {string} plainText
 * @returns {Promise<{ ciphertext: string, iv: string }>}
 */
export async function encryptData(plainText) {
  if (!plainText || typeof plainText !== 'string') return plainText;

  const key = await getOrCreateMasterKey();
  // 96-bit random IV (Initialization Vector) per NIST recommendation for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(plainText);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedData
  );

  return {
    ciphertext: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv),
    encrypted: true,
    algo: 'AES-256-GCM'
  };
}

/**
 * Decrypt AES-256-GCM payload
 * @param {string} ciphertext - Base64 encoded ciphertext
 * @param {string} iv - Base64 encoded IV
 * @returns {Promise<string>}
 */
export async function decryptData(ciphertext, iv) {
  if (!ciphertext || !iv) return ciphertext;

  try {
    const key = await getOrCreateMasterKey();
    const cipherBuffer = base64ToBuffer(ciphertext);
    const ivBuffer = base64ToBuffer(iv);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
      key,
      cipherBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error('[E2EE] Decryption error:', err);
    return '[Encrypted Data - Key Mismatch]';
  }
}

/**
 * Calculate SHA-256 Fingerprint of the current encryption key for visual user verification
 */
export async function getKeyFingerprint() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_NAME);
    if (!stored) return 'NOT_INITIALIZED';

    const hashBuffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(stored));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':');
  } catch {
    return 'SECURE_ACTIVE';
  }
}

/**
 * Purge key and all local encrypted data
 */
export function purgeLocalEncryptionData() {
  localStorage.removeItem(STORAGE_KEY_NAME);
  cachedCryptoKey = null;
  console.log('[E2EE] Master key purged.');
}
