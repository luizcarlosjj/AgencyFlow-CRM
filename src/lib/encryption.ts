/**
 * AES-256-GCM encryption for agency secrets stored in the database.
 * The ENCRYPTION_KEY env var is the only secret needed on the server.
 * Never expose this key or any enc-suffixed DB column to the client.
 *
 * Key format: 64 hex chars (32 bytes). Generate with:
 *   openssl rand -hex 32
 *
 * Wire format (base64): [12-byte IV][16-byte GCM tag][ciphertext]
 */
import crypto from 'crypto';

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      '[Encryption] ENCRYPTION_KEY inválida. Deve ser uma string hex de 64 caracteres (32 bytes). ' +
      'Gere com: openssl rand -hex 32',
    );
  }
  return Buffer.from(hex, 'hex');
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv  = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag  = cipher.getAuthTag(); // 16 bytes
  return Buffer.concat([iv, tag, body]).toString('base64');
}

export function decrypt(encoded: string): string {
  const key = getKey();
  const buf = Buffer.from(encoded, 'base64');
  const iv        = buf.subarray(0, 12);
  const tag       = buf.subarray(12, 28);
  const body      = buf.subarray(28);
  const decipher  = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
}

/** Returns true if the string looks like an encrypted payload (valid base64, ≥ 29 bytes). */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    return Buffer.from(value, 'base64').length >= 29;
  } catch {
    return false;
  }
}
