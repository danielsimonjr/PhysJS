/**
 * Integrator functions, keyed by the `INTEGRATOR_CATALOG` names. The type of
 * `INTEGRATORS` makes the compiler require one function per catalog entry.
 */

import {
  quaternionExp,
  quaternionMultiply,
  quaternionNormalize,
} from '@danielsimonjr/mathts-functions';
import { BODY_FIELDS, type BodyStore, type IntegratorName } from '@danielsimonjr/physjs-core';
import { SAMPLE_LAYOUT } from './sample';

const LINEAR = BODY_FIELDS.linearVelocity.components;
const ANGULAR = BODY_FIELDS.angularVelocity.components;
const ORIENTATION = BODY_FIELDS.rotation.components;

/** Advances body `slot` of `store` by `dt` seconds with a sample from `loadSample`. */
export type IntegratorFn = (
  store: BodyStore,
  slot: number,
  sample: Float64Array,
  dt: number
) => void;

/**
 * Turns the orientation of `slot` by the world angular velocity `w` over `dt`:
 * `q <- exp([0, w dt / 2]) q`, exact for an angular velocity constant over the
 * step. The MathTS quaternion functions allocate small arrays; allocation-free
 * kernels are MathTS #375.
 */
function turn(store: BodyStore, slot: number, w: readonly number[], dt: number): void {
  const { rotation } = store.fields;
  const offset = slot * ORIENTATION;
  const q = Array.from(rotation.subarray(offset, offset + ORIENTATION));
  const half = dt / 2;
  const spin = quaternionExp([0, w[0]! * half, w[1]! * half, w[2]! * half]);
  rotation.set(quaternionNormalize(quaternionMultiply(spin, q)), offset);
}

/**
 * Semi-implicit (symplectic) Euler: the velocities take the sample first, with
 * implicit damping `v <- (v + a dt) / (1 + c dt)`, then the pose moves with the
 * new velocities. Under constant acceleration the position leads the exact
 * solution by `a t dt / 2`. The angular update has no gyroscopic term
 * (`w x I w`), as in most real-time engines; a body spinning freely about a
 * non-principal axis keeps its world angular velocity.
 */
const semiImplicitEuler: IntegratorFn = (store, slot, sample, dt) => {
  const { position, linearVelocity, angularVelocity } = store.fields;
  const linearFactor = sample[SAMPLE_LAYOUT.linearFactor]!;
  const angularFactor = sample[SAMPLE_LAYOUT.angularFactor]!;
  for (let k = 0; k < LINEAR; k++) {
    const i = slot * LINEAR + k;
    const v = (linearVelocity[i]! + sample[SAMPLE_LAYOUT.linear + k]! * dt) * linearFactor;
    linearVelocity[i] = v;
    position[i] = position[i]! + v * dt;
  }
  const w = new Array<number>(ANGULAR);
  for (let k = 0; k < ANGULAR; k++) {
    const i = slot * ANGULAR + k;
    w[k] = (angularVelocity[i]! + sample[SAMPLE_LAYOUT.angular + k]! * dt) * angularFactor;
    angularVelocity[i] = w[k]!;
  }
  if (w.some((x) => x !== 0)) turn(store, slot, w, dt);
};

/** Every integrator, keyed by its catalog name. */
export const INTEGRATORS: Readonly<Record<IntegratorName, IntegratorFn>> = Object.freeze({
  'semi-implicit-euler': semiImplicitEuler,
});
