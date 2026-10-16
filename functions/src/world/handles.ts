/**
 * Generation-tagged body handles. A handle packs a slot index and the slot's
 * generation into one safe integer; removing a body bumps the generation, so
 * every handle to the removed body stops resolving.
 */

import type { BodyHandle, BodyStore } from '@danielsimonjr/physjs-core';

const INDEX_SPAN = 2 ** 24;

/** Most body slots one world can hold. */
export const MAX_BODIES = INDEX_SPAN;

/** Generations a slot may reach before it is retired, keeping handles safe integers. */
export const GENERATION_LIMIT = Math.floor(Number.MAX_SAFE_INTEGER / INDEX_SPAN);

/** The handle of slot `index` at `generation`. */
export function packHandle(index: number, generation: number): BodyHandle {
  return (generation * INDEX_SPAN + index) as BodyHandle;
}

/** The live slot `handle` names in `store`, or -1 when it names none. */
export function slotOf(store: BodyStore, handle: BodyHandle): number {
  if (!Number.isSafeInteger(handle) || handle < 0) return -1;
  const index = handle % INDEX_SPAN;
  const generation = (handle - index) / INDEX_SPAN;
  if (index >= store.size || store.alive[index] !== 1) return -1;
  return store.generation[index] === generation ? index : -1;
}

/** The live slot `handle` names in `store`; throws a `RangeError` when it names none. */
export function requireSlot(store: BodyStore, handle: BodyHandle): number {
  const slot = slotOf(store, handle);
  if (slot < 0) throw new RangeError(`body handle ${handle} is stale or not from this world`);
  return slot;
}
