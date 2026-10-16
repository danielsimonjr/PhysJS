/**
 * The constraint solver: projected Gauss-Seidel over velocity rows. A row is a
 * Jacobian (a linear part shared by both bodies and an angular part per body),
 * a target speed and impulse bounds. Contacts give each point a normal row
 * (impulse >= 0) and two friction rows (|impulse| <= friction x normal);
 * joints add unbounded rows from their `JOINT_TYPES` modes (`joints/rows.ts`).
 * Contact rows start from the impulses of the matching point of the last step
 * (warm start); then `SOLVER_DEFAULTS.iterations` sweeps project every row.
 * The normal row's target pushes out penetration beyond the slop (Baumgarte),
 * adds restitution above the threshold speed, and lets a gap inside the
 * contact margin close in one step (speculative contact). Materials combine by
 * their `MATERIAL_FIELDS` rule.
 *
 * Vector operations are MathTS (see `collision/vector.ts`); the allocation-free
 * kernels a solver wants are MathTS #375.
 */

import {
  BODY_FIELDS,
  BODY_TYPES,
  MATERIAL_FIELDS,
  SOLVER_DEFAULTS,
  type BodyHandle,
  type CachedImpulse,
  type CombineRule,
  type ContactManifold,
  type MaterialFieldName,
  type World,
} from '@danielsimonjr/physjs-core';
import { AXES, add, cross, dot, length, scale, sub, unit, type Vec } from '../collision/vector';
import { requireSlot } from '../world/handles';
import { readColumn } from '../world/storage';
import { worldInverseInertia } from './sample';

/** One combine function per `CombineRule`. */
export const COMBINERS: Readonly<Record<CombineRule, (a: number, b: number) => number>> =
  Object.freeze({
    geometricMean: (a: number, b: number) => Math.sqrt(a * b),
    max: (a: number, b: number) => Math.max(a, b),
  });

/** A body's velocities, pose and inverse mass properties during the solve. */
export interface SolverBody {
  readonly slot: number;
  readonly v: number[];
  readonly w: number[];
  readonly position: number[];
  readonly rotation: number[];
  readonly inverseMass: number;
  readonly inverseInertia: number[];
}

/** One velocity row: `J v = linear . (vB - vA) + angularB . wB - angularA . wA`. */
export interface Row {
  readonly a: SolverBody;
  readonly b: SolverBody;
  readonly linear: number[];
  readonly angularA: number[];
  readonly angularB: number[];
  readonly mass: number;
  readonly target: number;
  impulse: number;
}

/** The rows of one contact point: normal, then two tangents. */
interface PointRows {
  readonly position: readonly [number, number, number];
  readonly normal: Row;
  readonly tangents: [Row, Row];
  readonly friction: number;
}

const ZERO3 = (): number[] => [0, 0, 0];

/** `R I^-1 R^T x` for a solver body; zero when the body does not respond. */
const applyInverseInertia = (body: SolverBody, x: Vec): number[] =>
  body.inverseMass === 0 ? ZERO3() : worldInverseInertia(body.rotation, body.inverseInertia, x);

/** Whether a body takes impulses: dynamic and awake. */
export function responds(world: World, slot: number): boolean {
  const { fields, typeIndex } = world.bodies;
  return BODY_TYPES[typeIndex[slot]!]!.dynamic && fields.asleep[slot] === 0;
}

function solverBody(world: World, slot: number): SolverBody {
  const store = world.bodies;
  const read = (
    name: 'linearVelocity' | 'angularVelocity' | 'position' | 'rotation' | 'inverseInertia'
  ) => readColumn(store, name, slot, new Array<number>(BODY_FIELDS[name].components));
  const active = responds(world, slot);
  return {
    slot,
    v: read('linearVelocity'),
    w: read('angularVelocity'),
    position: read('position'),
    rotation: read('rotation'),
    inverseMass: active ? store.fields.inverseMass[slot]! : 0,
    inverseInertia: active ? read('inverseInertia') : ZERO3(),
  };
}

/** Current speed of a row. */
export const rowSpeed = (row: Row): number =>
  dot(row.linear, sub(row.b.v, row.a.v)) + dot(row.angularB, row.b.w) - dot(row.angularA, row.a.w);

function applyImpulse(row: Row, amount: number): void {
  if (amount === 0) return;
  const update = (body: SolverBody, angular: Vec, sign: number) => {
    if (body.inverseMass === 0) return;
    const dv = scale(row.linear, sign * amount * body.inverseMass);
    const dw = scale(applyInverseInertia(body, angular), sign * amount);
    body.v.splice(0, 3, ...add(body.v, dv));
    body.w.splice(0, 3, ...add(body.w, dw));
  };
  update(row.a, row.angularA, -1);
  update(row.b, row.angularB, 1);
}

/**
 * A row with Jacobian parts `linear`, `angularA`, `angularB`, whose target is
 * `targetOf(speed before solving)`.
 */
export function makeRow(
  a: SolverBody,
  b: SolverBody,
  linear: number[],
  angularA: number[],
  angularB: number[],
  targetOf: (speed: number) => number
): Row {
  const lin = dot(linear, linear);
  const k =
    (a.inverseMass + b.inverseMass) * lin +
    dot(angularA, applyInverseInertia(a, angularA)) +
    dot(angularB, applyInverseInertia(b, angularB));
  const row: Row = {
    a,
    b,
    linear,
    angularA,
    angularB,
    mass: k > 0 ? 1 / k : 0,
    target: 0,
    impulse: 0,
  };
  return { ...row, target: targetOf(rowSpeed(row)) };
}

