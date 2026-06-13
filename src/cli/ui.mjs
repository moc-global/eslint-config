// @ts-check
/**
 * Tiny zero-dependency terminal helpers: ANSI colors and consistent log lines.
 * Colors auto-disable when stdout is not a TTY or NO_COLOR is set.
 */

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

/**
 * Wraps text in an ANSI color code when color output is enabled.
 * @param {string} code - ANSI SGR code (e.g. '1;36').
 * @param {string} text - Text to wrap.
 * @returns {string} Colored (or plain) text.
 */
function paint(code, text) {
  return useColor ? `[${code}m${text}[0m` : text;
}

/** @type {Record<string, (text: string) => string>} */
export const color = {
  bold: (text) => paint('1', text),
  dim: (text) => paint('2', text),
  cyan: (text) => paint('36', text),
  green: (text) => paint('32', text),
  yellow: (text) => paint('33', text),
  red: (text) => paint('31', text),
};

/**
 * Prints an informational line.
 * @param {string} message - Text to print.
 */
export function info(message) {
  process.stdout.write(`${message}\n`);
}

/**
 * Prints a success line with a check mark.
 * @param {string} message - Text to print.
 */
export function success(message) {
  process.stdout.write(`${color.green('✔')} ${message}\n`);
}

/**
 * Prints a warning line.
 * @param {string} message - Text to print.
 */
export function warn(message) {
  process.stdout.write(`${color.yellow('!')} ${message}\n`);
}

/**
 * Prints an error line to stderr.
 * @param {string} message - Text to print.
 */
export function error(message) {
  process.stderr.write(`${color.red('✖')} ${message}\n`);
}

/**
 * Prints a step header.
 * @param {string} message - Text to print.
 */
export function step(message) {
  process.stdout.write(`\n${color.bold(color.cyan('▸'))} ${color.bold(message)}\n`);
}
