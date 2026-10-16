/**
 * Kernels of the 2-D shapes, in the 3-D embedding of a `dims: 2` world. Each
 * shape is its 3-D counterpart extruded by `COLLISION_DEFAULTS.planarHalfDepth`
 * along z: a circle is a point core (as a sphere), a capsule2d a segment core
 * (as a capsule), a rectangle a box, and a polygon a convex prism.
 */

import {
  COLLISION_DEFAULTS,
  type Capsule2dShape,
  type CircleShape,
  type PolygonShape,
  type RectangleShape,
} from '@danielsimonjr/physjs-core';
import { BOX_KERNEL, CAPSULE_KERNEL, SPHERE_KERNEL, type ShapeKernel } from './kernels';
import { cross, dot, scale, sub } from './vector';

const depth = () => COLLISION_DEFAULTS.planarHalfDepth;

const circle: ShapeKernel<CircleShape> = {
  radius: (s) => s.radius,
  support: (s, d) => SPHERE_KERNEL.support({ type: 'sphere', radius: s.radius }, d),
  feature: (s, d) => SPHERE_KERNEL.feature({ type: 'sphere', radius: s.radius }, d),
  ends: (s) => SPHERE_KERNEL.ends!({ type: 'sphere', radius: s.radius }),
  halfExtents: (s) => [s.radius, s.radius, s.radius],
  raycast: (s, o, d) => SPHERE_KERNEL.raycast({ type: 'sphere', radius: s.radius }, o, d),
};

const asCapsule = (s: Capsule2dShape) =>
  ({ type: 'capsule', radius: s.radius, halfHeight: s.halfHeight }) as const;
const capsule2d: ShapeKernel<Capsule2dShape> = {
  radius: (s) => s.radius,
  support: (s, d) => CAPSULE_KERNEL.support(asCapsule(s), d),
  feature: (s, d) => CAPSULE_KERNEL.feature(asCapsule(s), d),
  ends: (s) => CAPSULE_KERNEL.ends!(asCapsule(s)),
  halfExtents: (s) => CAPSULE_KERNEL.halfExtents(asCapsule(s)),
  raycast: (s, o, d) => CAPSULE_KERNEL.raycast(asCapsule(s), o, d),
};

const asBox = (s: RectangleShape) => {
  const [x, y] = s.halfExtents as readonly number[];
  return { type: 'box', halfExtents: [x!, y!, depth()] } as const;
};
const rectangle: ShapeKernel<RectangleShape> = {
  radius: () => 0,
  support: (s, d) => BOX_KERNEL.support(asBox(s), d),
  feature: (s, d) => BOX_KERNEL.feature(asBox(s), d),
  halfExtents: (s) => BOX_KERNEL.halfExtents(asBox(s)),
  raycast: (s, o, d) => BOX_KERNEL.raycast(asBox(s), o, d),
};

const verticesOf = (s: PolygonShape) => s.vertices as readonly (readonly number[])[];
const lift = (v: readonly number[], z: number) => [v[0]!, v[1]!, z];

const polygon: ShapeKernel<PolygonShape> = {
  radius: () => 0,
  support: (s, d) => {
    let best = verticesOf(s)[0]!;
    for (const v of verticesOf(s))
      if (v[0]! * d[0]! + v[1]! * d[1]! > best[0]! * d[0]! + best[1]! * d[1]!) best = v;
    return lift(best, d[2]! >= 0 ? depth() : -depth());
  },
  feature: (s, d) => {
    const vs = verticesOf(s);
    const h = depth();
    // The side face whose outward normal is most aligned with d, or a cap.
    let face = 0;
    let align = -Infinity;
    vs.forEach((v, i) => {
      const w = vs[(i + 1) % vs.length]!;
      const outward = [w[1]! - v[1]!, v[0]! - w[0]!, 0];
      const a = dot(outward, d) / Math.hypot(outward[0]!, outward[1]!);
      if (a > align) [face, align] = [i, a];
    });
    if (Math.abs(d[2]!) > align) return vs.map((v) => lift(v, d[2]! >= 0 ? h : -h));
    const v = vs[face]!;
    const w = vs[(face + 1) % vs.length]!;
    return [lift(v, h), lift(w, h), lift(w, -h), lift(v, -h)];
  },
  halfExtents: (s) => [
    Math.max(...verticesOf(s).map((v) => Math.abs(v[0]!))),
    Math.max(...verticesOf(s).map((v) => Math.abs(v[1]!))),
    depth(),
  ],
  raycast: (s, origin, direction) => {
    // Cyrus-Beck against the counter-clockwise edges, inside the z slab.
    if (Math.abs(origin[2]!) > depth()) return undefined;
    const vs = verticesOf(s);
    let enter = -Infinity;
    let exit = Infinity;
    let normal: number[] = [0, 0, 0];
    for (let i = 0; i < vs.length; i++) {
      const v = lift(vs[i]!, 0);
      const w = lift(vs[(i + 1) % vs.length]!, 0);
      const edge = sub(w, v);
      const outward = scale(cross(edge, [0, 0, 1]), 1 / Math.hypot(edge[0]!, edge[1]!));
      const distance = dot(outward, sub(origin, v));
      const rate = dot(outward, direction);
      if (rate === 0) {
        if (distance > 0) return undefined;
        continue;
      }
      const t = -distance / rate;
      if (rate < 0) {
        if (t > enter) [enter, normal] = [t, outward];
      } else exit = Math.min(exit, t);
    }
    if (enter > exit || exit < 0) return undefined;
    return enter < 0 ? { t: 0, normal: scale(direction, -1) } : { t: enter, normal };
  },
  check: (s) => {
    const vs = verticesOf(s);
    // Convex and counter-clockwise: every turn is to the left.
    vs.forEach((v, i) => {
      const w = vs[(i + 1) % vs.length]!;
      const u = vs[(i + 2) % vs.length]!;
      const turn = cross(lift(sub(w, v), 0), lift(sub(u, w), 0))[2]!;
      if (!(turn > 0)) {
        throw new RangeError(
          'polygon.vertices must be a convex polygon in counter-clockwise order'
        );
      }
    });
  },
};

/** One kernel per 2-D `SHAPES` type. */
export const KERNELS_2D = { circle, rectangle, capsule2d, polygon };
