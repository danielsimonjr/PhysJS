/**
 * GJK distance and EPA penetration on the Minkowski difference `A - B` of two
 * proxy cores. GJK finds the closest points of separated cores; when the cores
 * overlap, EPA expands GJK's simplex into a polytope and finds the shallowest
 * way out. The small linear solves use MathTS `lusolve` and `det`.
 */

import { det, lusolve } from '@danielsimonjr/mathts-functions';
import { COLLISION_DEFAULTS } from '@danielsimonjr/physjs-core';
import type { Proxy } from './proxy';
import { AXES, add, cross, dot, length, neg, scale, sub, unit, type Vec } from './vector';

/** A vertex of `A - B` with the support points that made it. */
interface Vertex {
  readonly w: number[];
  readonly a: number[];
  readonly b: number[];
}

/** The result of {@link gjk}. */
export interface GjkResult {
  /** Whether the cores overlap (or touch within the tolerance). */
  readonly overlap: boolean;
  /** Closest point on core A. */
  readonly pointA: number[];
  /** Closest point on core B. */
  readonly pointB: number[];
  /** Distance between the cores; 0 on overlap. */
  readonly distance: number;
  /** The final simplex, which EPA starts from. */
  readonly simplex: readonly Vertex[];
}

/** The result of {@link epa}. */
export interface EpaResult {
  /** Unit normal from A to B. */
  readonly normal: number[];
  /** Overlap depth of the cores along `normal`. */
  readonly depth: number;
  /** Deepest point of core A inside B. */
  readonly pointA: number[];
  /** Deepest point of core B inside A. */
  readonly pointB: number[];
}

const vertex = (A: Proxy, B: Proxy, d: Vec): Vertex => {
  const a = A.support(d);
  const b = B.support(neg(d));
  return { w: sub(a, b), a, b };
};

/** `sum weights[i] * points[i]`. */
const combine = (points: readonly Vec[], weights: readonly number[]): number[] =>
  points.reduce<number[]>((acc, p, i) => add(acc, scale(p, weights[i]!)), [0, 0, 0]);

/**
 * The point of the affine hull of `points` closest to the origin, as
 * barycentric weights, or `undefined` when the points are degenerate.
 */
function affineWeights(points: readonly Vec[]): number[] | undefined {
  if (points.length === 1) return [1];
  const p0 = points[0]!;
  const edges = points.slice(1).map((p) => sub(p, p0));
  const gram = edges.map((e) => edges.map((f) => dot(e, f)));
  const scaleOf = Math.max(...gram.map((row, i) => row[i]!));
  if (!(Math.abs(det(gram) as number) > 1e-12 * scaleOf ** edges.length)) return undefined;
  const rhs = edges.map((e) => -dot(e, p0));
  const solved = (lusolve(gram, rhs) as number[][]).map((row) => row[0]!);
  return [1 - solved.reduce((s, x) => s + x, 0), ...solved];
}

/**
 * Johnson's sub-algorithm by enumeration: of every face of the simplex whose
 * closest point lies inside it, the one nearest the origin.
 */
function closestOnSimplex(simplex: readonly Vertex[]): { simplex: Vertex[]; weights: number[] } {
  let best: { simplex: Vertex[]; weights: number[]; distance: number } | undefined;
  for (let mask = 1; mask < 1 << simplex.length; mask++) {
    const subset = simplex.filter((_, i) => mask & (1 << i));
    const weights = affineWeights(subset.map((v) => v.w));
    if (weights === undefined || weights.some((x) => x < -1e-12)) continue;
    const distance = length(
      combine(
        subset.map((v) => v.w),
        weights
      )
    );
    if (best === undefined || distance < best.distance - 1e-15) {
      best = { simplex: subset, weights, distance };
    }
  }
  return best!;
}

/** GJK distance between the cores of `A` and `B`. */
export function gjk(A: Proxy, B: Proxy): GjkResult {
  const { tolerance, maxIterations } = COLLISION_DEFAULTS;
  const seed = unit(sub(B.center, A.center), tolerance) ?? [...AXES[0]!];
  let simplex: Vertex[] = [vertex(A, B, seed)];
  let weights = [1];
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const v = combine(
      simplex.map((s) => s.w),
      weights
    );
    const vv = dot(v, v);
    if (vv <= tolerance * tolerance || simplex.length === 4) {
      return { overlap: true, ...witness(simplex, weights), distance: 0, simplex };
    }
    const next = vertex(A, B, neg(v));
    const gain = vv - dot(v, next.w);
    const repeated = simplex.some((s) => length(sub(s.w, next.w)) <= tolerance);
    if (gain <= tolerance * Math.sqrt(vv) || repeated) {
      return { overlap: false, ...witness(simplex, weights), distance: Math.sqrt(vv), simplex };
    }
    ({ simplex, weights } = closestOnSimplex([...simplex, next]));
  }
  const v = combine(
    simplex.map((s) => s.w),
    weights
  );
  return { overlap: false, ...witness(simplex, weights), distance: length(v), simplex };
}

