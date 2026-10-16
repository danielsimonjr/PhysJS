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

/** Contact solver and sleep settings used by `step`. */
export interface SolverDefaults {
  /** Projected Gauss-Seidel sweeps per step. */
  readonly iterations: number;
  /** Fraction of the penetration beyond `slop` pushed out per step. */
  readonly baumgarte: number;
  /** Penetration left alone, metres, so resting contacts stay touching. */
  readonly slop: number;
  /** Contact margin `step` passes to `findContacts`, metres. */
  readonly contactMargin: number;
  /** Approach speed below which restitution is ignored, m/s. */
  readonly restitutionThreshold: number;
  /** Distance within which a contact point inherits last step's impulses, metres. */
  readonly warmStartRadius: number;
  /** Linear speed under which a body counts as resting, m/s. */
  readonly sleepLinearSpeed: number;
  /** Angular speed under which a body counts as resting, rad/s. */
  readonly sleepAngularSpeed: number;
  /** Seconds at rest before a body falls asleep. */
  readonly sleepTime: number;
}

/** The solver settings. */
export const SOLVER_DEFAULTS: SolverDefaults = deepFreeze({
  iterations: 10,
  baumgarte: 0.2,
  slop: 0.005,
  contactMargin: 0.02,
  restitutionThreshold: 1,
  warmStartRadius: 0.05,
  sleepLinearSpeed: 0.05,
  sleepAngularSpeed: 0.05,
  sleepTime: 0.5,
});
