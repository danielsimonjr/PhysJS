/**
 * Collision shapes, as data: one record per shape type with its parameter
 * schema. Names and parameters follow fourJS's `CollisionShape` union.
 *
 * Mass properties come from MathTS `massProperties` (MathTS #378); support,
 * bounds, features and ray tests are the shape kernels in PhysJS collision.
 */

import type { CollisionCoreName } from './collision-cores';
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
  /** Collision core swept by the shape's radius: one of `COLLISION_CORES`. */
  readonly core: CollisionCoreName;
  /** Parameters, keyed by their descriptor field name. */
  readonly params: Readonly<Record<string, ShapeParamRecord>>;
}

/** Every shape type. Lengths are metres; a capsule's axis is local +Y. */
export const SHAPES = deepFreeze([
  {
    type: 'sphere',
    dims: 3,
    core: 'point',
    params: { radius: { components: 1, scalar: true, rule: 'positive' } },
  },
  {
    type: 'box',
    dims: 3,
    core: 'polytope',
    params: { halfExtents: { components: 3, rule: 'positive' } },
  },
  {
    type: 'capsule',
    dims: 3,
    core: 'segment',
    params: {
      radius: { components: 1, scalar: true, rule: 'positive' },
      halfHeight: { components: 1, scalar: true, rule: 'positive' },
    },
  },
] as const satisfies readonly ShapeRecord[]);

/** A shape type name: one of {@link SHAPES}. */
export type ShapeType = (typeof SHAPES)[number]['type'];
