/**
 * World defaults. Physical constants are not defined here: default gravity is
 * MathTS standard gravity along `-up`, resolved by `createWorld`.
 */

import { deepFreeze } from './catalog/freeze';
import type { IntegratorName } from './catalog/integrators';

/** World dimensions this release simulates. */
export const SUPPORTED_DIMS = deepFreeze([3] as const);

/** A world dimension: one of {@link SUPPORTED_DIMS}. */
export type SupportedDims = (typeof SUPPORTED_DIMS)[number];

/** Settings a world takes when its options omit them. */
export interface WorldDefaults {
  /** Integrator used by `step`. */
  readonly integrator: IntegratorName;
  /** Unit up vector. +Y is up, as in fourJS. */
  readonly up: readonly number[];
  /** Body slots allocated before the store first grows. */
  readonly initialBodyCapacity: number;
}

/** The world defaults. */
export const WORLD_DEFAULTS: WorldDefaults = deepFreeze({
  integrator: 'semi-implicit-euler',
  up: [0, 1, 0],
  initialBodyCapacity: 16,
});

/** Collision settings used by the broadphase, narrowphase and queries. */
export interface CollisionDefaults {
  /** `findContacts` reports pairs whose surfaces are at most this far apart, metres. */
  readonly margin: number;
  /** GJK and EPA convergence and degeneracy tolerance, metres. */
  readonly tolerance: number;
  /** Iteration cap of GJK and of EPA. */
  readonly maxIterations: number;
  /** A segment counts as facing a direction when its cosine to it is at most this. */
  readonly featureAlignment: number;
  /** Most points kept in one contact manifold. */
  readonly maxManifoldPoints: number;
}

/** The collision settings. */
export const COLLISION_DEFAULTS: CollisionDefaults = deepFreeze({
  margin: 0,
  tolerance: 1e-9,
  maxIterations: 64,
  featureAlignment: 0.02,
  maxManifoldPoints: 4,
});
