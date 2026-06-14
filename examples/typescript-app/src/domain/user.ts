import { generateId } from '@utils/id';

/** A person who can be assigned tasks. */
export interface User {
  readonly createdAt: Date;
  readonly email: string;
  readonly id: string;
  readonly name: string;
}

/** The fields a caller supplies to create a {@link User}. */
export interface NewUser {
  email: string;
  name: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/u;

/**
 * Checks whether a string is a syntactically valid email address.
 * @param email - The candidate email address.
 * @returns True when the address matches the expected shape.
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

/**
 * Builds a fully-formed {@link User} from caller-supplied fields.
 * @param input - The name and email for the new user.
 * @param now - The creation timestamp, injected for testability.
 * @returns A new user with a generated identifier.
 */
export function createUser(input: NewUser, now: Date): User {
  return {
    createdAt: now,
    email: input.email.toLowerCase(),
    id: generateId(),
    name: input.name.trim(),
  };
}
