/**
 * The struct-of-arrays body store. Every column, its size and its defaults come
 * from `BODY_FIELDS`; growing the store copies each column. Growth happens in
 * `addBody`, never in `step`.
 */

import {
  BODY_FIELDS,
  type BodyFieldName,
  type BodyStore,
  type NumericOutput,
} from '@danielsimonjr/physjs-core';
import { GENERATION_LIMIT, MAX_BODIES } from './handles';

/** Every column name, in table order. */
export const FIELD_NAMES = Object.keys(BODY_FIELDS) as BodyFieldName[];

function columns(capacity: number): Record<BodyFieldName, Float64Array> {
  return Object.fromEntries(
    FIELD_NAMES.map((name) => [name, new Float64Array(capacity * BODY_FIELDS[name].components)])
  ) as Record<BodyFieldName, Float64Array>;
}

/** An empty store with room for `capacity` bodies. */
export function createBodyStore(capacity: number): BodyStore {
  return {
    capacity,
    size: 0,
    live: 0,
    generation: new Uint32Array(capacity),
    alive: new Uint8Array(capacity),
    typeIndex: new Uint8Array(capacity),
    freeSlots: [],
    fields: columns(capacity),
  };
}

function grow(store: BodyStore): void {
  const capacity = Math.min(MAX_BODIES, store.capacity * 2);
  const generation = new Uint32Array(capacity);
  const alive = new Uint8Array(capacity);
  const typeIndex = new Uint8Array(capacity);
  generation.set(store.generation);
  alive.set(store.alive);
  typeIndex.set(store.typeIndex);
  const fields = columns(capacity);
  for (const name of FIELD_NAMES) fields[name].set(store.fields[name]);
  store.capacity = capacity;
  store.generation = generation;
  store.alive = alive;
  store.typeIndex = typeIndex;
  store.fields = fields;
}

/** Takes a free slot (a released one first), marks it live and returns its index. */
export function allocateSlot(store: BodyStore): number {
  let index = store.freeSlots.pop();
  if (index === undefined) {
    index = store.size;
    if (index >= MAX_BODIES) throw new RangeError(`a world holds at most ${MAX_BODIES} bodies`);
    if (index >= store.capacity) grow(store);
    store.size += 1;
  }
  store.alive[index] = 1;
  store.live += 1;
  return index;
}

/** Frees `index` and bumps its generation; a slot at the generation limit is retired. */
export function releaseSlot(store: BodyStore, index: number): void {
  store.alive[index] = 0;
  store.live -= 1;
  const generation = store.generation[index]! + 1;
  store.generation[index] = generation;
  if (generation < GENERATION_LIMIT) store.freeSlots.push(index);
}

/** Writes `values` into column `name` at slot `index`. */
export function writeColumn(
  store: BodyStore,
  name: BodyFieldName,
  index: number,
  values: ArrayLike<number>
): void {
  store.fields[name].set(values, index * BODY_FIELDS[name].components);
}

/** Copies column `name` at slot `index` into `out` and returns it. */
export function readColumn<T extends NumericOutput>(
  store: BodyStore,
  name: BodyFieldName,
  index: number,
  out: T
): T {
  const { components } = BODY_FIELDS[name];
  const column = store.fields[name];
  const offset = index * components;
  for (let k = 0; k < components; k++) out[k] = column[offset + k]!;
  return out;
}
