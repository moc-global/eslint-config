/* eslint-disable no-console -- this module is the single sanctioned console boundary */

/** The severity levels the logger understands. */
export type LogLevel = 'debug' | 'error' | 'info' | 'warn';

/** A minimal structured logger backed by the console. */
export interface Logger {
  debug: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
}

/**
 * Emits a single structured log line.
 * @param level - The severity of the entry.
 * @param message - The human-readable message.
 * @param context - Optional structured fields attached to the entry.
 */
function write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const payload = { level, message, ...context };

  console[level](JSON.stringify(payload));
}

/**
 * Creates a logger whose entries are tagged with the given scope.
 * @param scope - A short label identifying the source of the entries.
 * @returns A {@link Logger} bound to the scope.
 */
export function createLogger(scope: string): Logger {
  return {
    debug: (message, context) => {
      write('debug', message, { scope, ...context });
    },
    error: (message, context) => {
      write('error', message, { scope, ...context });
    },
    info: (message, context) => {
      write('info', message, { scope, ...context });
    },
    warn: (message, context) => {
      write('warn', message, { scope, ...context });
    },
  };
}
