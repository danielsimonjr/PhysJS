/**
 * Adding, removing and reading bodies. Descriptor checks, defaults and the
 * per-field accessors are generated from `BODY_FIELDS` and `BODY_TYPES`.
 */

import { quaternionNormalize } from '@danielsimonjr/mathts-functions';
import {
  BODY_FIELDS,
  BODY_TYPES,
  type BodyDescriptor,
  type BodyFieldName,
  type BodyFieldRecord,
  type BodyHandle,
  type BodyTypeName,
  type BodyTypeRecord,
  type DescriptorFieldName,
  type NumericInput,
  type NumericOutput,
  type World,
} from '@danielsimonjr/physjs-core';
import { wakeSlot } from '../dynamics/sleep';
import { removeBodyJoints } from '../joints/joints';
import { removeBodyColliders } from './colliders';
import { packHandle, requireSlot, slotOf } from './handles';
import { FIELD_NAMES, allocateSlot, readColumn, releaseSlot, writeColumn } from './storage';
import { readValue, rejectUnknownKeys, requireRecord } from './validate';

const DESCRIPTOR_FIELDS = FIELD_NAMES.filter(
  (name) => BODY_FIELDS[name].descriptor
) as DescriptorFieldName[];
const DESCRIPTOR_KEYS: ReadonlySet<string> = new Set(['type', ...DESCRIPTOR_FIELDS]);
/** Each derived column with the column it is the reciprocal of. */
const DERIVED_FIELDS = FIELD_NAMES.flatMap((name) => {
  const field: BodyFieldRecord = BODY_FIELDS[name];
  return field.role === 'derived' && field.derivedFrom !== undefined
    ? [{ name, source: field.derivedFrom as BodyFieldName, components: field.components }]
    : [];
});
const TYPE_INDEX = new Map<string, number>(BODY_TYPES.map((row, index) => [row.name, index]));

function typeRow(world: World, slot: number): BodyTypeRecord {
  return BODY_TYPES[world.bodies.typeIndex[slot]!]!;
}

/** Checks one descriptor or setter value against its field row and the body type. */
function readField(name: DescriptorFieldName, value: unknown, row: BodyTypeRecord): number[] {
  const field: (typeof BODY_FIELDS)[BodyFieldName] = BODY_FIELDS[name];
  const values = readValue(name, value, field);
  if (field.role === 'velocity' && !row.integrates && values.some((x) => x !== 0)) {
    throw new RangeError(
      `${name} must be zero on a ${row.name} body, which does not integrate velocity`
    );
  }
  if ('normalize' in field && field.normalize === 'quaternion') {
    try {
      return quaternionNormalize(values);
    } catch (cause) {
      throw new RangeError(`${name} must be a non-zero quaternion [w, x, y, z]`, { cause });
    }
  }
  return values;
}

/** Recomputes the derived columns (reciprocals of mass and inertia) of `slot`. */
export function refreshDerived(world: World, slot: number): void {
  const { fields } = world.bodies;
  for (const { name, source, components } of DERIVED_FIELDS) {
    const from = fields[source];
    const target = fields[name];
    const offset = slot * components;
    for (let k = 0; k < components; k++) target[offset + k] = 1 / from[offset + k]!;
  }
}

/**
 * Writes collider-derived mass and principal inertia into a dynamic body's
 * columns. Returns false, leaving the columns alone, on a body that is not
 * dynamic (its mass stays infinite).
 */
export function writeMassProperties(
  world: World,
  slot: number,
  mass: number,
  inertia: readonly number[]
): boolean {
  if (!typeRow(world, slot).dynamic) return false;
  writeColumn(world.bodies, 'mass', slot, [mass]);
  writeColumn(world.bodies, 'inertia', slot, inertia);
  return true;
}

/**
 * Adds a body and returns its handle.
 *
 * ```ts
 * const ball = addBody(world, { type: 'dynamic', mass: 1, position: [0, 5, 0] });
 * ```
 *
 * Omitted fields take their `BODY_FIELDS` defaults. Mass and inertia are used
 * only by dynamic bodies; a dynamic body takes them from `addCollider` (by
 * density, through MathTS `massProperties`) or from explicit `mass` and
 * `inertia`. The whole descriptor is checked before anything is
 * stored, so a rejected descriptor leaves the world unchanged.
 */
