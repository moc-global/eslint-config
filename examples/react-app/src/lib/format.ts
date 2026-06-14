/**
 * Joins truthy class-name fragments into a single space-separated string.
 * @param fragments - Class-name fragments; falsy values are skipped.
 * @returns The combined class-name string.
 */
export function classNames(...fragments: (string | false | undefined)[]): string {
  return fragments.filter(Boolean).join(' ');
}

/**
 * Turns a snake_case status into a capitalized, human-readable label.
 * @param status - The raw status value.
 * @returns A display label such as `In Progress`.
 */
export function formatStatus(status: string): string {
  const spaced = status.replaceAll('_', ' ');

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
