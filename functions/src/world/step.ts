/** `step`: advances every moving body with the world's integrator. */

import {
  BODY_FIELDS,
  BODY_TYPES,
  VALUE_RULES,
  type BodyTypeRecord,
  type World,
} from '@danielsimonjr/physjs-core';
import { INTEGRATORS } from '../dynamics/integrators';
import { SAMPLE_LAYOUT, loadSample } from '../dynamics/sample';
import { FIELD_NAMES } from './storage';

const ACCUMULATORS = FIELD_NAMES.filter((name) => BODY_FIELDS[name].role === 'accumulator');

/** Scratch sample, fully rewritten for each body before it is read. */
const sample = new Float64Array(SAMPLE_LAYOUT.length);

/**
 * Advances the world by `dt` seconds: every live body whose type integrates is
 * moved by the world's integrator, then every applied force and torque is reset.
 * The result depends only on the world state and `dt`.
 */
export function step(world: World, dt: number): void {
  if (!VALUE_RULES.positive.test(dt)) {
    throw new RangeError(`dt must be ${VALUE_RULES.positive.description}; got ${dt}`);
  }
  const integrate = INTEGRATORS[world.integrator];
  const store = world.bodies;
  for (let slot = 0; slot < store.size; slot++) {
    if (store.alive[slot] !== 1) continue;
    const row: BodyTypeRecord = BODY_TYPES[store.typeIndex[slot]!]!;
    if (!row.integrates) continue;
    loadSample(world, slot, row, dt, sample);
    integrate(store, slot, sample, dt);
  }
  for (const name of ACCUMULATORS) {
    store.fields[name].fill(0, 0, store.size * BODY_FIELDS[name].components);
  }
  world.time += dt;
  world.steps += 1;
}
