/**
 * The contact solver: projected Gauss-Seidel over velocity constraint rows.
 * Each contact point gives one normal row (impulse >= 0) and two friction rows
 * (|impulse| <= friction x normal impulse). Rows start from the impulses of the
 * matching point of the last step (warm start), then `SOLVER_DEFAULTS.iterations`
 * sweeps project each row in turn. The normal row's target speed pushes out
 * penetration beyond the slop (Baumgarte), adds restitution above the
 * threshold speed, and lets a gap inside the contact margin close in one step
 * (speculative contact). Materials combine by their `MATERIAL_FIELDS` rule.
 *
 * Vector operations are MathTS (see `collision/vector.ts`); the allocation-free
 * kernels a solver wants are MathTS #375.
 */

import {
  BODY_FIELDS,
  BODY_TYPES,
  MATERIAL_FIELDS,
  SOLVER_DEFAULTS,
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

/** A body's velocities and inverse mass properties during the solve. */
interface SolverBody {
  readonly slot: number;
  readonly v: number[];
  readonly w: number[];
  readonly position: number[];
  readonly rotation: number[];
  readonly inverseMass: number;
  readonly inverseInertia: number[];
}

/** One velocity constraint row. */
interface Row {
  readonly a: SolverBody;
  readonly b: SolverBody;
  readonly direction: number[];
  readonly rA: number[];
  readonly rB: number[];
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

/** Velocity of the material point at offset `r` of a body. */
const pointVelocity = (body: SolverBody, r: Vec): number[] => add(body.v, cross(body.w, r));

/** Relative velocity of B against A along `direction` at the row's points. */
const rowSpeed = (row: Row): number =>
  dot(row.direction, sub(pointVelocity(row.b, row.rB), pointVelocity(row.a, row.rA)));

function applyImpulse(row: Row, amount: number): void {
  if (amount === 0) return;
  const p = scale(row.direction, amount);
  const { a, b } = row;
  const update = (body: SolverBody, r: Vec, sign: number) => {
    if (body.inverseMass === 0) return;
    const dv = scale(p, sign * body.inverseMass);
    const dw = scale(applyInverseInertia(body, cross(r, p)), sign);
    body.v.splice(0, 3, ...add(body.v, dv));
    body.w.splice(0, 3, ...add(body.w, dw));
  };
  update(a, row.rA, -1);
  update(b, row.rB, 1);
}

function makeRow(
  a: SolverBody,
  b: SolverBody,
  direction: number[],
  point: Vec,
  targetOf: (speed: number) => number
): Row {
  const rA = sub(point, a.position);
  const rB = sub(point, b.position);
  const angular = (body: SolverBody, r: Vec) => {
    const rd = cross(r, direction);
    return dot(rd, applyInverseInertia(body, rd));
  };
  const k = a.inverseMass + b.inverseMass + angular(a, rA) + angular(b, rB);
  const row: Row = { a, b, direction, rA, rB, mass: k > 0 ? 1 / k : 0, target: 0, impulse: 0 };
  return { ...row, target: targetOf(rowSpeed(row)) };
}

/** Two unit tangents perpendicular to `n`, chosen the same way every step. */
function tangents(n: Vec): [number[], number[]] {
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

/**
 * Solves the contacts of `manifolds` for one step of `dt` seconds and writes
 * the new velocities of the responding bodies back to the world.
 */
export function solveContacts(
  world: World,
  manifolds: readonly ContactManifold[],
  dt: number
): void {
  const { iterations, baumgarte, slop, restitutionThreshold } = SOLVER_DEFAULTS;
  const bodies = new Map<number, SolverBody>();
  const bodyOf = (handle: Parameters<typeof requireSlot>[1]) => {
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
    for (const point of m.points) {
      const normalTarget = (speed: number) => {
        if (point.depth < 0) return point.depth / dt;
        const bounce = speed < -restitutionThreshold ? -restitution * speed : 0;
        return Math.max(bounce, (baumgarte / dt) * Math.max(point.depth - slop, 0));
      };
      const rows: PointRows = {
        position: point.position,
        normal: makeRow(a, b, normal, point.position, normalTarget),
        tangents: [
          makeRow(a, b, t1, point.position, () => 0),
          makeRow(a, b, t2, point.position, () => 0),
        ],
        friction,
      };
      const warm = cachedFor(previous, point.position);
      if (warm !== undefined) {
        rows.normal.impulse = warm.normal;
        rows.tangents[0].impulse = warm.tangent[0];
        rows.tangents[1].impulse = warm.tangent[1];
        for (const row of [rows.normal, ...rows.tangents]) applyImpulse(row, row.impulse);
      }
      points.push(rows);
    }
  }
  const project = (row: Row, lo: number, hi: number) => {
    const next = Math.min(hi, Math.max(lo, row.impulse + row.mass * (row.target - rowSpeed(row))));
    applyImpulse(row, next - row.impulse);
    row.impulse = next;
  };
  for (let sweep = 0; sweep < iterations; sweep++) {
    for (const p of points) {
      const limit = p.friction * p.normal.impulse;
      for (const t of p.tangents) project(t, -limit, limit);
      project(p.normal, 0, Infinity);
    }
  }
  // Cache this step's impulses for the next step's warm start.
  let i = 0;
  for (const m of manifolds) {
    const a = bodies.get(requireSlot(world.bodies, m.bodyA))!;
    const b = bodies.get(requireSlot(world.bodies, m.bodyB))!;
    if (a.inverseMass === 0 && b.inverseMass === 0) continue;
    cache.set(
      pairKey(m),
      m.points.map(() => {
        const p = points[i++]!;
        return {
          position: p.position,
          normal: p.normal.impulse,
          tangent: [p.tangents[0].impulse, p.tangents[1].impulse],
        };
      })
    );
  }
  world.solver.cache = cache;
  const { linearVelocity, angularVelocity } = world.bodies.fields;
  for (const body of bodies.values()) {
    if (body.inverseMass === 0) continue;
    linearVelocity.set(body.v, body.slot * BODY_FIELDS.linearVelocity.components);
    angularVelocity.set(body.w, body.slot * BODY_FIELDS.angularVelocity.components);
  }
}
