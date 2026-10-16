/**
 * Scene queries: `raycast`, `overlap` and `pointQuery`. Each tests the
 * colliders whose bounding boxes pass, in handle order, through the same
 * kernels and narrowphase as `findContacts`.
 */

import type {
  ColliderHandle,
  NumericInput,
  RayHit,
  ShapeDescriptor,
  World,
} from '@danielsimonjr/physjs-core';
import { BODY_FIELDS } from '@danielsimonjr/physjs-core';
import { readValue } from '../world/validate';
import { aabbOverlap, colliderAabb, poseAabb } from './broadphase';
import { colliderProxy } from './contacts';
import { kernelOf } from './kernels';
import { proximity } from './narrowphase';
import { bodyPose, directionToLocal, directionToWorld, makePose, pointToLocal } from './pose';
import { pointProxy, shapeProxy, type Proxy } from './proxy';
import { copyShape } from '../world/colliders';
import { validateShape } from './shapes';
import { add, scale, unit } from './vector';

const triple = (v: readonly number[]): [number, number, number] => [v[0]!, v[1]!, v[2]!];
const readPoint = (label: string, value: NumericInput) =>
  readValue(label, value, { components: 3, rule: 'finite' });

/** The ray's entry distance into a box, or `undefined` when it misses within `limit`. */
function rayAabb(
  origin: number[],
  direction: number[],
  box: ReturnType<typeof colliderAabb>,
  limit: number
) {
  let enter = 0;
  let exit = limit;
  for (let k = 0; k < 3; k++) {
    const d = direction[k]!;
    if (d === 0) {
      if (origin[k]! < box.min[k]! || origin[k]! > box.max[k]!) return undefined;
      continue;
    }
    const lo = (box.min[k]! - origin[k]!) / d;
    const hi = (box.max[k]! - origin[k]!) / d;
    enter = Math.max(enter, Math.min(lo, hi));
    exit = Math.min(exit, Math.max(lo, hi));
  }
  return enter <= exit ? enter : undefined;
}

/**
 * The nearest collider hit by the ray from `origin` along `direction`, within
 * `maxDistance` metres, or `undefined`. A ray starting inside a collider hits
 * it at distance 0 with the normal `-direction`.
 *
 * ```ts
 * raycast(world, [0, 10, 0], [0, -1, 0]); // { collider, body, distance: 8.5, point, normal: [0, 1, 0] }
 * ```
 */
export function raycast(
  world: World,
  origin: NumericInput,
  direction: NumericInput,
  maxDistance = Infinity
): RayHit | undefined {
  const o = readPoint('origin', origin);
  const d = unit(readPoint('direction', direction));
  if (d === undefined) throw new RangeError('direction must not be the zero vector');
  readValue('maxDistance', maxDistance, {
    components: 1,
    scalar: true,
    rule: 'positiveOrInfinite',
  });
  let best: RayHit | undefined;
  for (const [handle, collider] of [...world.colliders.byHandle].sort((p, q) => p[0] - q[0])) {
    const limit = best?.distance ?? maxDistance;
    if (rayAabb(o, d, colliderAabb(world, collider), limit) === undefined) continue;
    const pose = bodyPose(world, collider.body);
    const hit = kernelOf(collider.shape).raycast(
      collider.shape,
      pointToLocal(pose, o),
      directionToLocal(pose, d)
    );
    if (hit === undefined || hit.t > limit || (best !== undefined && hit.t >= best.distance)) {
      continue;
    }
    best = {
      collider: handle,
      body: collider.body,
      distance: hit.t,
      point: triple(add(o, scale(d, hit.t))),
      normal: triple(directionToWorld(pose, hit.normal)),
    };
  }
  return best;
}

/** Colliders overlapping `probe`, whose bounding box is `box`, in handle order. */
function touching(
  world: World,
  probe: Proxy,
  box: ReturnType<typeof colliderAabb>
): ColliderHandle[] {
  return [...world.colliders.byHandle]
    .filter(([, collider]) => aabbOverlap(colliderAabb(world, collider), box))
    .filter(([, collider]) => proximity(probe, colliderProxy(world, collider)).separation <= 0)
    .map(([handle]) => handle)
    .sort((a, b) => a - b);
}

/**
 * Colliders that overlap or touch `shape` placed at `position` with `rotation`
 * (a `[w, x, y, z]` quaternion, normalized), in handle order.
 *
 * ```ts
 * overlap(world, { type: 'sphere', radius: 1 }, [0, 0, 0]); // [handles...]
 * ```
 */
export function overlap(
  world: World,
  shape: ShapeDescriptor,
  position: NumericInput,
  rotation: NumericInput = BODY_FIELDS.rotation.initial
): ColliderHandle[] {
  validateShape(shape);
  const local = copyShape(shape);
  const pose = makePose(
    readPoint('position', position),
    readValue('rotation', rotation, { components: 4, rule: 'finite' })
  );
  const box = poseAabb(pose, kernelOf(local).halfExtents(local), 0);
  return touching(world, shapeProxy(local, pose), box);
}

/** Colliders containing `point` (boundary included), in handle order. */
export function pointQuery(world: World, point: NumericInput): ColliderHandle[] {
  const p = readPoint('point', point);
  const at = triple(p);
  return touching(world, pointProxy(p), { min: at, max: at });
}
