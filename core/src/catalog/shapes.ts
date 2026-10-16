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
  /** The parameter is a list of at least `min` points of `components` numbers each. */
  readonly points?: { readonly min: number };
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

/**
 * Every shape type. Lengths are metres; a capsule's axis is local +Y. The 2-D
 * shapes (MathTS `massProperties` names) live in `dims: 2` worlds; a polygon is
 * convex, counter-clockwise and centred on its centroid.
 */
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
  {
    type: 'circle',
    dims: 2,
    core: 'point',
    params: { radius: { components: 1, scalar: true, rule: 'positive' } },
  },
  {
    type: 'rectangle',
    dims: 2,
    core: 'polytope',
    params: { halfExtents: { components: 2, rule: 'positive' } },
  },
  {
    type: 'capsule2d',
    dims: 2,
    core: 'segment',
    params: {
      radius: { components: 1, scalar: true, rule: 'positive' },
      halfHeight: { components: 1, scalar: true, rule: 'positive' },
    },
  },
  {
    type: 'polygon',
    dims: 2,
    core: 'polytope',
    params: { vertices: { components: 2, rule: 'finite', points: { min: 3 } } },
  },
] as const satisfies readonly ShapeRecord[]);

/** A shape type name: one of {@link SHAPES}. */
export type ShapeType = (typeof SHAPES)[number]['type'];
