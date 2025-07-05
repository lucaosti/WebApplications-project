import { scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

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
