/**
 * Body poses for collision. 0.2 colliders sit at their body's origin, aligned
 * with its axes, so a collider's pose is its body's position and rotation.
 * Rotations are MathTS `[w, x, y, z]` unit quaternions.
 */

import {
  quaternionConjugate,
  quaternionNormalize,
  quaternionRotate,
  quaternionToRotationMatrix,
} from '@danielsimonjr/mathts-functions';
import { BODY_FIELDS, type BodyHandle, type World } from '@danielsimonjr/physjs-core';
import { requireSlot } from '../world/handles';
import { readColumn } from '../world/storage';
import { add, sub, type Vec } from './vector';

/** A rigid transform with its inverse rotation and rotation matrix. */
export interface Pose {
  /** Origin, world frame. */
  readonly position: readonly number[];
  /** Unit quaternion `[w, x, y, z]`. */
  readonly rotation: readonly number[];
  /** Conjugate of `rotation`. */
  readonly inverse: readonly number[];
  /** Rotation matrix of `rotation`, rows. */
  readonly matrix: readonly (readonly number[])[];
}

type Quat = Parameters<typeof quaternionRotate>[0];
type Vec3 = Parameters<typeof quaternionRotate>[1];

/** A pose from a position and a quaternion, which is normalized. */
export function makePose(position: Vec, rotation: Vec): Pose {
  const q = quaternionNormalize(rotation as unknown as Quat) as unknown as number[];
  return {
    position: Array.from(position),
    rotation: q,
    inverse: quaternionConjugate(q as unknown as Quat) as unknown as number[],
    matrix: quaternionToRotationMatrix(q as unknown as Quat) as unknown as number[][],
  };
}

/** The pose of a live body. */
export function bodyPose(world: World, body: BodyHandle): Pose {
  const slot = requireSlot(world.bodies, body);
  return makePose(
    readColumn(world.bodies, 'position', slot, new Array<number>(BODY_FIELDS.position.components)),
    readColumn(world.bodies, 'rotation', slot, new Array<number>(BODY_FIELDS.rotation.components))
  );
}

/** A local direction in the world frame. */
export const directionToWorld = (pose: Pose, d: Vec): number[] =>
  quaternionRotate(pose.rotation as unknown as Quat, d as unknown as Vec3);
/** A world direction in the local frame. */
export const directionToLocal = (pose: Pose, d: Vec): number[] =>
  quaternionRotate(pose.inverse as unknown as Quat, d as unknown as Vec3);
/** A local point in the world frame. */
export const pointToWorld = (pose: Pose, p: Vec): number[] =>
  add(directionToWorld(pose, p), pose.position);
/** A world point in the local frame. */
export const pointToLocal = (pose: Pose, p: Vec): number[] =>
  directionToLocal(pose, sub(p, pose.position));
