/**
 * The integrators PhysJS implements, as data. `@danielsimonjr/physjs` keys its
 * `INTEGRATORS` functions by these names, which are fourJS's `INTEGRATORS` names.
 */

import { deepFreeze } from './freeze';

/** Properties of one integrator. */
export interface IntegratorRecord {
  /** The fourJS integrator name. */
  readonly name: string;
  /** Global order of accuracy in the time step. */
  readonly order: number;
  /** Whether the method is symplectic (bounded energy error on conservative systems). */
  readonly symplectic: boolean;
  /** Load evaluations per step. */
  readonly evaluations: number;
}

/**
 * Every integrator. Semi-implicit Euler updates velocity first, then position
 * with the new velocity; the orientation turns by the exponential map of the
 * new angular velocity.
 */
export const INTEGRATOR_CATALOG = deepFreeze([
  { name: 'semi-implicit-euler', order: 1, symplectic: true, evaluations: 1 },
] as const satisfies readonly IntegratorRecord[]);

/** An integrator name: one of {@link INTEGRATOR_CATALOG}. */
export type IntegratorName = (typeof INTEGRATOR_CATALOG)[number]['name'];
