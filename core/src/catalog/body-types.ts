/**
 * The body types, as data. `step` and `addBody` read these flags; there is no
 * `switch` on the type name anywhere in the engine.
 *
 * The names are fourJS's `BodyType` values, so the fourJS adapter passes them through.
 */

import { deepFreeze } from './freeze';

/** What one body type does during a step. */
export interface BodyTypeRecord {
  /** The fourJS body-type name. */
  readonly name: string;
  /** Whether `step` advances the pose from the body's velocities. */
  readonly integrates: boolean;
  /**
   * Whether gravity, forces, torques and damping act on the body. Only these
   * bodies use mass and inertia; on the others the mass properties are infinite.
   */
  readonly dynamic: boolean;
}

/**
 * Every body type. A dynamic body takes its mass and inertia from its colliders
 * (shape and density, through MathTS `massProperties`) or from explicit values.
 */
export const BODY_TYPES = deepFreeze([
  { name: 'static', integrates: false, dynamic: false },
  { name: 'dynamic', integrates: true, dynamic: true },
  { name: 'kinematic-position', integrates: false, dynamic: false },
  { name: 'kinematic-velocity', integrates: true, dynamic: false },
] as const satisfies readonly BodyTypeRecord[]);

/** A body type name: one of {@link BODY_TYPES}. */
export type BodyTypeName = (typeof BODY_TYPES)[number]['name'];
