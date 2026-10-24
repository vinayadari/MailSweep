import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";

function key() {
  const b64 = process.env.TOKEN_ENC_KEY;
  const k = b64 ? Buffer.from(b64, "base64") : null;
  if (!k || k.length !== 32) {
    throw new Error("TOKEN_ENC_KEY must be base64 of 32 bytes (openssl rand -base64 32)");
  }
  return k;
}

/** AES-256-GCM. Output: enc:v1:<base64(iv|tag|ciphertext)> */
export function encryptToken(plain) {
  if (!plain) return null;
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return PREFIX + Buffer.concat([iv, c.getAuthTag(), enc]).toString("base64");
}

/** Legacy plaintext values pass through and get re-encrypted on the next refresh or login. */
export function decryptToken(stored) {
  if (!stored) return null;
  if (!stored.startsWith(PREFIX)) return stored;
  const buf = Buffer.from(stored.slice(PREFIX.length), "base64");
  const d = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}
