/**
 * The number rules that catalog fields and shape parameters name. One table, so
 * every validator in PhysJS checks a value the same way and words the same error.
 */

import { deepFreeze } from './freeze';

/** Name of a rule in {@link VALUE_RULES}. */
export type ValueRule = 'finite' | 'nonNegative' | 'positive' | 'positiveOrInfinite';

/** A predicate on one number and the phrase an error uses for it. */
export interface ValueRuleRecord {
  /** True when `x` satisfies the rule. */
  readonly test: (x: number) => boolean;
  /** Completes "must be ...", for error messages. */
  readonly description: string;
}

/** Every {@link ValueRule}, keyed by name. */
export const VALUE_RULES: Readonly<Record<ValueRule, ValueRuleRecord>> = deepFreeze({
  finite: { test: (x: number) => Number.isFinite(x), description: 'a finite number' },
  nonNegative: {
    test: (x: number) => Number.isFinite(x) && x >= 0,
    description: 'a finite number >= 0',
  },
  positive: {
    test: (x: number) => Number.isFinite(x) && x > 0,
    description: 'a finite number > 0',
  },
  positiveOrInfinite: {
    test: (x: number) => x > 0,
    description: 'a number > 0 (Infinity allowed)',
  },
});
