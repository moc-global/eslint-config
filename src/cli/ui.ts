/**
 * Tiny zero-dependency terminal helpers: ANSI colors and consistent log lines.
 * Colors auto-disable when stdout is not a TTY or NO_COLOR is set.
 */

const isColorEnabled = process.stdout.isTTY && !process.env.NO_COLOR;

/**
 * Wraps text in an ANSI color code when color output is enabled.
 * @param code - ANSI SGR code (e.g. '1;36').
 * @param text - Text to wrap.
 * @returns Colored (or plain) text.
 */
function paint(code: string, text: string): string {
  return isColorEnabled ? `[${code}m${text}[0m` : text;
}

export const color: Record<string, (text: string) => string> = {
  bold: (text) => paint('1', text),
  dim: (text) => paint('2', text),
  cyan: (text) => paint('36', text),
  green: (text) => paint('32', text),
  yellow: (text) => paint('33', text),
  red: (text) => paint('31', text),
};

/**
 * Prints an informational line.
 * @param message - Text to print.
 */
export function info(message: string): void {
  process.stdout.write(`${message}\n`);
}

/**
 * Prints a success line with a check mark.
 * @param message - Text to print.
 */
export function success(message: string): void {
  process.stdout.write(`${color.green('✔')} ${message}\n`);
}

/**
 * Prints a warning line.
 * @param message - Text to print.
 */
export function warn(message: string): void {
  process.stdout.write(`${color.yellow('!')} ${message}\n`);
}

/**
 * Prints an error line to stderr.
 * @param message - Text to print.
 */
export function error(message: string): void {
  process.stderr.write(`${color.red('✖')} ${message}\n`);
}

/**
 * Prints a step header.
 * @param message - Text to print.
 */
export function step(message: string): void {
  process.stdout.write(`\n${color.bold(color.cyan('▸'))} ${color.bold(message)}\n`);
}
