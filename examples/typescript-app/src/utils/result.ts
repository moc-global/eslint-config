/** The successful branch of a {@link Result}. */
export interface Success<TValue> {
  readonly ok: true;
  readonly value: TValue;
}

/** The failed branch of a {@link Result}. */
export interface Failure<TError> {
  readonly error: TError;
  readonly ok: false;
}

/**
 * A discriminated-union result for operations that can fail without throwing.
 * The success branch carries a value; the failure branch carries an error.
 */
export type Result<TValue, TError = Error> = Failure<TError> | Success<TValue>;

/**
 * Wraps a value in a successful {@link Result}.
 * @param value - The value produced by the successful operation.
 * @returns A success result carrying the value.
 */
export function success<TValue>(value: TValue): Success<TValue> {
  return { ok: true, value };
}

/**
 * Wraps an error in a failed {@link Result}.
 * @param error - The error describing why the operation failed.
 * @returns A failure result carrying the error.
 */
export function failure<TError>(error: TError): Failure<TError> {
  return { error, ok: false };
}
