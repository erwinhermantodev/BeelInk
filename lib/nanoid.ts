import { customAlphabet } from 'nanoid';

// Alphanumeric alphabet excluding lookalike characters
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const generator = customAlphabet(alphabet, 8);

export function generateShortId(): string {
  return generator();
}
