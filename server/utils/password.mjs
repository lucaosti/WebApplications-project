import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Create a scrypt hash for a password
 * @param {string} password - The plaintext password
 * @returns {Promise<string>} - The salt:hash string
 */
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a password against a scrypt hash
 * @param {string} password - The plaintext password
 * @param {string} hash - The stored hash in format "salt:hash"
 * @returns {Promise<boolean>} - True if password matches
 */
export async function verifyPassword(password, hash) {
  try {
    const [salt, storedHash] = hash.split(':');
    const derivedKey = await scryptAsync(password, salt, 64);
    return timingSafeEqual(Buffer.from(storedHash, 'hex'), derivedKey);
  } catch (error) {
    return false;
  }
}
