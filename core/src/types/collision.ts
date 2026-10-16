/**
 * Collision results: contact manifolds from `findContacts`, ray hits from
 * `raycast`. Vectors are world-frame `[x, y, z]` arrays.
 */

import type { BodyHandle } from './body';
import type { ColliderHandle } from './collider';

/** An axis-aligned bounding box, world frame, metres. */
export interface Aabb {
  /** Lowest corner. */
  readonly min: readonly [number, number, number];
  /** Highest corner. */
  readonly max: readonly [number, number, number];
}

/** One point of a contact manifold. */
export interface ContactPoint {
  /** Midpoint between the two surfaces, metres. */
  readonly position: readonly [number, number, number];
  /** Penetration along the manifold normal, metres; negative inside the margin only. */
  readonly depth: number;
}

/** The contact between two colliders. */
export interface ContactManifold {
  /** First collider; the lower handle of the pair. */
  readonly colliderA: ColliderHandle;
  /** Second collider. */
  readonly colliderB: ColliderHandle;
  /** Body of `colliderA`. */
  readonly bodyA: BodyHandle;
  /** Body of `colliderB`. */
  readonly bodyB: BodyHandle;
  /** Unit normal pointing from A to B. */
  readonly normal: readonly [number, number, number];
  /** Contact points, deepest first; at most `COLLISION_DEFAULTS.maxManifoldPoints`. */
  readonly points: readonly ContactPoint[];
}

/** The nearest collider a ray hits. */
export interface RayHit {
  /** Collider hit. */
  readonly collider: ColliderHandle;
  /** Body of the collider. */
  readonly body: BodyHandle;
  /** Distance along the ray, metres. */
  readonly distance: number;
  /** Hit point, metres. */
  readonly point: readonly [number, number, number];
  /** Unit surface normal at the hit, facing the ray origin. */
  readonly normal: readonly [number, number, number];
}

/** Sweep-and-prune state kept between calls, so the sort starts nearly sorted. */
export interface BroadphaseState {
  /** Collider handles in the order of the last sweep. */
  order: ColliderHandle[];
}
