/** `createWorld`: resolves world options against the defaults and MathTS gravity. */

import { gravity as standardGravity } from '@danielsimonjr/mathts-functions';
import {
  INTEGRATOR_CATALOG,
  SUPPORTED_DIMS,
  WORLD_DEFAULTS,
  type World,
  type WorldOptions,
} from '@danielsimonjr/physjs-core';
import { MAX_BODIES } from './handles';
import { createBodyStore } from './storage';
import { readValue, rejectUnknownKeys, requireRecord } from './validate';

const OPTION_KEYS: ReadonlySet<string> = new Set([
  'dims',
  'gravity',
  'integrator',
  'initialBodyCapacity',
]);

/** MathTS standard gravity along `-WORLD_DEFAULTS.up`, m/s^2. */
function defaultGravity(): number[] {
  const g = standardGravity.toNumeric('m/s^2');
  if (typeof g !== 'number') throw new TypeError('MathTS gravity did not convert to a number');
  // `+ 0` turns the -0 of a zero component into 0.
  return WORLD_DEFAULTS.up.map((u) => -g * u + 0);
}

/**
 * Creates an empty world.
 *
 * ```ts
 * const world = createWorld({ dims: 3 }); // gravity [0, -9.80665, 0] from MathTS
 * ```
 *
 * Throws a `TypeError` for an unknown option or a malformed value and a
 * `RangeError` for an unsupported dimension, integrator or capacity.
 */
export function createWorld(options: WorldOptions): World {
  requireRecord('createWorld options', options);
  rejectUnknownKeys('createWorld options', options, OPTION_KEYS);
  const { dims } = options;
  if (!(SUPPORTED_DIMS as readonly unknown[]).includes(dims)) {
    throw new RangeError(`dims must be one of ${SUPPORTED_DIMS.join(', ')}; got ${String(dims)}`);
  }
  const integrator = options.integrator ?? WORLD_DEFAULTS.integrator;
  if (!INTEGRATOR_CATALOG.some((record) => record.name === integrator)) {
    const known = INTEGRATOR_CATALOG.map((record) => record.name).join(', ');
    throw new RangeError(`integrator must be one of ${known}; got ${String(integrator)}`);
  }
  const gravity =
    options.gravity === undefined
      ? defaultGravity()
      : readValue('gravity', options.gravity, { components: dims, rule: 'finite' });
  const capacity = options.initialBodyCapacity ?? WORLD_DEFAULTS.initialBodyCapacity;
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > MAX_BODIES) {
    throw new RangeError(
      `initialBodyCapacity must be an integer from 1 to ${MAX_BODIES}; got ${capacity}`
    );
  }
  return {
    dims,
    gravity: Float64Array.from(gravity),
    integrator,
    time: 0,
    steps: 0,
    bodies: createBodyStore(capacity),
    colliders: { next: 1, byHandle: new Map() },
    broadphase: { order: [] },
  };
}
