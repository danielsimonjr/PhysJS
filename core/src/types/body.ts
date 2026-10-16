/**
 * Body records. Field names follow fourJS's `RigidBodyDescriptor` so the fourJS
 * adapter passes descriptors through. Every field is described by a row of
 * `BODY_FIELDS`, and a type test keeps this interface and that table in step.
 */

import type { BodyTypeName } from '../catalog/body-types';
import type { NumericInput } from './numeric';

/** Opaque, generation-tagged body handle. A removed body's handle stays invalid. */
export type BodyHandle = number & { readonly __physjsBrand: 'BodyHandle' };

/** What `addBody` takes. Every field but `type` is optional. */
export interface BodyDescriptor {
  /** Simulation model of the body. */
  type: BodyTypeName;
  /** World position of the centre of mass, metres. */
  position?: NumericInput;
  /** Orientation, a quaternion `[w, x, y, z]`; normalized on input. */
  rotation?: NumericInput;
  /** World linear velocity, m/s. Must be zero on a static or kinematic-position body. */
  linearVelocity?: NumericInput;
  /** World angular velocity, rad/s. Must be zero on a static or kinematic-position body. */
  angularVelocity?: NumericInput;
  /** Mass, kg. Required on a dynamic body and ignored on the others. */
  mass?: number;
  /**
   * Principal moments of inertia about the centre of mass, kg m^2, along the
   * body axes. Omitted means infinite: torques do not turn the body. Infinity
   * in one component locks that axis. Ignored on a body that is not dynamic.
   */
  inertia?: NumericInput;
  /** Linear damping coefficient, 1/s, at least 0. */
  linearDamping?: number;
  /** Angular damping coefficient, 1/s, at least 0. */
  angularDamping?: number;
  /** Multiplier on world gravity for this body. 0 is weightless; negative inverts. */
  gravityScale?: number;
}
