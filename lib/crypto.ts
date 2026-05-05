const RSA_ALGO = "RSA-OAEP";
const RSA_HASH = "SHA-256";
const RSA_KEY_SIZE = 2048;

const AES_ALGO = "AES-GCM";
const AES_KEY_LENGTH = 256;
const AES_IV_LENGTH = 12;

const AES_KW_ALGO = "AES-GCM";
const AES_KW_LENGTH = 256;
const WRAP_IV_LENGTH = 12;

const PBKDF2_ITERATIONS = 310_000;
const PBKDF2_HASH = "SHA-256";
const SALT_LENGTH = 16;


export const encode = (text: string): ArrayBuffer =>
  new TextEncoder().encode(text).buffer as ArrayBuffer;

export const decode = (buffer: ArrayBuffer): string =>
  new TextDecoder().decode(buffer);

export const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

export const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
};


export const generateSalt = (): string => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return bufferToBase64(salt.buffer as ArrayBuffer);
};


export const deriveWrappingKey = async (
  password: string,
  saltBase64: string
): Promise<CryptoKey> => {
  const salt = base64ToBuffer(saltBase64);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    keyMaterial,
    { name: AES_KW_ALGO, length: AES_KW_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
};


export interface KeyPairResult {
  publicKeyBase64: string;
  wrappedPrivateKeyBase64: string;
  privateKey: CryptoKey;
}

export const generateKeyPair = async (
  wrappingKey: CryptoKey
): Promise<KeyPairResult> => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: RSA_ALGO,
      modulusLength: RSA_KEY_SIZE,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: RSA_HASH,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKeySpki = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const publicKeyBase64 = bufferToBase64(publicKeySpki);

  const privateKeyPkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  const wrapIv = crypto.getRandomValues(new Uint8Array(WRAP_IV_LENGTH)).buffer as ArrayBuffer;

  const wrappedBuffer = await crypto.subtle.encrypt(
    { name: AES_KW_ALGO, iv: wrapIv },
    wrappingKey,
    privateKeyPkcs8
  );

  const combined = new Uint8Array(WRAP_IV_LENGTH + wrappedBuffer.byteLength);
  combined.set(new Uint8Array(wrapIv), 0);
  combined.set(new Uint8Array(wrappedBuffer), WRAP_IV_LENGTH);

  const wrappedPrivateKeyBase64 = bufferToBase64(combined.buffer as ArrayBuffer);

  return {
    publicKeyBase64,
    wrappedPrivateKeyBase64,
    privateKey: keyPair.privateKey,
  };
};


export const unwrapPrivateKey = async (
  wrappedPrivateKeyBase64: string,
  wrappingKey: CryptoKey
): Promise<CryptoKey> => {
  const combined = new Uint8Array(base64ToBuffer(wrappedPrivateKeyBase64));

  const iv = combined.slice(0, WRAP_IV_LENGTH).buffer as ArrayBuffer;
  const wrappedKey = combined.slice(WRAP_IV_LENGTH).buffer as ArrayBuffer;

  const privateKeyPkcs8 = await crypto.subtle.decrypt(
    { name: AES_KW_ALGO, iv },
    wrappingKey,
    wrappedKey
  );

  return crypto.subtle.importKey(
    "pkcs8",
    privateKeyPkcs8,
    { name: RSA_ALGO, hash: RSA_HASH },
    false,
    ["decrypt"]
  );
};


export const importPublicKey = async (
  publicKeyBase64: string
): Promise<CryptoKey> => {
  const keyBuffer = base64ToBuffer(publicKeyBase64);

  return crypto.subtle.importKey(
    "spki",
    keyBuffer,
    { name: RSA_ALGO, hash: RSA_HASH },
    false,
    ["encrypt"]
  );
};


export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  encryptedKey: string;
  encryptedKeyForSelf: string;
}

export const encryptMessage = async (
  plaintext: string,
  recipientPublicKey: CryptoKey,
  myPublicKey: CryptoKey
): Promise<EncryptedPayload> => {
  // Fresh AES-GCM key per message
  const aesKey = await crypto.subtle.generateKey(
    { name: AES_ALGO, length: AES_KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH)).buffer as ArrayBuffer;

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: AES_ALGO, iv },
    aesKey,
    encode(plaintext)
  );

  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);

  const encryptedKeyBuffer = await crypto.subtle.encrypt(
    { name: RSA_ALGO },
    recipientPublicKey,
    rawAesKey
  );

  const encryptedKeyForSelfBuffer = await crypto.subtle.encrypt(
    { name: RSA_ALGO },
    myPublicKey,
    rawAesKey
  );

  return {
    ciphertext: bufferToBase64(ciphertextBuffer),
    iv: bufferToBase64(iv),
    encryptedKey: bufferToBase64(encryptedKeyBuffer),
    encryptedKeyForSelf: bufferToBase64(encryptedKeyForSelfBuffer),
  };
};


export const decryptMessage = async (
  payload: EncryptedPayload,
  myPrivateKey: CryptoKey,
  isSentByMe = false
): Promise<string> => {
  const encryptedKeyBase64 = isSentByMe
    ? payload.encryptedKeyForSelf
    : payload.encryptedKey;

  const rawAesKey = await crypto.subtle.decrypt(
    { name: RSA_ALGO },
    myPrivateKey,
    base64ToBuffer(encryptedKeyBase64)
  );

  const aesKey = await crypto.subtle.importKey(
    "raw",
    rawAesKey,
    { name: AES_ALGO, length: AES_KEY_LENGTH },
    false,
    ["decrypt"]
  );

  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: AES_ALGO, iv: base64ToBuffer(payload.iv) },
    aesKey,
    base64ToBuffer(payload.ciphertext)
  );

  return decode(plaintextBuffer);
};

export const importMyPublicKey = importPublicKey;