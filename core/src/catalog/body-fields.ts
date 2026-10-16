/**
 * Per-body state, as data. Each record is one struct-of-arrays column in the
 * world's body store. Storage, defaults, descriptor validation, accessors and
 * the per-step load reset are all generated from this table.
 *
 * Units are SI: metres, kilograms, seconds, radians. Rotations are unit
 * quaternions `[w, x, y, z]`, the MathTS convention. Vectors are world frame,
 * except `inertia`, whose components are principal moments in the body frame.
 */

import { deepFreeze } from './freeze';
import type { ValueRule } from './value-rules';

/** What a field is for, which decides how the engine treats it. */
export type BodyFieldRole =
  /** Position or orientation. Any body type may be posed. */
  | 'pose'
  /** Integrated velocity. Must be zero on a body type that does not integrate. */
  | 'velocity'
  /** Mass or inertia. Ignored (infinite) on a body type that is not dynamic. */
  | 'massProperty'
  /** A per-body coefficient (damping, gravity scale). */
  | 'coefficient'
  /** A load summed by `applyForce` / `applyTorque` and reset after each step. */
  | 'accumulator'
  /** Computed from another field; never given directly. */
  | 'derived'
  /** Sleep bookkeeping kept by `step`; never given directly. */
  | 'sleep';

/**
 * How a field looks in a `dims: 2` world: `same` as in 3-D, a `vector` `[x, y]`,
 * the `axial` z component as a number, an `angle` about +z, or a `moment` about z
 * (the other axes locked by infinite inertia).
 */
export type PlanarView = 'same' | 'vector' | 'axial' | 'angle' | 'moment';

/** One column of the body store. */
export interface BodyFieldRecord {
  /** Numbers per body. */
  readonly components: number;
  /** Value of a new body when the descriptor omits the field. */
  readonly initial: readonly number[];
  /** Rule every component must satisfy. */
  readonly rule: ValueRule;
  /** How the engine treats the field. */
  readonly role: BodyFieldRole;
  /** Whether `BodyDescriptor` may set the field. */
  readonly descriptor: boolean;
  /** The descriptor takes a plain number instead of an array. */
  readonly scalar?: boolean;
  /** Normalization applied after validation. */
  readonly normalize?: 'quaternion';
  /** Source field of a `derived` field; the value is its reciprocal. */
  readonly derivedFrom?: string;
  /** The field's form in a 2-D world. */
  readonly planar: PlanarView;
}

/** Every body field, keyed by name. */
export const BODY_FIELDS = deepFreeze({
  position: {
    components: 3,
    initial: [0, 0, 0],
    rule: 'finite',
    planar: 'vector',
    role: 'pose',
    descriptor: true,
  },
  rotation: {
    components: 4,
    initial: [1, 0, 0, 0],
    rule: 'finite',
    planar: 'angle',
    role: 'pose',
    descriptor: true,
    normalize: 'quaternion',
  },
  linearVelocity: {
    components: 3,
    initial: [0, 0, 0],
    rule: 'finite',
    planar: 'vector',
    role: 'velocity',
    descriptor: true,
  },
  angularVelocity: {
    components: 3,
    initial: [0, 0, 0],
    rule: 'finite',
    planar: 'axial',
    role: 'velocity',
    descriptor: true,
  },
  mass: {
    components: 1,
    initial: [Infinity],
    rule: 'positive',
    planar: 'same',
    role: 'massProperty',
    descriptor: true,
    scalar: true,
  },
  inertia: {
    components: 3,
    initial: [Infinity, Infinity, Infinity],
    rule: 'positiveOrInfinite',
    planar: 'moment',
    role: 'massProperty',
    descriptor: true,
  },
  linearDamping: {
    components: 1,
    initial: [0],
    rule: 'nonNegative',
    planar: 'same',
    role: 'coefficient',
    descriptor: true,
    scalar: true,
  },
  angularDamping: {
    components: 1,
    initial: [0],
    rule: 'nonNegative',
    planar: 'same',
    role: 'coefficient',
    descriptor: true,
    scalar: true,
  },
  gravityScale: {
    components: 1,
    initial: [1],
    rule: 'finite',
    planar: 'same',
    role: 'coefficient',
    descriptor: true,
    scalar: true,
  },
  inverseMass: {
    components: 1,
    initial: [0],
    rule: 'nonNegative',
    planar: 'same',
    role: 'derived',
    descriptor: false,
    derivedFrom: 'mass',
  },
  inverseInertia: {
    components: 3,
    initial: [0, 0, 0],
    rule: 'nonNegative',
    planar: 'same',
    role: 'derived',
    descriptor: false,
    derivedFrom: 'inertia',
  },
  force: {
    components: 3,
    initial: [0, 0, 0],
    rule: 'finite',
    planar: 'vector',
    role: 'accumulator',
    descriptor: false,
  },
  torque: {
    components: 3,
    initial: [0, 0, 0],
    rule: 'finite',
    planar: 'axial',
    role: 'accumulator',
    descriptor: false,
  },
  sleepTimer: {
    components: 1,
    initial: [0],
    rule: 'nonNegative',
    planar: 'same',
    role: 'sleep',
    descriptor: false,
    scalar: true,
  },
  asleep: {
    components: 1,
    initial: [0],
    rule: 'unitInterval',
    planar: 'same',
    role: 'sleep',
    descriptor: false,
    scalar: true,
  },
} as const satisfies Readonly<Record<string, BodyFieldRecord>>);

/** Name of a column in {@link BODY_FIELDS}. */
export type BodyFieldName = keyof typeof BODY_FIELDS;

/** The fields a `BodyDescriptor` may set. */
export type DescriptorFieldName = {
  [K in BodyFieldName]: (typeof BODY_FIELDS)[K]['descriptor'] extends true ? K : never;
}[BodyFieldName];
