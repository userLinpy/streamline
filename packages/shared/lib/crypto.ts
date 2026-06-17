import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY invalide — doit être exactement 64 caractères hexadécimaux (256 bits)"
    );
  }
  return Buffer.from(key, "hex");
}

/**
 * Chiffre une donnée sensible en AES-256-GCM.
 * Retourne une string base64 contenant IV + ciphertext + authTag.
 *
 * @example
 * const encrypted = encrypt("123-45-6789"); // numéro sécu
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Format : IV (12) + ciphertext + authTag (16)
  const result = Buffer.concat([iv, encrypted, authTag]);
  return result.toString("base64");
}

/**
 * Déchiffre une donnée chiffrée par encrypt().
 *
 * @example
 * const ssn = decrypt(encryptedValue); // "123-45-6789"
 */
export function decrypt(encryptedBase64: string): string {
  const key = getEncryptionKey();
  const data = Buffer.from(encryptedBase64, "base64");

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(data.length - AUTH_TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH, data.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
