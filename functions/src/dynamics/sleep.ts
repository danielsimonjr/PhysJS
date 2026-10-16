/**
 * Sleeping. A dynamic body whose speeds stay under the `SOLVER_DEFAULTS`
 * thresholds for `sleepTime` seconds falls asleep: its velocities are zeroed
 * and `step` skips it, and the solver treats it as immovable. It wakes when a
 * setter or load touches it, or when an awake moving body touches it.
 */

import {
  BODY_FIELDS,
  BODY_TYPES,
  SOLVER_DEFAULTS,
  type BodyHandle,
  type ContactManifold,
  type World,
} from '@danielsimonjr/physjs-core';
import { emit } from '../world/events';
import { packHandle, requireSlot } from '../world/handles';
import { length } from '../collision/vector';

const LINEAR = BODY_FIELDS.linearVelocity.components;
const ANGULAR = BODY_FIELDS.angularVelocity.components;

const handleOf = (world: World, slot: number): BodyHandle =>
  packHandle(slot, world.bodies.generation[slot]!);

/** Wakes the body in `slot` if it sleeps, queueing a `wake` event. */
export function wakeSlot(world: World, slot: number): void {
  const { fields } = world.bodies;
  fields.sleepTimer[slot] = 0;
  if (fields.asleep[slot] === 0) return;
  fields.asleep[slot] = 0;
  emit(world, { type: 'wake', body: handleOf(world, slot) });
}

/** Whether the body in `slot` is dynamic, awake and was moving at the end of the last step. */
const moving = (world: World, slot: number): boolean =>
  BODY_TYPES[world.bodies.typeIndex[slot]!]!.dynamic &&
  world.bodies.fields.asleep[slot] === 0 &&
  world.bodies.fields.sleepTimer[slot] === 0;

/** Wakes sleeping bodies touched by an awake moving body or by a moving kinematic body. */
export function wakeTouched(world: World, manifolds: readonly ContactManifold[]): void {
  const { fields, typeIndex } = world.bodies;
  const kinematicMoving = (slot: number) =>
    BODY_TYPES[typeIndex[slot]!]!.integrates &&
    !BODY_TYPES[typeIndex[slot]!]!.dynamic &&
    (length(Array.from(fields.linearVelocity.subarray(slot * LINEAR, (slot + 1) * LINEAR))) > 0 ||
      length(Array.from(fields.angularVelocity.subarray(slot * ANGULAR, (slot + 1) * ANGULAR))) >
        0);
  // Repeat until no more wake: a wave along a stack wakes it in one step.
  for (let changed = true; changed;) {
    changed = false;
    for (const m of manifolds) {
      const a = requireSlot(world.bodies, m.bodyA);
      const b = requireSlot(world.bodies, m.bodyB);
      for (const [sleeper, other] of [
        [a, b],
        [b, a],
      ] as const) {
        if (fields.asleep[sleeper] !== 1) continue;
        if (moving(world, other) || kinematicMoving(other)) {
          wakeSlot(world, sleeper);
          changed = true;
        }
      }
    }
  }
}

/** Advances the sleep timers after a step of `dt` and puts resting bodies to sleep. */
export function updateSleep(world: World, dt: number): void {
  const { sleepLinearSpeed, sleepAngularSpeed, sleepTime } = SOLVER_DEFAULTS;
  const store = world.bodies;
  const { fields } = store;
  for (let slot = 0; slot < store.size; slot++) {
    if (store.alive[slot] !== 1 || fields.asleep[slot] === 1) continue;
    if (!BODY_TYPES[store.typeIndex[slot]!]!.dynamic) continue;
    const v = Array.from(fields.linearVelocity.subarray(slot * LINEAR, (slot + 1) * LINEAR));
    const w = Array.from(fields.angularVelocity.subarray(slot * ANGULAR, (slot + 1) * ANGULAR));
    if (length(v) > sleepLinearSpeed || length(w) > sleepAngularSpeed) {
      fields.sleepTimer[slot] = 0;
      continue;
    }
    fields.sleepTimer[slot] = fields.sleepTimer[slot]! + dt;
    if (fields.sleepTimer[slot]! < sleepTime) continue;
    fields.asleep[slot] = 1;
    fields.linearVelocity.fill(0, slot * LINEAR, (slot + 1) * LINEAR);
    fields.angularVelocity.fill(0, slot * ANGULAR, (slot + 1) * ANGULAR);
    emit(world, { type: 'sleep', body: handleOf(world, slot) });
  }
}

/** Whether a body is asleep. */
export function isSleeping(world: World, body: BodyHandle): boolean {
  return world.bodies.fields.asleep[requireSlot(world.bodies, body)] === 1;
}

/** Wakes a body (queueing `wake` if it slept) and restarts its sleep timer. */
export function wakeBody(world: World, body: BodyHandle): void {
  wakeSlot(world, requireSlot(world.bodies, body));
}
