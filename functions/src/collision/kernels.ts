/**
 * Shape kernels: the collision behaviour of each `SHAPES` row, in the shape's
 * local frame. The type requires one kernel per catalog type, so adding a shape
 * means adding a catalog row and a kernel row (`shape-kernels.ts`). Each kernel describes the
 * shape's collision core (its `SHAPES` `core`) and the radius swept around it.
 */

import { segmentSegmentClosest } from '@danielsimonjr/mathts-functions';
import {
  COLLISION_DEFAULTS,
  type BoxShape,
  type CapsuleShape,
  type ShapeDescriptor,
  type SphereShape,
} from '@danielsimonjr/physjs-core';
import { AXES, add, dot, length, scale, sub, unit, type Vec } from './vector';

/** A local-frame ray hit. */
export interface LocalHit {
  /** Distance along the unit ray direction. */
  readonly t: number;
  /** Unit outward normal at the hit; `-direction` when the ray starts inside. */
  readonly normal: number[];
}

/** Collision behaviour of one shape type, local frame. */
export interface ShapeKernel<S extends ShapeDescriptor> {
  /** Radius swept around the core. */
  radius(shape: S): number;
  /** The core point farthest along `d`. */
  support(shape: S, d: Vec): number[];
  /**
   * The core feature facing `d`: one point, a segment's two ends, or a face's
   * corners in order around the face. Used to clip contact manifolds.
   */
  feature(shape: S, d: Vec): number[][];
  /** Ends of an analytic (point or segment) core; a point repeats itself. */
  ends?(shape: S): [number[], number[]];
  /** Half the size of the local bounding box, radius included. */
  halfExtents(shape: S): number[];
  /** The first hit of the ray `origin + t direction`, `t >= 0`, with `direction` unit. */
  raycast(shape: S, origin: Vec, direction: Vec): LocalHit | undefined;
  /** Extra checks beyond the parameter rules (a polygon must be convex); throws. */
  check?(shape: S): void;
}

const ORIGIN: Vec = [0, 0, 0];

/** First hit of a ray on a ball, or `undefined`. */
function raySphere(origin: Vec, direction: Vec, center: Vec, radius: number): LocalHit | undefined {
  const rel = sub(origin, center);
  const c = dot(rel, rel) - radius * radius;
  if (c <= 0) return { t: 0, normal: scale(direction, -1) };
  const b = dot(rel, direction);
  const disc = b * b - c;
  if (b > 0 || disc < 0) return undefined;
  const t = -b - Math.sqrt(disc);
  return { t, normal: scale(add(rel, scale(direction, t)), 1 / radius) };
}

const halfExtentsOf = (shape: BoxShape): readonly number[] => shape.halfExtents as number[];

/** The nearest of several optional hits. */
function nearest(hits: readonly (LocalHit | undefined)[]): LocalHit | undefined {
  let best: LocalHit | undefined;
  for (const hit of hits)
    if (hit !== undefined && (best === undefined || hit.t < best.t)) best = hit;
  return best;
}

const sphere: ShapeKernel<SphereShape> = {
  radius: (shape) => shape.radius,
  support: () => [...ORIGIN],
  feature: () => [[...ORIGIN]],
  ends: () => [[...ORIGIN], [...ORIGIN]],
  halfExtents: (shape) => [shape.radius, shape.radius, shape.radius],
  raycast: (shape, origin, direction) => raySphere(origin, direction, ORIGIN, shape.radius),
};

/** The capsule axis is local +Y (`AXES[1]`). */
const CAPSULE_AXIS = 1;
const capsuleEnd = (shape: CapsuleShape, sign: number): number[] =>
  scale(AXES[CAPSULE_AXIS]!, sign * shape.halfHeight);

