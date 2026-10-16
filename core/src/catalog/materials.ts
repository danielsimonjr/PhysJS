/**
 * Collider materials, as data. Each row is an optional `ColliderDescriptor`
 * field with its default, its rule and how the two colliders of a contact
 * combine it. The combine functions live in PhysJS `dynamics/solver`.
 */

import { deepFreeze } from './freeze';
import type { ValueRule } from './value-rules';

/** How a contact combines the two colliders' values. */
export type CombineRule = 'geometricMean' | 'max';

/** One material field. */
export interface MaterialFieldRecord {
  /** Value when the descriptor omits the field. */
  readonly initial: number;
  /** Rule the value must satisfy. */
  readonly rule: ValueRule;
  /** How a contact combines the two colliders' values. */
  readonly combine: CombineRule;
}

/** Every material field, keyed by its `ColliderDescriptor` name. */
export const MATERIAL_FIELDS = deepFreeze({
  /** Coulomb friction coefficient. */
  friction: { initial: 0.5, rule: 'nonNegative', combine: 'geometricMean' },
  /** Coefficient of restitution: 0 is perfectly inelastic, 1 perfectly elastic. */
  restitution: { initial: 0, rule: 'unitInterval', combine: 'max' },
} as const satisfies Readonly<Record<string, MaterialFieldRecord>>);

/** A material field name. */
export type MaterialFieldName = keyof typeof MATERIAL_FIELDS;
