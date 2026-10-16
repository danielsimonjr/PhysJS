/**
 * World records. A world is plain data: typed-array columns generated from
 * `BODY_FIELDS`, plus the settings `createWorld` resolved.
 */

import type { BodyFieldName } from '../catalog/body-fields';
import type { IntegratorName } from '../catalog/integrators';
import type { SupportedDims } from '../config';
import type { ColliderStore } from './collider';
import type { BroadphaseState } from './collision';
import type { PhysicsEvent } from './events';
import type { JointStore } from './joint';
import type { SolverState } from './solver';
import type { NumericInput } from './numeric';

/** What `createWorld` takes. */
export interface WorldOptions {
  /** World dimension. 0.x supports 3; 2D worlds run on the same engine later. */
  dims: SupportedDims;
  /** Gravity, m/s^2. Defaults to MathTS standard gravity along -up. */
  gravity?: NumericInput;
  /** Integrator name. Defaults to `WORLD_DEFAULTS.integrator`. */
  integrator?: IntegratorName;
  /** Bodies the store holds before it first grows. A positive integer. */
  initialBodyCapacity?: number;
}

/** Struct-of-arrays body storage. Index `i` of every column is one body slot. */
export interface BodyStore {
  /** Slots allocated in every column. */
  capacity: number;
  /** Slots ever handed out: the high-water mark that `step` scans. */
  size: number;
  /** Live bodies. */
  live: number;
  /** Generation of each slot; bumped when its body is removed. */
  generation: Uint32Array;
  /** 1 when the slot holds a live body. */
  alive: Uint8Array;
  /** Index into `BODY_TYPES` of each slot's body. */
  typeIndex: Uint8Array;
  /** Released slots, reused last-in first-out. */
  freeSlots: number[];
  /** One column per `BODY_FIELDS` entry, `components` numbers per slot. */
  fields: Record<BodyFieldName, Float64Array>;
}

/** A simulation world. Create with `createWorld`; change through PhysJS functions. */
export interface World {
  /** World dimension. */
  readonly dims: SupportedDims;
  /** Gravity, m/s^2. */
  readonly gravity: Float64Array;
  /** Integrator used by `step`. */
  readonly integrator: IntegratorName;
  /** Simulated time, seconds. */
  time: number;
  /** Steps taken. */
  steps: number;
  /** Body storage. */
  readonly bodies: BodyStore;
  /** Colliders, keyed by handle. */
  readonly colliders: ColliderStore;
  /** Sweep-and-prune order kept between `findContacts` calls. */
  readonly broadphase: BroadphaseState;
  /** Joints, keyed by handle. */
  readonly joints: JointStore;
  /** Contact solver state carried between steps. */
  readonly solver: SolverState;
  /** Events queued by `step`, oldest first; read them with `drainEvents`. */
  readonly events: PhysicsEvent[];
}
