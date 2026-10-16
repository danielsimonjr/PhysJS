/**
 * Adding, removing and reading joints. A descriptor is checked against its
 * `JOINT_TYPES` row: the shared fields, then exactly that row's parameters.
 * Anchors and the hinge axis are given in world frame and stored in each
 * body's frame, with the bodies' relative rotation as the reference.
 */

import { quaternionConjugate, quaternionMultiply } from '@danielsimonjr/mathts-functions';
import {
  JOINT_TYPES,
  type BodyHandle,
  type JointDescriptor,
  type JointHandle,
  type JointRecord,
  type JointTypeRecord,
  type World,
} from '@danielsimonjr/physjs-core';
import { bodyPose, directionToLocal, pointToLocal } from '../collision/pose';
import { length, sub, unit } from '../collision/vector';
import { wakeSlot } from '../dynamics/sleep';
import { requireSlot } from '../world/handles';
import { readValue, rejectUnknownKeys, requireRecord } from '../world/validate';

const SHARED_KEYS = ['type', 'bodyA', 'bodyB', 'anchorA', 'anchorB', 'collideConnected'];
const BY_NAME = new Map<string, { row: JointTypeRecord; keys: ReadonlySet<string> }>(
  JOINT_TYPES.map((row) => [
    row.name,
    { row, keys: new Set([...SHARED_KEYS, ...Object.keys(row.params)]) },
  ])
);

type Quat = Parameters<typeof quaternionMultiply>[0];
const triple = (v: readonly number[]): [number, number, number] => [v[0]!, v[1]!, v[2]!];

/** Reads parameter `name` of `row`, or `undefined` when it is optional and omitted. */
function param(
  row: JointTypeRecord,
  descriptor: JointDescriptor,
  name: string
): number[] | undefined {
  const schema = row.params[name];
  if (schema === undefined) return undefined;
  const value = (descriptor as unknown as Record<string, unknown>)[name];
  if (value === undefined && schema.optional === true) return undefined;
  return readValue(`${row.name}.${name}`, value, schema);
}

/**
 * Adds a joint between two bodies and returns its handle.
 *
 * ```ts
 * addJoint(world, { type: 'hinge', bodyA: frame, bodyB: door, anchorA: [1, 1, 0], axis: [0, 1, 0] });
 * addJoint(world, { type: 'spring', bodyA: a, bodyB: b, anchorA: [0, 0, 0], anchorB: [0, 2, 0], stiffness: 100 });
 * ```
 *
 * The joint holds what its `JOINT_TYPES` row locks, from the poses at this
 * call. Unless `collideConnected` is true the two bodies stop colliding.
 */
export function addJoint(world: World, descriptor: JointDescriptor): JointHandle {
  requireRecord('joint descriptor', descriptor);
  const entry = BY_NAME.get(descriptor.type);
  if (entry === undefined) {
    const known = JOINT_TYPES.map((row) => row.name).join(', ');
    throw new RangeError(`joint type must be one of ${known}; got ${String(descriptor.type)}`);
  }
  const { row, keys } = entry;
  rejectUnknownKeys(`${row.name} joint`, descriptor, keys);
  const { bodyA, bodyB } = descriptor;
  requireSlot(world.bodies, bodyA);
  requireSlot(world.bodies, bodyB);
  if (bodyA === bodyB) throw new RangeError('a joint needs two different bodies');
  const anchorA = readValue('anchorA', descriptor.anchorA, { components: 3, rule: 'finite' });
  const anchorB =
    descriptor.anchorB === undefined
      ? anchorA
      : readValue('anchorB', descriptor.anchorB, { components: 3, rule: 'finite' });
  const collideConnected = descriptor.collideConnected ?? false;
  if (typeof collideConnected !== 'boolean') {
    throw new TypeError('collideConnected must be a boolean');
  }
  const axisInput = param(row, descriptor, 'axis');
  const axis = axisInput && unit(axisInput);
  if (axisInput !== undefined && axis === undefined) {
    throw new RangeError(`${row.name}.axis must not be the zero vector`);
  }
  const poseA = bodyPose(world, bodyA);
  const poseB = bodyPose(world, bodyB);
  const reference = quaternionMultiply(
    quaternionConjugate(poseA.rotation as unknown as Quat) as unknown as Quat,
    poseB.rotation as unknown as Quat
  ) as unknown as number[];
  const record: JointRecord = {
    type: row.name as JointRecord['type'],
    bodyA,
    bodyB,
    localAnchorA: triple(pointToLocal(poseA, anchorA)),
    localAnchorB: triple(pointToLocal(poseB, anchorB)),
    localAxisA: axis ? triple(directionToLocal(poseA, axis)) : [0, 0, 0],
    localAxisB: axis ? triple(directionToLocal(poseB, axis)) : [0, 0, 0],
    reference: [reference[0]!, reference[1]!, reference[2]!, reference[3]!],
    collideConnected,
    stiffness: param(row, descriptor, 'stiffness')?.[0] ?? 0,
    damping: param(row, descriptor, 'damping')?.[0] ?? 0,
    restLength: param(row, descriptor, 'restLength')?.[0] ?? length(sub(anchorB, anchorA)),
  };
  const handle = world.joints.next++ as JointHandle;
  world.joints.byHandle.set(handle, record);
  wakeSlot(world, requireSlot(world.bodies, bodyA));
  wakeSlot(world, requireSlot(world.bodies, bodyB));
  return handle;
}

/** Removes a joint and wakes its bodies. */
export function removeJoint(world: World, handle: JointHandle): void {
  const record = world.joints.byHandle.get(handle);
  if (record === undefined)
    throw new RangeError(`joint handle ${handle} is not live in this world`);
  world.joints.byHandle.delete(handle);
  for (const body of [record.bodyA, record.bodyB]) {
    const slot = requireSlot(world.bodies, body);
    wakeSlot(world, slot);
  }
}

/** The stored joint, or `undefined` for a handle that is not live. */
export function getJoint(world: World, handle: JointHandle): JointRecord | undefined {
  return world.joints.byHandle.get(handle);
}

/** Removes every joint attached to `body` (used by `removeBody`). */
export function removeBodyJoints(world: World, body: BodyHandle): void {
  for (const [handle, joint] of world.joints.byHandle) {
    if (joint.bodyA === body || joint.bodyB === body) world.joints.byHandle.delete(handle);
  }
}

/** Whether a joint without `collideConnected` links the two bodies. */
export function jointExcludes(world: World, a: BodyHandle, b: BodyHandle): boolean {
  for (const joint of world.joints.byHandle.values()) {
    if (joint.collideConnected) continue;
    if ((joint.bodyA === a && joint.bodyB === b) || (joint.bodyA === b && joint.bodyB === a)) {
      return true;
    }
  }
  return false;
}
