/**
 * Joint types, as rows of constrained degrees of freedom. `linear` says what
 * happens between the two anchors and `angular` what happens to the relative
 * rotation; the solver builds its rows from these modes, so a joint type is a
 * row here, not code. Parameters are checked like shape parameters. In a 2-D
 * world a spherical joint is the revolute joint about z; hinge is 3-D only.
 */

import { deepFreeze } from './freeze';
import type { ValueRule } from './value-rules';

/** What a joint does to the anchor separation. */
export type LinearMode =
  /** The anchors coincide: three velocity rows. */
  | 'locked'
  /** A damped spring along the anchor line, applied as a load. */
  | 'spring'
  /** Nothing. */
  | 'free';

/** What a joint does to the relative rotation. */
export type AngularMode =
  /** The relative rotation stays as it was when the joint was added: three rows. */
  | 'locked'
  /** Only rotation about the hinge axis is free: two rows. */
  | 'hinge'
  /** Nothing. */
  | 'free';

/** Schema of one joint parameter. */
export interface JointParamRecord {
  /** Numbers in the parameter. */
  readonly components: number;
  /** The parameter is a plain number instead of an array. */
  readonly scalar?: boolean;
  /** Rule every component must satisfy. */
  readonly rule: ValueRule;
  /** The descriptor may omit the parameter. */
  readonly optional?: boolean;
}

/** One joint type. */
export interface JointTypeRecord {
  /** The fourJS joint type name. */
  readonly name: string;
  /** Linear mode. */
  readonly linear: LinearMode;
  /** Angular mode. */
  readonly angular: AngularMode;
  /** World dimensions the joint type works in. */
  readonly dims: readonly number[];
  /** Type-specific parameters, keyed by descriptor field. */
  readonly params: Readonly<Record<string, JointParamRecord>>;
}

/** Every joint type. */
export const JOINT_TYPES = deepFreeze([
  { name: 'fixed', linear: 'locked', angular: 'locked', dims: [2, 3], params: {} },
  {
    name: 'hinge',
    linear: 'locked',
    angular: 'hinge',
    dims: [3],
    params: { axis: { components: 3, rule: 'finite' } },
  },
  { name: 'spherical', linear: 'locked', angular: 'free', dims: [2, 3], params: {} },
  {
    name: 'spring',
    linear: 'spring',
    angular: 'free',
    dims: [2, 3],
    params: {
      stiffness: { components: 1, scalar: true, rule: 'positive' },
      damping: { components: 1, scalar: true, rule: 'nonNegative', optional: true },
      restLength: { components: 1, scalar: true, rule: 'nonNegative', optional: true },
    },
  },
] as const satisfies readonly JointTypeRecord[]);

/** A joint type name. */
export type JointTypeName = (typeof JOINT_TYPES)[number]['name'];