function witness(simplex: readonly Vertex[], weights: readonly number[]) {
  return {
    pointA: combine(
      simplex.map((s) => s.a),
      weights
    ),
    pointB: combine(
      simplex.map((s) => s.b),
      weights
    ),
  };
}

/** A triangle of the EPA polytope with its outward normal and offset. */
interface Face {
  readonly ids: readonly [number, number, number];
  readonly normal: number[];
  readonly offset: number;
}

/**
 * Grows a GJK simplex to a tetrahedron of `A - B` by searching along the axes
 * and the simplex's own normals. `undefined` when `A - B` is flat.
 */
function tetrahedron(A: Proxy, B: Proxy, start: readonly Vertex[]): Vertex[] | undefined {
  const { tolerance } = COLLISION_DEFAULTS;
  const verts = [...start];
  // Directions that leave the current affine hull, tried in order.
  const directions = (): number[][] => {
    if (verts.length === 1) return AXES.flatMap((axis) => [[...axis], neg(axis)]);
    if (verts.length === 2) {
      const edge = sub(verts[1]!.w, verts[0]!.w);
      return AXES.map((axis) => cross(edge, axis)).flatMap((d) => [d, neg(d)]);
    }
    const n = cross(sub(verts[1]!.w, verts[0]!.w), sub(verts[2]!.w, verts[0]!.w));
    return [n, neg(n)];
  };
  while (verts.length < 4) {
    const grown = directions()
      .filter((d) => length(d) > tolerance)
      .map((d) => vertex(A, B, d))
      .find((v) => hullDistance(verts, v.w) > tolerance);
    if (grown === undefined) return undefined;
    verts.push(grown);
  }
  return verts;
}

/** Distance from `p` to the affine hull of `verts`. */
function hullDistance(verts: readonly Vertex[], p: Vec): number {
  const shifted = verts.map((v) => sub(v.w, p));
  const weights = affineWeights(shifted);
  return weights === undefined ? 0 : length(combine(shifted, weights));
}

/** EPA from an overlapping GJK simplex; `undefined` when `A - B` is flat. */
export function epa(A: Proxy, B: Proxy, start: readonly Vertex[]): EpaResult | undefined {
  const { tolerance, maxIterations } = COLLISION_DEFAULTS;
  const verts = tetrahedron(A, B, start);
  if (verts === undefined) return undefined;
  const inside = scale(
    verts.reduce<number[]>((acc, v) => add(acc, v.w), [0, 0, 0]),
    1 / verts.length
  );
  const makeFace = (i: number, j: number, k: number): Face | undefined => {
    const [p, q, r] = [verts[i]!.w, verts[j]!.w, verts[k]!.w];
    let normal = unit(cross(sub(q, p), sub(r, p)));
    if (normal === undefined) return undefined;
    let ids: [number, number, number] = [i, j, k];
    if (dot(normal, sub(p, inside)) < 0) {
      normal = neg(normal);
      ids = [i, k, j];
    }
    return { ids, normal, offset: dot(normal, p) };
  };
  let faces = [
    [0, 1, 2],
    [0, 3, 1],
    [0, 2, 3],
    [1, 3, 2],
  ]
    .map(([i, j, k]) => makeFace(i!, j!, k!))
    .filter((f): f is Face => f !== undefined);
  let closest = faces[0]!;
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    closest = faces.reduce((a, f) => (f.offset < a.offset ? f : a));
    const next = vertex(A, B, closest.normal);
    if (dot(closest.normal, next.w) - closest.offset <= tolerance) break;
    const id = verts.push(next) - 1;
    const seen = (f: Face) => dot(f.normal, sub(next.w, verts[f.ids[0]]!.w)) > tolerance;
    const visible = faces.filter(seen);
    const edges = visible.flatMap((f) => [
      [f.ids[0], f.ids[1]],
      [f.ids[1], f.ids[2]],
      [f.ids[2], f.ids[0]],
    ]);
    const key = (a: number, b: number) => `${a},${b}`;
    const all = new Set(edges.map(([a, b]) => key(a!, b!)));
    const horizon = edges.filter(([a, b]) => !all.has(key(b!, a!)));
    faces = [
      ...faces.filter((f) => !seen(f)),
      ...horizon.map(([a, b]) => makeFace(a!, b!, id)).filter((f): f is Face => f !== undefined),
    ];
    if (faces.length === 0) return undefined;
  }
  // The origin's projection on the closest face, in that face's barycentrics.
  const corners = closest.ids.map((i) => verts[i]!);
  const weights = affineWeights(
    corners.map((v) => sub(v.w, scale(closest.normal, closest.offset)))
  ) ?? [1, 0, 0];
  return {
    normal: closest.normal,
    depth: closest.offset,
    pointA: combine(
      corners.map((v) => v.a),
      weights
    ),
    pointB: combine(
      corners.map((v) => v.b),
      weights
    ),
  };
}
