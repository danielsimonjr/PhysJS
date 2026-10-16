/**
 * Collision cores, as data. Every shape is a convex core swept by a radius: a
 * sphere is a point plus its radius, a capsule a segment plus its radius, and a
 * box a polytope with radius 0. The narrowphase picks its algorithm from the
 * cores of a pair: two `analytic` cores use closest points between segments
 * (MathTS `segmentSegmentClosest`); any other pair uses GJK, with EPA when the
 * cores overlap.
 */

import { deepFreeze } from './freeze';

/** One kind of collision core. */
export interface CollisionCoreRecord {
  /** Core name, referenced by the `core` field of a `SHAPES` row. */
  readonly name: string;
  /** Pairs of analytic cores skip GJK and EPA. */
  readonly analytic: boolean;
  /** What the core is. */
  readonly description: string;
}

/** Every collision core. */
export const COLLISION_CORES = deepFreeze([
  { name: 'point', analytic: true, description: 'one point (a degenerate segment)' },
  { name: 'segment', analytic: true, description: 'a line segment' },
  { name: 'polytope', analytic: false, description: 'a convex polytope given by its support' },
] as const satisfies readonly CollisionCoreRecord[]);

/** A collision core name: one of {@link COLLISION_CORES}. */
export type CollisionCoreName = (typeof COLLISION_CORES)[number]['name'];
