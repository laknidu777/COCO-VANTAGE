import { createHash, randomBytes } from 'crypto';

export function generateCartToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashCartToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}