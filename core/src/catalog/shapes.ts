/**
 * Collision shapes, as data: one record per shape type with its parameter
 * schema. Names and parameters follow fourJS's `CollisionShape` union.
 *
 * Mass properties, bounds and ray tests join these records as MathTS and
 * later milestones provide them (MathTS #378 for mass properties).
 */

import { deepFreeze } from './freeze';
import type { ValueRule } from './value-rules';

/** Schema of one shape parameter. */
export interface ShapeParamRecord {
  /** Numbers in the parameter. */
  readonly components: number;
  /** The parameter is a plain number instead of an array. */
  readonly scalar?: boolean;
  /** Rule every component must satisfy. */
  readonly rule: ValueRule;
}

/** One shape type. */
export interface ShapeRecord {
  /** The fourJS shape `type`. */
  readonly type: string;
  /** World dimension the shape belongs to. */
  readonly dims: number;
  /** Parameters, keyed by their descriptor field name. */
  readonly params: Readonly<Record<string, ShapeParamRecord>>;
}

/** Every shape type. Lengths are metres; a capsule's axis is local +Y. */
export const SHAPES = deepFreeze([
  {
    type: 'sphere',
    dims: 3,
    params: { radius: { components: 1, scalar: true, rule: 'positive' } },
  },
  { type: 'box', dims: 3, params: { halfExtents: { components: 3, rule: 'positive' } } },
  {
    type: 'capsule',
    dims: 3,
    params: {
      radius: { components: 1, scalar: true, rule: 'positive' },
      halfHeight: { components: 1, scalar: true, rule: 'positive' },
    },
  },
] as const satisfies readonly ShapeRecord[]);

/** A shape type name: one of {@link SHAPES}. */
export type ShapeType = (typeof SHAPES)[number]['type'];
