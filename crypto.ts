import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export function encrypt(text: string, encryptionKey: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(encryptionKey, "hex");
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
let encrypted = cipher.update(text, "utf8", "hex");
encrypted += cipher.final("hex");

const authTag = cipher.getAuthTag();

// Combine IV + encrypted data + auth tag
return iv.toString("hex") + ":" + encrypted + ":" + authTag.toString("hex");
}

export function decrypt(encryptedText: string, encryptionKey: string): string {
  const parts = encryptedText.split(":");
  
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const authTag = Buffer.from(parts[2], "hex");
  const key = Buffer.from(encryptionKey, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
