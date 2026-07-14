import { createCipheriv, createHash, createHmac, randomBytes } from "node:crypto";

export function randomToken(bytes = 32) { return randomBytes(bytes).toString("base64url"); }
export function hashToken(token: string, secret: string) { return createHmac("sha256", secret).update(token).digest("hex"); }
export function hashContext(value: string | undefined, secret: string) {
  if (!value) return undefined;
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}

export function encryptSecret(value: string, secret: string) {
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}
