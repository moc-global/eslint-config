/** Parsed installer options shared across the CLI commands. */
export interface CliOptions {
  /** Directory to operate in. */
  rootDir: string;
  /** Skip prompts; use detection/preset. */
  yes: boolean;
  /** Whether to run the install step. */
  install: boolean;
  /** Print actions without writing/installing. */
  dryRun: boolean;
  /** Forced base stack. */
  preset?: string;
  /** Forced extras. */
  extras?: string[];
  /** Force the Vue TypeScript parser chain. */
  vueTs?: boolean;
}
