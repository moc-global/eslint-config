/** Machine-readable codes describing why an application operation failed. */
export type ErrorCode = 'CONFLICT' | 'NOT_FOUND' | 'VALIDATION';

/** The base class for every error this application raises deliberately. */
export class ApplicationError extends Error {
  public readonly code: ErrorCode;

  /**
   * Creates an application error.
   * @param code - The machine-readable failure code.
   * @param message - A human-readable explanation.
   */
  public constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
  }
}

/** Raised when a requested entity does not exist. */
export class NotFoundError extends ApplicationError {
  /**
   * Creates a not-found error.
   * @param entity - The kind of entity that was missing.
   * @param id - The identifier that could not be resolved.
   */
  public constructor(entity: string, id: string) {
    super('NOT_FOUND', `${entity} with id "${id}" was not found`);
    this.name = 'NotFoundError';
  }
}

/** Raised when input fails a domain validation rule. */
export class ValidationError extends ApplicationError {
  /**
   * Creates a validation error.
   * @param message - A human-readable explanation of the violated rule.
   */
  public constructor(message: string) {
    super('VALIDATION', message);
    this.name = 'ValidationError';
  }
}