/** A row along `direction` through the world point `point` (contacts, linear joint rows). */
export function pointRow(
  a: SolverBody,
  b: SolverBody,
  direction: number[],
  point: Vec,
  targetOf: (speed: number) => number
): Row {
  const rA = sub(point, a.position);
  const rB = sub(point, b.position);
  return makeRow(a, b, direction, cross(rA, direction), cross(rB, direction), targetOf);
}

/** Two unit tangents perpendicular to `n`, chosen the same way every step. */
export function tangents(n: Vec): [number[], number[]] {
  const least = AXES.reduce((p, q) => (Math.abs(dot(q, n)) < Math.abs(dot(p, n)) ? q : p));
  const t1 = unit(cross(n, least))!;
  return [t1, cross(n, t1)];
}

/** Pair cache key. */
export const pairKey = (m: { colliderA: number; colliderB: number }): string =>
  `${m.colliderA}:${m.colliderB}`;

/** The material value of a contact, combined from its colliders by the field's rule. */
function material(world: World, m: ContactManifold, name: MaterialFieldName): number {
  const { byHandle } = world.colliders;
  const rule = MATERIAL_FIELDS[name].combine;
  return COMBINERS[rule](byHandle.get(m.colliderA)![name], byHandle.get(m.colliderB)![name]);
}

/** The cached impulses of the point nearest `position`, within the warm-start radius. */
function cachedFor(previous: readonly CachedImpulse[] | undefined, position: Vec) {
  let best: CachedImpulse | undefined;
  let bestDistance = SOLVER_DEFAULTS.warmStartRadius;
  for (const c of previous ?? []) {
    const d = length(sub(c.position, position));
    if (d <= bestDistance) [best, bestDistance] = [c, d];
  }
  return best;
}

/** Builds joint rows for one step; supplied by `joints/rows.ts`. */
export type JointRowBuilder = (
  world: World,
  bodyOf: (handle: BodyHandle) => SolverBody,
  dt: number
) => Row[];

/**
 * Solves the contacts of `manifolds` and the joint rows of `jointRows` for one
 * step of `dt` seconds, and writes the new velocities of the responding bodies
 * back to the world.
 */
export function solveConstraints(
  world: World,
  manifolds: readonly ContactManifold[],
  jointRows: JointRowBuilder,
  dt: number
): void {
  const { iterations, baumgarte, slop, restitutionThreshold } = SOLVER_DEFAULTS;
  const bodies = new Map<number, SolverBody>();
  const bodyOf = (handle: BodyHandle) => {
    const slot = requireSlot(world.bodies, handle);
    let body = bodies.get(slot);
    if (body === undefined) bodies.set(slot, (body = solverBody(world, slot)));
    return body;
  };
  const cache = new Map<string, CachedImpulse[]>();
  const points: PointRows[] = [];
  for (const m of manifolds) {
    const a = bodyOf(m.bodyA);
    const b = bodyOf(m.bodyB);
    if (a.inverseMass === 0 && b.inverseMass === 0) continue;
    const friction = material(world, m, 'friction');
    const restitution = material(world, m, 'restitution');
    const normal = [...m.normal];
    const [t1, t2] = tangents(normal);
    const previous = world.solver.cache.get(pairKey(m));
    const rows = m.points.map((point): PointRows => {
      const normalTarget = (speed: number) => {
        if (point.depth < 0) return point.depth / dt;
        const bounce = speed < -restitutionThreshold ? -restitution * speed : 0;
        return Math.max(bounce, (baumgarte / dt) * Math.max(point.depth - slop, 0));
      };
      const p: PointRows = {
        position: point.position,
        normal: pointRow(a, b, normal, point.position, normalTarget),
        tangents: [
          pointRow(a, b, t1, point.position, () => 0),
          pointRow(a, b, t2, point.position, () => 0),
        ],
        friction,
      };
      const warm = cachedFor(previous, point.position);
      if (warm !== undefined) {
        p.normal.impulse = warm.normal;
        p.tangents[0].impulse = warm.tangent[0];
        p.tangents[1].impulse = warm.tangent[1];
        for (const row of [p.normal, ...p.tangents]) applyImpulse(row, row.impulse);
      }
      return p;
    });
    points.push(...rows);
    cache.set(
      pairKey(m),
      rows.map((p) => ({ position: p.position, normal: 0, tangent: [0, 0] }))
    );
  }
  const joints = jointRows(world, bodyOf, dt);
  const project = (row: Row, lo: number, hi: number) => {
    const next = Math.min(hi, Math.max(lo, row.impulse + row.mass * (row.target - rowSpeed(row))));
    applyImpulse(row, next - row.impulse);
    row.impulse = next;
  };
  for (let sweep = 0; sweep < iterations; sweep++) {
    for (const row of joints) project(row, -Infinity, Infinity);
    for (const p of points) {
      const limit = p.friction * p.normal.impulse;
      for (const t of p.tangents) project(t, -limit, limit);
      project(p.normal, 0, Infinity);
    }
  }
  // Cache this step's impulses for the next step's warm start, pair by pair.
  let i = 0;
  for (const entries of cache.values()) {
    entries.forEach((_, k) => {
      const p = points[i++]!;
      entries[k] = {
        position: p.position,
        normal: p.normal.impulse,
        tangent: [p.tangents[0].impulse, p.tangents[1].impulse],
      };
    });
  }
  world.solver.cache = cache;
  const { linearVelocity, angularVelocity } = world.bodies.fields;
  for (const body of bodies.values()) {
    if (body.inverseMass === 0) continue;
    linearVelocity.set(body.v, body.slot * BODY_FIELDS.linearVelocity.components);
    angularVelocity.set(body.w, body.slot * BODY_FIELDS.angularVelocity.components);
  }
}
