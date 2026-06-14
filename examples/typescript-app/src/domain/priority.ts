/** The priority levels a task can take, ordered from lowest to highest. */
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

/** A single task priority level. */
export type Priority = (typeof PRIORITIES)[number];

/** Numeric weight used to order tasks by their priority. */
const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 2,
  low: 0,
  medium: 1,
  urgent: 3,
};

/**
 * Compares two priorities for descending-urgency ordering.
 * @param first - The first priority to compare.
 * @param second - The second priority to compare.
 * @returns A negative number when `first` is more urgent than `second`.
 */
export function comparePriority(first: Priority, second: Priority): number {
  return PRIORITY_WEIGHT[second] - PRIORITY_WEIGHT[first];
}

/**
 * Type guard that checks whether an arbitrary string is a valid {@link Priority}.
 * @param value - The candidate string to validate.
 * @returns True when the value is a known priority level.
 */
export function isPriority(value: string): value is Priority {
  return (PRIORITIES as readonly string[]).includes(value);
}
