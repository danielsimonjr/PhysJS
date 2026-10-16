/** Freezing for the catalog tables, so no caller can change them at run time. */

/** Freezes `value` and every object and array inside it, and returns it. */
export function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) deepFreeze(inner);
  }
  return value;
}
