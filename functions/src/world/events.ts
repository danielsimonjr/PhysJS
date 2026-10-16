/**
 * The event queue. `step` queues `EVENT_TYPES` events in the world; the caller
 * drains them, as fourJS's adapter `drainEvents` does.
 */

import type { ContactManifold, PhysicsEvent, World } from '@danielsimonjr/physjs-core';
import { pairKey } from '../dynamics/solver';

/** Queues an event. */
export function emit(world: World, event: PhysicsEvent): void {
  world.events.push(event);
}

/**
 * Returns the events queued since the last call, oldest first, and clears the
 * queue.
 *
 * ```ts
 * step(world, 1 / 60);
 * for (const event of drainEvents(world)) if (event.type === 'contactBegin') play(event);
 * ```
 */
export function drainEvents(world: World): PhysicsEvent[] {
  return world.events.splice(0, world.events.length);
}

/**
 * Queues `contactBegin` for pairs that touch now and did not before, and
 * `contactEnd` for pairs that touched before and no longer do. A pair touches
 * when any of its manifold points has depth >= 0 (points inside the margin
 * only do not count).
 */
export function updateTouching(world: World, manifolds: readonly ContactManifold[]): void {
  const now = new Map(
    manifolds
      .filter((m) => m.points.some((p) => p.depth >= 0))
      .map((m) => {
        const { colliderA, colliderB, bodyA, bodyB } = m;
        return [pairKey(m), { colliderA, colliderB, bodyA, bodyB }] as const;
      })
  );
  const before = world.solver.touching;
  for (const [key, pair] of before) if (!now.has(key)) emit(world, { type: 'contactEnd', ...pair });
  for (const [key, pair] of now)
    if (!before.has(key)) emit(world, { type: 'contactBegin', ...pair });
  world.solver.touching = now;
}
