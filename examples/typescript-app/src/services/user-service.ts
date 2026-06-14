import { createUser, isValidEmail, type NewUser, type User } from '@domain/user';

import { ValidationError } from '@errors/app-error';

import type { UserRepository } from '@repositories/user-repository';

import { failure, type Result, success } from '@utils/result';

/** Coordinates user creation and lookup against a {@link UserRepository}. */
export class UserService {
  private readonly repository: UserRepository;

  /**
   * Creates the service.
   * @param repository - The backing user repository.
   */
  public constructor(repository: UserRepository) {
    this.repository = repository;
  }

  /**
   * Registers a new user after validating their email.
   * @param input - The name and email for the new user.
   * @param now - The creation timestamp.
   * @returns The created user, or a validation error.
   */
  public register(input: NewUser, now: Date): Result<User, ValidationError> {
    if (!isValidEmail(input.email)) {
      return failure(new ValidationError(`"${input.email}" is not a valid email address`));
    }

    const user = createUser(input, now);

    this.repository.save(user);

    return success(user);
  }

  /**
   * Lists every registered user.
   * @returns All users currently stored.
   */
  public listUsers(): User[] {
    return this.repository.list();
  }
}
