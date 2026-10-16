/**
 * 2-D worlds on the 3-D engine. A `dims: 2` world is the plane z = 0 of the
 * same engine: every `BODY_FIELDS` row names its `planar` view, and that view
 * turns the 2-D form callers use into the stored 3-D form and back. Positions
 * and forces are `[x, y]`, angular velocity and torque the scalar z component,
 * rotation the angle about +z, and inertia the scalar moment about z (the
 * other two axes are locked by infinite inertia). 2-D shapes are extruded by
 * `COLLISION_DEFAULTS.planarHalfDepth` and contacts are flattened onto the
 * plane, so nothing leaves it.
 */

import { quaternionFromAxisAngle, quaternionLog } from '@danielsimonjr/mathts-functions';
import {
  BODY_FIELDS,
  type BodyFieldName,
  type NumericInput,
  type PlanarView,
  type ValueRule,
  type World,
} from '@danielsimonjr/physjs-core';
import { readValue, type ValueSchema } from './validate';

/** How one planar view reads, lifts and projects a field. */
export interface PlanarViewFns {
  /** Schema of the 2-D form, from the 3-D field's rule. */
  schema(rule: ValueRule): ValueSchema;
  /** 2-D numbers to the stored 3-D numbers. */
  lift(values: readonly number[]): number[];
  /** Stored 3-D numbers to the 2-D numbers. */
  project(values: readonly number[]): number[];
}

const Z_AXIS = [0, 0, 1];
type Axis = Parameters<typeof quaternionFromAxisAngle>[0];
type Quat = Parameters<typeof quaternionLog>[0];

/** Angle about +z of a rotation about +z, in (-pi, pi]. */
function angleOf(q: readonly number[]): number {
  const log = quaternionLog(q as unknown as Quat) as unknown as number[];
  const angle = 2 * log[3]!;
  return angle - 2 * Math.PI * Math.round(angle / (2 * Math.PI));
}

/** One set of functions per `PlanarView`. */
export const PLANAR_VIEWS: Readonly<Record<PlanarView, PlanarViewFns>> = Object.freeze({
  same: {
    schema: () => {
      throw new Error('a same-view field keeps its own schema');
    },
    lift: (v) => [...v],
    project: (v) => [...v],
  },
  vector: {
    schema: (rule) => ({ components: 2, rule }),
    lift: (v) => [v[0]!, v[1]!, 0],
    project: (v) => [v[0]!, v[1]!],
  },
  axial: {
    schema: (rule) => ({ components: 1, rule }),
    lift: (v) => [0, 0, v[0]!],
    project: (v) => [v[2]!],
  },
  angle: {
    schema: (): ValueSchema => ({ components: 1, rule: 'finite' }),
    lift: (v) => quaternionFromAxisAngle(Z_AXIS as unknown as Axis, v[0]!) as unknown as number[],
    project: (v) => [angleOf(v)],
  },
  moment: {
    schema: (rule) => ({ components: 1, rule }),
    lift: (v) => [Infinity, Infinity, v[0]!],
    project: (v) => [v[2]!],
  },
});

/** Whether `world` is a 2-D world. */
export const isPlanar = (world: World): boolean => world.dims === 2;

/**
 * Reads a value that is a 3-vector in 3-D and through `view` in 2-D, and
 * returns its stored 3-D numbers.
 */
export function readWorldValue(
  world: World,
  label: string,
  value: unknown,
  schema: ValueSchema,
  view: PlanarView
): number[] {
  if (!isPlanar(world) || view === 'same') return readValue(label, value, schema);
  const fns = PLANAR_VIEWS[view];
  return fns.lift(readValue(label, value, fns.schema(schema.rule)));
}

/** A world point or direction: `[x, y, z]` in 3-D, `[x, y]` in 2-D. */
export const readWorldVector = (world: World, label: string, value: NumericInput): number[] =>
  readWorldValue(world, label, value, { components: 3, rule: 'finite' }, 'vector');

/** A rotation: a quaternion `[w, x, y, z]` in 3-D, `[angle]` about +z in 2-D. */
export const readWorldRotation = (world: World, label: string, value: NumericInput) =>
  readWorldValue(world, label, value, { components: 4, rule: 'finite' }, 'angle');

/** Body fields a 2-D world keeps in the plane after every step (inertia stays as set). */
const FLATTENED = (Object.keys(BODY_FIELDS) as BodyFieldName[]).filter((name) =>
  ['vector', 'axial', 'angle'].includes(BODY_FIELDS[name].planar)
);

/**
 * Projects every live body of a 2-D world back onto the plane, removing the
 * rounding drift the 3-D solver can leave out of plane. No-op in 3-D.
 */
export function flattenBodies(world: World): void {
  if (!isPlanar(world)) return;
  const store = world.bodies;
  for (const name of FLATTENED) {
    const { components } = BODY_FIELDS[name];
    const view = PLANAR_VIEWS[BODY_FIELDS[name].planar];
    const column = store.fields[name];
    for (let slot = 0; slot < store.size; slot++) {
      if (store.alive[slot] !== 1) continue;
      const at = slot * components;
      column.set(view.lift(view.project(Array.from(column.subarray(at, at + components)))), at);
    }
  }
}
