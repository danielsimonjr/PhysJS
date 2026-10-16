/** Joint records. Anchors and axes are given in world frame and stored per body. */

import type { JointTypeName } from '../catalog/joints';
import type { BodyHandle } from './body';
import type { NumericInput } from './numeric';

/** Opaque joint handle, unique within its world. */
export type JointHandle = number & { readonly __physjsBrand: 'JointHandle' };

/** What `addJoint` takes. */
export interface JointDescriptor {
  /** Joint type: one of `JOINT_TYPES`. */
  readonly type: JointTypeName;
  /** First body. */
  readonly bodyA: BodyHandle;
  /** Second body. */
  readonly bodyB: BodyHandle;
  /** Anchor on body A, world frame, metres. */
  readonly anchorA: NumericInput;
  /** Anchor on body B, world frame. Defaults to `anchorA`. */
  readonly anchorB?: NumericInput;
  /** Whether the two bodies still collide with each other. Defaults to false. */
  readonly collideConnected?: boolean;
  /** Hinge axis, world frame (hinge only); normalized. */
  readonly axis?: NumericInput;
  /** Spring stiffness, N/m (spring only). */
  readonly stiffness?: number;
  /** Spring damping, N s/m (spring only). Defaults to 0. */
  readonly damping?: number;
  /** Spring rest length, metres (spring only). Defaults to the anchor distance. */
  readonly restLength?: number;
}

/** A stored joint. Local vectors are in each body's frame. */
export interface JointRecord {
  /** Joint type. */
  readonly type: JointTypeName;
  /** First body. */
  readonly bodyA: BodyHandle;
  /** Second body. */
  readonly bodyB: BodyHandle;
  /** Anchor in body A's frame. */
  readonly localAnchorA: readonly [number, number, number];
  /** Anchor in body B's frame. */
  readonly localAnchorB: readonly [number, number, number];
  /** Hinge axis in body A's frame (unit), or zeros. */
  readonly localAxisA: readonly [number, number, number];
  /** Hinge axis in body B's frame (unit), or zeros. */
  readonly localAxisB: readonly [number, number, number];
  /** Relative rotation `conj(qA) qB` when the joint was added. */
  readonly reference: readonly [number, number, number, number];
  /** Whether the bodies collide with each other. */
  readonly collideConnected: boolean;
  /** Spring stiffness, N/m; 0 for other types. */
  readonly stiffness: number;
  /** Spring damping, N s/m. */
  readonly damping: number;
  /** Spring rest length, metres. */
  readonly restLength: number;
}

/** Joints of a world, keyed by handle. */
export interface JointStore {
  /** Next handle to hand out. */
  next: number;
  /** Live joints. */
  readonly byHandle: Map<JointHandle, JointRecord>;
}
