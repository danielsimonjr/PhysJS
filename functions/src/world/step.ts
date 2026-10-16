/**
 * `step`: one time step. The integrator's velocity phase applies gravity,
 * loads and damping; the contact solver then corrects those velocities; the
 * integrator's position phase moves the bodies; resting bodies fall asleep.
 */

import {
  BODY_FIELDS,
  BODY_TYPES,
  SOLVER_DEFAULTS,
  VALUE_RULES,
  type BodyTypeRecord,
  type World,
} from '@danielsimonjr/physjs-core';
import { findContacts } from '../collision/contacts';
import { INTEGRATORS } from '../dynamics/integrators';
import { SAMPLE_LAYOUT, loadSample } from '../dynamics/sample';
import { updateSleep, wakeTouched } from '../dynamics/sleep';
import { solveConstraints } from '../dynamics/solver';
import { applySpringLoads, jointLinks, jointRows } from '../joints/rows';
import { updateTouching } from './events';
import { FIELD_NAMES } from './storage';

const ACCUMULATORS = FIELD_NAMES.filter((name) => BODY_FIELDS[name].role === 'accumulator');

/** Scratch sample, fully rewritten for each body before it is read. */
const sample = new Float64Array(SAMPLE_LAYOUT.length);

/** Each live, awake slot whose type integrates, with its type row. */
function* integrating(world: World): Generator<[number, BodyTypeRecord]> {
  const store = world.bodies;
  for (let slot = 0; slot < store.size; slot++) {
    if (store.alive[slot] !== 1 || store.fields.asleep[slot] === 1) continue;
    const row: BodyTypeRecord = BODY_TYPES[store.typeIndex[slot]!]!;
    if (row.integrates) yield [slot, row];
  }
}

/**
 * Advances the world by `dt` seconds:
 *
 * 1. the velocity phase of the world's integrator, for every awake body that integrates;
 * 2. `findContacts` (margin `SOLVER_DEFAULTS.contactMargin`), waking sleepers
 *    touched by moving bodies and queueing `contactBegin` / `contactEnd`;
 * 3. the constraint solver: contacts (PGS with friction, restitution and warm
 *    start) and joint rows; spring joints act as loads before step 1;
 * 4. the position phase;
 * 5. sleep timers, then every applied force and torque is reset.
 *
 * The result depends only on the world state and `dt`.
 */
export function step(world: World, dt: number): void {
  if (!VALUE_RULES.positive.test(dt)) {
    throw new RangeError(`dt must be ${VALUE_RULES.positive.description}; got ${dt}`);
  }
  const integrator = INTEGRATORS[world.integrator];
  const store = world.bodies;
  applySpringLoads(world);
  for (const [slot, row] of integrating(world)) {
    loadSample(world, slot, row, dt, sample);
    integrator.velocity(store, slot, sample, dt);
  }
  const manifolds = findContacts(world, { margin: SOLVER_DEFAULTS.contactMargin });
  wakeTouched(world, [...manifolds, ...jointLinks(world)]);
  updateTouching(world, manifolds);
  solveConstraints(world, manifolds, jointRows, dt);
  for (const [slot] of integrating(world)) integrator.position(store, slot, dt);
  updateSleep(world, dt);
  for (const name of ACCUMULATORS) {
    store.fields[name].fill(0, 0, store.size * BODY_FIELDS[name].components);
  }
  world.time += dt;
  world.steps += 1;
}
