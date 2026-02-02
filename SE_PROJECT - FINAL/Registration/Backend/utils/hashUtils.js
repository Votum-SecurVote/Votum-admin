// utils/hashUtils.js
import crypto from 'crypto';

export function hashIdentityProof(input) {
  const trimmed = input.trim();
  return crypto.createHash('sha256').update(trimmed).digest('hex');
}