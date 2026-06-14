/* eslint-disable @typescript-eslint/naming-convention, unicorn/prevent-abbreviations -- this logger intentionally mirrors the `console` API (log/info/warn/error/dir/table) and uses reserved-word-avoiding identifiers (`arguments_`, `VERBOSE`). */
const VERBOSE = process.env.ESLINT_DEBUG === 'true';

/** A context-prefixed console wrapper; each method mirrors `console`. */
export interface EslintLogger {
  log: (...arguments_: unknown[]) => void;
  info: (...arguments_: unknown[]) => void;
  warn: (...arguments_: unknown[]) => void;
  error: (...arguments_: unknown[]) => void;
  dir: (...arguments_: unknown[]) => void;
  table: (...arguments_: unknown[]) => void;
}

/**
 * Colors a console output with ANSI escape codes based on the context and method.
 * @param context - The context label (e.g., ESLint plugin name).
 * @param method - The console method name (e.g., 'log', 'info', 'warn').
 * @returns A formatted string with ANSI color prefix and the context label.
 */
function colorContext(context: string, method: string): string {
  const METHOD_COLORS: Record<string, string> = {
    log: '\u001B[32m',
    info: '\u001B[36m',
    warn: '\u001B[33m',
    error: '\u001B[31m',
    dir: '\u001B[35m',
    table: '\u001B[32m',
  };

  // eslint-disable-next-line security/detect-object-injection
  const methodColor = METHOD_COLORS[method] ?? '';

  if (methodColor) {
    return `${methodColor}[ESLint:${context}]\u001B[0m`;
  }

  return `[ESLint:${context}]`;
}

const noop = (): void => undefined;

/**
 * Creates a logger instance with context-prefixed, colored console output.
 * Enable output by setting ESLINT_DEBUG=true in your environment.
 * @param context - The context label to prefix log messages with.
 * @returns An object with log, info, warn, error, dir, and table methods.
 */
export function eslintLogger(context: string): EslintLogger {
  if (!VERBOSE) {
    return { log: noop, info: noop, warn: noop, error: noop, dir: noop, table: noop };
  }

  // The console methods have divergent, non-variadic signatures (dir/table take
  // typed second arguments); treat them uniformly as variadic sinks.
  const sink = console as unknown as Record<keyof EslintLogger, (...arguments_: unknown[]) => void>;

  return {
    /* eslint-disable no-console, lintlord/prefer-logger */
    log: (...arguments_) => {
      sink.log(colorContext(context, 'log'), ...arguments_);
    },
    info: (...arguments_) => {
      sink.info(colorContext(context, 'info'), ...arguments_);
    },
    warn: (...arguments_) => {
      sink.warn(colorContext(context, 'warn'), ...arguments_);
    },
    error: (...arguments_) => {
      sink.error(colorContext(context, 'error'), ...arguments_);
    },
    dir: (...arguments_) => {
      sink.dir(colorContext(context, 'dir'), ...arguments_);
    },
    table: (...arguments_) => {
      sink.table(colorContext(context, 'table'), ...arguments_);
    },
    /* eslint-enable no-console, lintlord/prefer-logger */
  };
}
