/** Runtime configuration resolved from the process environment. */
export interface AppConfig {
  readonly logLevel: string;
  readonly maxTasksPerUser: number;
}

const DEFAULT_MAX_TASKS = 50;

/**
 * Reads an integer environment variable, falling back to a default.
 * @param name - The environment variable name.
 * @param fallback - The value used when the variable is unset or invalid.
 * @returns The parsed integer, or the fallback.
 */
function readInt(name: string, fallback: number): number {
  const raw = process.env[name];

  if (raw === undefined) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);

  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Resolves the application configuration from the current environment.
 * @returns The fully-resolved {@link AppConfig}.
 */
export function loadConfig(): AppConfig {
  return {
    logLevel: process.env.LOG_LEVEL ?? 'info',
    maxTasksPerUser: readInt('MAX_TASKS_PER_USER', DEFAULT_MAX_TASKS),
  };
}
