import type { User } from '@domain/user';

/** Persistence boundary for {@link User} entities. */
export interface UserRepository {
  findById: (id: string) => User | undefined;
  list: () => User[];
  save: (user: User) => void;
}

/**
 * Creates an in-memory {@link UserRepository} backed by a map.
 * @returns A repository whose data lives for the process lifetime.
 */
export function createUserRepository(): UserRepository {
  const users = new Map<string, User>();

  return {
    findById: (id) => users.get(id),
    list: () => [...users.values()],
    save: (user) => {
      users.set(user.id, user);
    },
  };
}
