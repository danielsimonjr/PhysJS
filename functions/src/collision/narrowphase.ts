/**
 * Narrowphase: the separation of two proxies and their contact manifold. The
 * algorithm comes from the cores' `COLLISION_CORES` rows: two analytic cores
 * use MathTS `segmentSegmentClosest`, anything else GJK and, on overlap, EPA.
 * The radii are added afterwards, so every shape is a core swept by a radius.
 */

import { segmentSegmentClosest } from '@danielsimonjr/mathts-functions';
import { COLLISION_DEFAULTS, type ContactPoint } from '@danielsimonjr/physjs-core';
import { epa, gjk } from './gjk';
import { isAnalytic, type Proxy } from './proxy';
import { AXES, add, cross, dot, length, neg, scale, sub, unit, type Vec } from './vector';

/** How two proxies sit relative to each other. */
export interface Proximity {
  /** Gap between the surfaces, metres; negative when they overlap. */
  readonly separation: number;
  /** Unit normal from A to B. */
  readonly normal: number[];
  /** Point of A's surface nearest B (deepest in B on overlap). */
  readonly pointA: number[];
  /** Point of B's surface nearest A. */
  readonly pointB: number[];
}

/** A normal for coincident cores: centre to centre, else across A's segment, else +Y. */
function fallbackNormal(A: Proxy, B: Proxy): number[] {
  const { tolerance } = COLLISION_DEFAULTS;
  const across = A.ends && sub(A.ends[1], A.ends[0]);
  const perpendicular =
    across && AXES.map((axis) => unit(cross(across, axis), tolerance)).find((d) => d !== undefined);
  return unit(sub(B.center, A.center), tolerance) ?? perpendicular ?? [...AXES[1]!];
}

/** Core separation by closest points between segments (points are degenerate segments). */
function analyticCores(A: Proxy, B: Proxy) {
  const [a0, a1] = A.ends!;
  const [b0, b1] = B.ends!;
  const closest = segmentSegmentClosest(a0, a1, b0, b1);
  const normal =
    unit(sub(closest.point2, closest.point1), COLLISION_DEFAULTS.tolerance) ?? fallbackNormal(A, B);
  return { gap: closest.distance, normal, coreA: closest.point1, coreB: closest.point2 };
}

/** Core separation by GJK, or minus the EPA depth when the cores overlap. */
function supportCores(A: Proxy, B: Proxy) {
  const result = gjk(A, B);
  if (!result.overlap) {
    const normal =
      unit(sub(result.pointB, result.pointA), COLLISION_DEFAULTS.tolerance) ?? fallbackNormal(A, B);
    return { gap: result.distance, normal, coreA: result.pointA, coreB: result.pointB };
  }
  const deep = epa(A, B, result.simplex);
  if (deep === undefined) {
    return { gap: 0, normal: fallbackNormal(A, B), coreA: result.pointA, coreB: result.pointB };
  }
  return { gap: -deep.depth, normal: deep.normal, coreA: deep.pointA, coreB: deep.pointB };
}

/** Separation, normal and surface points of two proxies. */
export function proximity(A: Proxy, B: Proxy): Proximity {
  const cores = isAnalytic(A.core) && isAnalytic(B.core) ? analyticCores(A, B) : supportCores(A, B);
  const { normal } = cores;
  return {
    separation: cores.gap - A.radius - B.radius,
    normal,
    pointA: add(cores.coreA, scale(normal, A.radius)),
    pointB: sub(cores.coreB, scale(normal, B.radius)),
  };
}

/**
 * Keeps the points of a polyline (closed when it has three or more points) on
 * the side of the plane through `origin` that `inward` points to.
 */
