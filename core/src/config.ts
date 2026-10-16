/**
 * World defaults. Physical constants are not defined here: default gravity is
 * MathTS standard gravity along `-up`, resolved by `createWorld`.
 */

import { deepFreeze } from './catalog/freeze';
import type { IntegratorName } from './catalog/integrators';

/** World dimensions this release simulates. */
export const SUPPORTED_DIMS = deepFreeze([3] as const);

/** A world dimension: one of {@link SUPPORTED_DIMS}. */
export type SupportedDims = (typeof SUPPORTED_DIMS)[number];

/** Settings a world takes when its options omit them. */
export interface WorldDefaults {
  /** Integrator used by `step`. */
  readonly integrator: IntegratorName;
  /** Unit up vector. +Y is up, as in fourJS. */
  readonly up: readonly number[];
  /** Body slots allocated before the store first grows. */
  readonly initialBodyCapacity: number;
}

/** The world defaults. */
export const WORLD_DEFAULTS: WorldDefaults = deepFreeze({
  integrator: 'semi-implicit-euler',
  up: [0, 1, 0],
  initialBodyCapacity: 16,
});
