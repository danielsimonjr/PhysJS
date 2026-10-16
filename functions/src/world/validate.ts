/**
 * Input checks shared by every PhysJS entry point. Schemas come from the core
 * catalogs and rules from `VALUE_RULES`, so each field is checked by its row.
 */

import { VALUE_RULES, type ValueRule } from '@danielsimonjr/physjs-core';

/** How one input value is checked: the shape of a catalog row. */
export interface ValueSchema {
  /** Numbers in the value. */
  readonly components: number;
  /** Rule every number must satisfy. */
  readonly rule: ValueRule;
  /** The value is a plain number instead of an array. */
  readonly scalar?: boolean;
}

function show(value: unknown): string {
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value) || ArrayBuffer.isView(value)) return `[${String(value)}]`;
  return value === null ? 'null' : typeof value;
}

function isNumberList(value: unknown): value is ArrayLike<unknown> {
  return Array.isArray(value) || (ArrayBuffer.isView(value) && !(value instanceof DataView));
}

/**
 * Checks `value` against `schema` and returns its numbers in a new array.
 * Throws a `TypeError` for a wrong type or length and a `RangeError` for a
 * number that breaks the rule, naming `label` in both.
 */
export function readValue(label: string, value: unknown, schema: ValueSchema): number[] {
  let numbers: ArrayLike<unknown>;
  if (schema.scalar) {
    if (typeof value !== 'number')
      throw new TypeError(`${label} must be a number; got ${show(value)}`);
    numbers = [value];
  } else {
    if (!isNumberList(value) || value.length !== schema.components) {
      throw new TypeError(
        `${label} must be an array of ${schema.components} numbers; got ${show(value)}`
      );
    }
    numbers = value;
  }
  const rule = VALUE_RULES[schema.rule];
  const out = new Array<number>(schema.components);
  for (let k = 0; k < schema.components; k++) {
    const x = numbers[k];
    const where = schema.scalar ? label : `${label}[${k}]`;
    if (typeof x !== 'number') throw new TypeError(`${where} must be a number; got ${show(x)}`);
    if (!rule.test(x)) throw new RangeError(`${where} must be ${rule.description}; got ${x}`);
    out[k] = x;
  }
  return out;
}

/** Throws a `TypeError` unless `value` is a non-null, non-array object. */
export function requireRecord(
  label: string,
  value: unknown
): asserts value is Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object; got ${show(value)}`);
  }
}

/** Throws a `TypeError` naming the first key of `record` that is not in `allowed`. */
export function rejectUnknownKeys(
  label: string,
  record: object,
  allowed: ReadonlySet<string>
): void {
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) {
      throw new TypeError(
        `${label} has no field "${key}"; known fields: ${[...allowed].join(', ')}`
      );
    }
  }
}