function clip(points: readonly number[][], origin: Vec, inward: Vec): number[][] {
  const side = (p: Vec) => dot(sub(p, origin), inward);
  const cut = (p: number[], q: number[]) => {
    const [sp, sq] = [side(p), side(q)];
    return add(p, scale(sub(q, p), sp / (sp - sq)));
  };
  if (points.length === 1) return side(points[0]!) >= 0 ? [points[0]!] : [];
  if (points.length === 2) {
    const [p, q] = points as [number[], number[]];
    const [pIn, qIn] = [side(p) >= 0, side(q) >= 0];
    if (pIn && qIn) return [p, q];
    if (pIn) return [p, cut(p, q)];
    return qIn ? [cut(p, q), q] : [];
  }
  // Sutherland-Hodgman over the closed polygon.
  const out: number[][] = [];
  points.forEach((q, i) => {
    const p = points[(i + points.length - 1) % points.length]!;
    const [pIn, qIn] = [side(p) >= 0, side(q) >= 0];
    if (pIn !== qIn) out.push(cut(p, q));
    if (qIn) out.push(q);
  });
  return out;
}

/** Side planes of a reference feature: a face's edges, or a segment's two ends. */
function sidePlanes(reference: readonly number[][], normal: Vec): [number[], number[]][] {
  if (reference.length === 2) {
    const along = sub(reference[1]!, reference[0]!);
    return [
      [reference[0]!, along],
      [reference[1]!, neg(along)],
    ];
  }
  const centroid = scale(
    reference.reduce<number[]>((acc, p) => add(acc, p), [0, 0, 0]),
    1 / reference.length
  );
  return reference.map((p, i) => {
    const q = reference[(i + 1) % reference.length]!;
    const inward = cross(normal, sub(q, p));
    return [p, dot(inward, sub(centroid, p)) >= 0 ? inward : neg(inward)];
  });
}

/** Keeps `count` points: the deepest, then each time the one farthest from those kept. */
function reduce(points: ContactPoint[], count: number): ContactPoint[] {
  const sorted = [...points].sort((a, b) => b.depth - a.depth);
  if (sorted.length <= count) return sorted;
  const kept = [sorted.shift()!];
  while (kept.length < count) {
    const spread = (p: ContactPoint) =>
      Math.min(...kept.map((k) => length(sub(p.position, k.position))));
    const next = sorted.reduce((a, b) => (spread(b) > spread(a) ? b : a));
    kept.push(next);
    sorted.splice(sorted.indexOf(next), 1);
  }
  return kept.sort((a, b) => b.depth - a.depth);
}

const toPoint = (p: Vec, depth: number): ContactPoint => ({
  position: [p[0]!, p[1]!, p[2]!],
  depth,
});

/**
 * Contact points of two proxies within `margin`: the incident feature clipped
 * against the reference feature's side planes (the feature with more points is
 * the reference). Falls back to the single closest-point pair.
 */
export function manifoldPoints(
  A: Proxy,
  B: Proxy,
  near: Proximity,
  margin: number
): ContactPoint[] {
  const { normal } = near;
  const featureA = A.feature(normal);
  const featureB = B.feature(neg(normal));
  const referenceIsA = featureA.length >= featureB.length;
  const [ref, inc] = referenceIsA ? [featureA, featureB] : [featureB, featureA];
  const [refProxy, incProxy] = referenceIsA ? [A, B] : [B, A];
  const toward = referenceIsA ? normal : neg(normal);
  const points: ContactPoint[] = [];
  if (ref.length > 1) {
    // A face clips and measures along its own normal; a segment along the contact normal.
    const faceNormal =
      ref.length > 2 ? unit(cross(sub(ref[1]!, ref[0]!), sub(ref[2]!, ref[0]!))) : undefined;
    const plane =
      faceNormal === undefined
        ? toward
        : dot(faceNormal, toward) < 0
          ? neg(faceNormal)
          : faceNormal;
    const clipped = sidePlanes(ref, plane).reduce(
      (poly, [origin, inward]) => clip(poly, origin, inward),
      inc
    );
    for (const q of clipped) {
      const gap = dot(sub(q, ref[0]!), plane) - refProxy.radius - incProxy.radius;
      if (gap <= margin)
        points.push(toPoint(sub(q, scale(plane, incProxy.radius + gap / 2)), -gap));
    }
  }
  if (points.length === 0) {
    points.push(toPoint(scale(add(near.pointA, near.pointB), 0.5), -near.separation));
  }
  return reduce(points, COLLISION_DEFAULTS.maxManifoldPoints);
}
