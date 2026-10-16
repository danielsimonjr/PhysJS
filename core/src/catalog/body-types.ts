/**
 * The body types, as data. `step` and `addBody` read these flags; there is no
 * `switch` on the type name anywhere in the engine.
 *
 * The names are fourJS's `BodyType` values, so the fourJS adapter passes them through.
 */

import type { DescriptorFieldName } from './body-fields';
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
  /** Descriptor fields that `addBody` requires for this type. */
  readonly requires: readonly DescriptorFieldName[];
}

/**
 * Every body type. A dynamic body needs an explicit `mass`: mass from collider
 * shape and density comes with the shape mass properties (MathTS #378).
 */
export const BODY_TYPES = deepFreeze([
  { name: 'static', integrates: false, dynamic: false, requires: [] },
  { name: 'dynamic', integrates: true, dynamic: true, requires: ['mass'] },
  { name: 'kinematic-position', integrates: false, dynamic: false, requires: [] },
  { name: 'kinematic-velocity', integrates: true, dynamic: false, requires: [] },
] as const satisfies readonly BodyTypeRecord[]);

/** A body type name: one of {@link BODY_TYPES}. */
export type BodyTypeName = (typeof BODY_TYPES)[number]['name'];
