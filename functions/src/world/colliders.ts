/**
 * Colliders: a shape plus a density, attached to a body. A dynamic body's mass
 * and principal inertia are the sums over its colliders, computed by MathTS
 * `massProperties` (MathTS #378); the `SHAPES` catalog names are the MathTS
 * shape types, so shapes pass straight through.
 *
 * 0.1 colliders are centred on the body origin and aligned with the body axes,
 * so every collider's inertia is diagonal in the body frame and sums directly.
 */

import { massProperties, type MassPropertyShape } from '@danielsimonjr/mathts-functions';
import {
  BODY_FIELDS,
  MATERIAL_FIELDS,
  SHAPES,
  type MaterialFieldName,
  type BodyHandle,
  type ColliderDescriptor,
  type ColliderHandle,
  type ColliderRecord,
  type ShapeDescriptor,
  type World,
} from '@danielsimonjr/physjs-core';
import { validateShape } from '../collision/shapes';
import { refreshDerived, writeMassProperties } from './bodies';
import { requireSlot } from './handles';
import { readParam, readValue, rejectUnknownKeys, requireRecord } from './validate';
import { length } from '../collision/vector';

const MATERIAL_NAMES = Object.keys(MATERIAL_FIELDS) as MaterialFieldName[];
const DESCRIPTOR_KEYS: ReadonlySet<string> = new Set(['shape', 'density', ...MATERIAL_NAMES]);
const PARAMS = new Map(SHAPES.map((row) => [row.type as string, row.params]));
const SHAPE_DIMS = new Map<string, number>(SHAPES.map((row) => [row.type, row.dims]));

/** A plain-array copy of a validated shape, in the MathTS shape form. */
export function copyShape(shape: ShapeDescriptor): ShapeDescriptor {
  const out: Record<string, unknown> = { type: shape.type };
  for (const [name, schema] of Object.entries(PARAMS.get(shape.type)!)) {
    const values = readParam(name, (shape as unknown as Record<string, unknown>)[name], schema);
    out[name] = 'scalar' in schema && schema.scalar ? values[0] : values;
  }
  return out as unknown as ShapeDescriptor;
}

/** Sums the colliders of `body` into its mass and inertia columns. */
function recomputeBody(world: World, body: BodyHandle): void {
  const slot = requireSlot(world.bodies, body);
  let mass = 0;
  const inertia = [0, 0, 0];
  let any = false;
  for (const collider of world.colliders.byHandle.values()) {
    if (collider.body !== body) continue;
    any = true;
    mass += collider.mass;
    for (let k = 0; k < 3; k++) inertia[k]! += collider.inertia[k]!;
  }
  // With no colliders left the body returns to the BODY_FIELDS defaults (infinite).
  const written = any
    ? writeMassProperties(world, slot, mass, inertia)
    : writeMassProperties(world, slot, BODY_FIELDS.mass.initial[0]!, BODY_FIELDS.inertia.initial);
  if (written) refreshDerived(world, slot);
}

/**
 * Attaches a collider to a body and returns its handle. `friction` and
 * `restitution` default to their `MATERIAL_FIELDS` rows.
 *
 * ```ts
 * const ball = addBody(world, { type: 'dynamic', position: [0, 5, 0] });
 * addCollider(world, ball, { shape: { type: 'sphere', radius: 0.5 }, density: 1000 });
 * getMass(world, ball); // 523.6 kg
 * ```
 *
 * On a dynamic body the colliders' masses and inertias replace any explicit
 * `mass` and `inertia`. Static and kinematic bodies keep infinite mass.
 */
export function addCollider(
  world: World,
  body: BodyHandle,
  descriptor: ColliderDescriptor
): ColliderHandle {
  requireSlot(world.bodies, body);
  requireRecord('collider descriptor', descriptor);
  rejectUnknownKeys('collider descriptor', descriptor, DESCRIPTOR_KEYS);
  validateShape(descriptor.shape);
  requireWorldShape(world, descriptor.shape);
  const shape = copyShape(descriptor.shape);
  const [density] = readValue('density', descriptor.density, {
    components: 1,
    scalar: true,
    rule: 'positive',
  });
  const props = massProperties(shape as MassPropertyShape, density);
  // 0.x colliders sit at the body origin, so the shape's centroid must too.
  if (length(props.centroid) > 1e-9 * Math.max(1, Math.sqrt(props.mass / density!))) {
    throw new RangeError(
      `${shape.type} must be centred on its centroid; it is at [${props.centroid}]`
    );
  }
  // A 2-D polar moment is the z moment; the x and y axes are locked (infinite).
  const inertia: [number, number, number] =
    props.dims === 3
      ? [props.inertia[0][0], props.inertia[1][1], props.inertia[2][2]]
      : [Infinity, Infinity, props.inertia];
  // Each material field from its MATERIAL_FIELDS row: default, then rule.
  const materials = Object.fromEntries(
    MATERIAL_NAMES.map((name) => {
      const { initial, rule } = MATERIAL_FIELDS[name];
      const value = descriptor[name] ?? initial;
      return [name, readValue(name, value, { components: 1, scalar: true, rule })[0]!];
    })
  ) as Record<MaterialFieldName, number>;
  const record: ColliderRecord = {
    body,
    shape,
    density: density!,
    mass: props.mass,
    inertia,
    ...materials,
  };
  const handle = world.colliders.next++ as ColliderHandle;
  world.colliders.byHandle.set(handle, record);
  recomputeBody(world, body);
  return handle;
}

/** Detaches a collider. The body's mass properties are recomputed from the rest. */
export function removeCollider(world: World, handle: ColliderHandle): void {
  const record = world.colliders.byHandle.get(handle);
  if (record === undefined)
    throw new RangeError(`collider handle ${handle} is not live in this world`);
  world.colliders.byHandle.delete(handle);
  recomputeBody(world, record.body);
}

/** The stored collider record, or `undefined` for a handle that is not live. */
export function getCollider(world: World, handle: ColliderHandle): ColliderRecord | undefined {
  return world.colliders.byHandle.get(handle);
}

/** Removes every collider attached to `body` (used by `removeBody`). */
export function removeBodyColliders(world: World, body: BodyHandle): void {
  for (const [handle, collider] of world.colliders.byHandle) {
    if (collider.body === body) world.colliders.byHandle.delete(handle);
  }
}

/** Throws unless `shape`'s `SHAPES` row has the world's dimension. */
export function requireWorldShape(world: World, shape: ShapeDescriptor): void {
  const dims = SHAPE_DIMS.get(shape.type);
  if (dims !== world.dims) {
    throw new RangeError(`${shape.type} is a ${dims}-D shape; this world is ${world.dims}-D`);
  }
}
