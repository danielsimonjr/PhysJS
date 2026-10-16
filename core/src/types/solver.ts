/** Contact solver state kept between steps. */

import type { BodyHandle } from './body';
import type { ColliderHandle } from './collider';

/** The impulses of one contact point, kept to warm-start the next step. */
export interface CachedImpulse {
  /** Contact position, world frame, metres. */
  readonly position: readonly [number, number, number];
  /** Accumulated normal impulse, N s. */
  readonly normal: number;
  /** Accumulated impulses along the two tangents, N s. */
  readonly tangent: readonly [number, number];
}

/** A pair of colliders in contact. */
export interface TouchingPair {
  /** Lower collider handle. */
  readonly colliderA: ColliderHandle;
  /** Higher collider handle. */
  readonly colliderB: ColliderHandle;
  /** Body of `colliderA`. */
  readonly bodyA: BodyHandle;
  /** Body of `colliderB`. */
  readonly bodyB: BodyHandle;
}

/** What the solver carries from one step to the next. */
export interface SolverState {
  /** Impulses of the last step, keyed by collider pair. */
  cache: Map<string, CachedImpulse[]>;
  /** Pairs touching at the end of the last step, keyed by collider pair. */
  touching: Map<string, TouchingPair>;
}
