import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes key
const ALGORITHM = 'aes-256-gcm';

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

if (Buffer.from(ENCRYPTION_KEY, 'hex').length !== 32) {
  throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export function encrypt(text: string): EncryptedData {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from('qr-data')); // Additional authenticated data
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };

}

export function decrypt(encryptedData: EncryptedData): string {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(encryptedData.iv, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAAD(Buffer.from('qr-data'));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Helper function to encrypt QR code data
export function encryptQRData(data: any): string {
  const jsonString = JSON.stringify(data);
  const encryptedData = encrypt(jsonString);
  return JSON.stringify(encryptedData);
}

// Helper function to decrypt QR code data
export function decryptQRData(encryptedString: string): any {
  const encryptedData: EncryptedData = JSON.parse(encryptedString);
  const decryptedString = decrypt(encryptedData);
  return JSON.parse(decryptedString);
}