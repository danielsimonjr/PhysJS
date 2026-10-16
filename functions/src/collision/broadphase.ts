/**
 * Broadphase: sweep-and-prune on world-frame bounding boxes. Colliders are
 * sorted by their lower bound on the axis where their centres spread most;
 * the order is kept in `world.broadphase`, so the insertion sort of the next
 * call starts nearly sorted. Pairs whose boxes overlap on all three axes are
 * reported, except pairs on one body, pairs with no dynamic body and pairs
 * linked by a joint without `collideConnected`.
 */

import {
  BODY_TYPES,
  type Aabb,
  type ColliderHandle,
  type ColliderRecord,
  type World,
} from '@danielsimonjr/physjs-core';
import { jointExcludes } from '../joints/joints';
import { requireSlot } from '../world/handles';
import { kernelOf } from './shape-kernels';
import { bodyPose, type Pose } from './pose';

/** The world bounding box of `shape`'s local box with half sizes `half` at `pose`, grown by `margin`. */
export function poseAabb(pose: Pose, half: readonly number[], margin: number): Aabb {
  // Each world half size is the local half sizes through |R|.
  const extent = pose.matrix.map(
    (row) => row.reduce((s, r, k) => s + Math.abs(r) * half[k]!, 0) + margin
  );
  const at = (sign: number) =>
    pose.position.map((p, k) => p + sign * extent[k]!) as unknown as [number, number, number];
  return { min: at(-1), max: at(1) };
}

/** The world bounding box of a collider, grown by `margin`. */
export function colliderAabb(world: World, collider: ColliderRecord, margin = 0): Aabb {
  return poseAabb(
    bodyPose(world, collider.body),
    kernelOf(collider.shape).halfExtents(collider.shape),
    margin
  );
}

/** Whether two boxes overlap (touching counts). */
export const aabbOverlap = (a: Aabb, b: Aabb): boolean =>
  a.min.every((lo, k) => lo <= b.max[k]! && b.min[k]! <= a.max[k]!);

/** The axis along which the box centres spread most. */
function sweepAxis(boxes: readonly Aabb[]): number {
  const spread = [0, 1, 2].map((k) => {
    const centres = boxes.map((b) => (b.min[k]! + b.max[k]!) / 2);
    const mean = centres.reduce((s, c) => s + c, 0) / Math.max(1, centres.length);
    return centres.reduce((s, c) => s + (c - mean) ** 2, 0);
  });
  return spread.indexOf(Math.max(...spread));
}

/**
 * Candidate collider pairs, each `[lower handle, higher handle]`, sorted.
 * Boxes are grown by `margin` so pairs within the contact margin are found.
 */
export function sweepAndPrune(world: World, margin: number): [ColliderHandle, ColliderHandle][] {
  const { byHandle } = world.colliders;
  const known = new Set(world.broadphase.order);
  const order = [
    ...world.broadphase.order.filter((h) => byHandle.has(h)),
    ...[...byHandle.keys()].filter((h) => !known.has(h)).sort((a, b) => a - b),
  ];
  const boxes = new Map(order.map((h) => [h, colliderAabb(world, byHandle.get(h)!, margin)]));
  const axis = sweepAxis([...boxes.values()]);
  const low = (h: ColliderHandle) => boxes.get(h)!.min[axis]!;
  // Insertion sort: linear on the nearly sorted order of the last call.
  for (let i = 1; i < order.length; i++) {
    const h = order[i]!;
    let j = i - 1;
    for (; j >= 0 && low(order[j]!) > low(h); j--) order[j + 1] = order[j]!;
    order[j + 1] = h;
  }
  world.broadphase.order = order;
  const dynamic = (h: ColliderHandle) => {
    const slot = requireSlot(world.bodies, byHandle.get(h)!.body);
    return BODY_TYPES[world.bodies.typeIndex[slot]!]!.dynamic;
  };
  const pairs: [ColliderHandle, ColliderHandle][] = [];
  let active: ColliderHandle[] = [];
  for (const h of order) {
    const box = boxes.get(h)!;
    active = active.filter((a) => boxes.get(a)!.max[axis]! >= box.min[axis]!);
    for (const a of active) {
      if (byHandle.get(a)!.body === byHandle.get(h)!.body) continue;
      if (!dynamic(a) && !dynamic(h)) continue;
      if (jointExcludes(world, byHandle.get(a)!.body, byHandle.get(h)!.body)) continue;
      if (aabbOverlap(boxes.get(a)!, box)) pairs.push(a < h ? [a, h] : [h, a]);
    }
    active.push(h);
  }
  return pairs.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
}
