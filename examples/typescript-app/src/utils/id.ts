import { randomUUID } from 'node:crypto';

/**
 * Generates a fresh, collision-resistant identifier for a domain entity.
 * @returns A newly minted UUID v4 string.
 */
export function generateId(): string {
  return randomUUID();
}