const capsule: ShapeKernel<CapsuleShape> = {
  radius: (shape) => shape.radius,
  support: (shape, d) => capsuleEnd(shape, d[CAPSULE_AXIS]! >= 0 ? 1 : -1),
  feature: (shape, d) =>
    Math.abs(d[CAPSULE_AXIS]!) <= COLLISION_DEFAULTS.featureAlignment * length(d)
      ? [capsuleEnd(shape, -1), capsuleEnd(shape, 1)]
      : [capsuleEnd(shape, d[CAPSULE_AXIS]! >= 0 ? 1 : -1)],
  ends: (shape) => [capsuleEnd(shape, -1), capsuleEnd(shape, 1)],
  halfExtents: (shape) =>
    AXES.map((_, k) => shape.radius + (k === CAPSULE_AXIS ? shape.halfHeight : 0)),
  raycast: (shape, origin, direction) => {
    const { radius, halfHeight } = shape;
    const inside = segmentSegmentClosest(
      [...origin],
      [...origin],
      capsuleEnd(shape, -1),
      capsuleEnd(shape, 1)
    );
    if (inside.distance <= radius) return { t: 0, normal: scale(direction, -1) };
    // The side: the ray against the infinite cylinder, kept between the caps.
    const flat = (v: Vec) => v.map((x, k) => (k === CAPSULE_AXIS ? 0 : x));
    const o = flat(origin);
    const d = flat(direction);
    const a = dot(d, d);
    let side: LocalHit | undefined;
    if (a > 0) {
      const b = dot(o, d);
      const c = dot(o, o) - radius * radius;
      const disc = b * b - a * c;
      const t = (-b - Math.sqrt(Math.max(disc, 0))) / a;
      const along = origin[CAPSULE_AXIS]! + t * direction[CAPSULE_AXIS]!;
      if (disc >= 0 && t >= 0 && Math.abs(along) <= halfHeight) {
        side = { t, normal: unit(add(o, scale(d, t)))! };
      }
    }
    return nearest([
      side,
      raySphere(origin, direction, capsuleEnd(shape, -1), radius),
      raySphere(origin, direction, capsuleEnd(shape, 1), radius),
    ]);
  },
};

const box: ShapeKernel<BoxShape> = {
  radius: () => 0,
  support: (shape, d) => halfExtentsOf(shape).map((h, k) => (d[k]! >= 0 ? h : -h)),
  feature: (shape, d) => {
    const he = halfExtentsOf(shape);
    // The face whose normal is closest to d; its corners go round the face.
    let axis = 0;
    for (let k = 1; k < 3; k++) if (Math.abs(d[k]!) > Math.abs(d[axis]!)) axis = k;
    const [u, v] = [(axis + 1) % 3, (axis + 2) % 3];
    return [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ].map(([su, sv]) => {
      const corner = [0, 0, 0];
      corner[axis] = d[axis]! >= 0 ? he[axis]! : -he[axis]!;
      corner[u] = su! * he[u]!;
      corner[v] = sv! * he[v]!;
      return corner;
    });
  },
  halfExtents: (shape) => [...halfExtentsOf(shape)],
  raycast: (shape, origin, direction) => {
    // Slabs: the ray enters the box at the last entry and leaves at the first exit.
    const he = halfExtentsOf(shape);
    let enter = -Infinity;
    let exit = Infinity;
    let normal: number[] = [0, 0, 0];
    for (let k = 0; k < 3; k++) {
      const o = origin[k]!;
      const d = direction[k]!;
      if (d === 0) {
        if (Math.abs(o) > he[k]!) return undefined;
        continue;
      }
      const near = (-Math.sign(d) * he[k]! - o) / d;
      const far = (Math.sign(d) * he[k]! - o) / d;
      if (near > enter) {
        enter = near;
        normal = [0, 0, 0];
        normal[k] = -Math.sign(d);
      }
      exit = Math.min(exit, far);
    }
    if (enter > exit || exit < 0) return undefined;
    return enter < 0 ? { t: 0, normal: scale(direction, -1) } : { t: enter, normal };
  },
};

/** The 3-D kernels, also the building blocks of the 2-D ones (`kernels2d.ts`). */
export const SPHERE_KERNEL = sphere;
export const CAPSULE_KERNEL = capsule;
export const BOX_KERNEL = box;