export function addBody(world: World, descriptor: BodyDescriptor): BodyHandle {
  requireRecord('body descriptor', descriptor);
  rejectUnknownKeys('body descriptor', descriptor, DESCRIPTOR_KEYS);
  const typeIndex = TYPE_INDEX.get(descriptor.type);
  if (typeIndex === undefined) {
    const known = BODY_TYPES.map((row) => row.name).join(', ');
    throw new RangeError(`body type must be one of ${known}; got ${String(descriptor.type)}`);
  }
  const row: BodyTypeRecord = BODY_TYPES[typeIndex]!;
  const given = new Map<BodyFieldName, readonly number[]>();
  for (const name of DESCRIPTOR_FIELDS) {
    const value = descriptor[name];
    if (value === undefined) continue;
    const values = readField(name, value, row);
    if (BODY_FIELDS[name].role === 'massProperty' && !row.dynamic) continue;
    given.set(name, values);
  }
  const store = world.bodies;
  const slot = allocateSlot(store);
  store.typeIndex[slot] = typeIndex;
  for (const name of FIELD_NAMES) {
    writeColumn(store, name, slot, given.get(name) ?? BODY_FIELDS[name].initial);
  }
  refreshDerived(world, slot);
  return packHandle(slot, store.generation[slot]!);
}

/** Removes a body. Its handle, and every copy of it, becomes invalid. */
export function removeBody(world: World, handle: BodyHandle): void {
  const slot = requireSlot(world.bodies, handle);
  removeBodyColliders(world, handle);
  removeBodyJoints(world, handle);
  releaseSlot(world.bodies, slot);
}

/** Whether `handle` names a live body of `world`. */
export function hasBody(world: World, handle: BodyHandle): boolean {
  return slotOf(world.bodies, handle) >= 0;
}

/** Number of live bodies. */
export function bodyCount(world: World): number {
  return world.bodies.live;
}

/** The body's type. */
export function getBodyType(world: World, handle: BodyHandle): BodyTypeName {
  return BODY_TYPES[world.bodies.typeIndex[requireSlot(world.bodies, handle)]!]!.name;
}

/** The body's mass, kg; `Infinity` on a body that is not dynamic. */
export function getMass(world: World, handle: BodyHandle): number {
  return world.bodies.fields.mass[requireSlot(world.bodies, handle)]!;
}

/** Reads one body field, into `out` when given (allocation-free) or a new array. */
export interface FieldGetter {
  /** Returns the field in a new array. */
  (world: World, handle: BodyHandle): number[];
  /** Writes the field into `out` and returns it. */
  <T extends NumericOutput>(world: World, handle: BodyHandle, out: T): T;
}

/** Sets one body field after checking it against its `BODY_FIELDS` row, and wakes the body. */
export type FieldSetter = (world: World, handle: BodyHandle, value: NumericInput) => void;

function fieldGetter(name: DescriptorFieldName): FieldGetter {
  const { components } = BODY_FIELDS[name];
  return ((world: World, handle: BodyHandle, out?: NumericOutput) => {
    const target = out ?? new Array<number>(components);
    if (target.length < components) {
      throw new TypeError(`${name} needs an out array of length ${components}`);
    }
    return readColumn(world.bodies, name, requireSlot(world.bodies, handle), target);
  }) as FieldGetter;
}

function fieldSetter(name: DescriptorFieldName): FieldSetter {
  return (world, handle, value) => {
    const slot = requireSlot(world.bodies, handle);
    writeColumn(world.bodies, name, slot, readField(name, value, typeRow(world, slot)));
    wakeSlot(world, slot);
  };
}

/** World position of the body, metres. */
export const getPosition: FieldGetter = fieldGetter('position');
/** Orientation of the body, a unit quaternion `[w, x, y, z]`. */
export const getRotation: FieldGetter = fieldGetter('rotation');
/** World linear velocity, m/s. */
export const getLinearVelocity: FieldGetter = fieldGetter('linearVelocity');
/** World angular velocity, rad/s. */
export const getAngularVelocity: FieldGetter = fieldGetter('angularVelocity');
/** Moves the body to a world position, metres. */
export const setPosition: FieldSetter = fieldSetter('position');
/** Sets the orientation; the quaternion `[w, x, y, z]` is normalized. */
export const setRotation: FieldSetter = fieldSetter('rotation');
/** Sets the world linear velocity, m/s. Must be zero on a body type that does not integrate. */
export const setLinearVelocity: FieldSetter = fieldSetter('linearVelocity');
/** Sets the world angular velocity, rad/s. Must be zero on a body type that does not integrate. */
export const setAngularVelocity: FieldSetter = fieldSetter('angularVelocity');
