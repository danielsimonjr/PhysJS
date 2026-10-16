/**
 * The acceleration sample an integrator advances one body with: linear and
 * angular acceleration plus the implicit damping factors. Rotations go through
 * MathTS quaternion functions; nothing here re-implements them.
 */

import {
  dotMultiply,
  quaternionConjugate,
  quaternionRotate,
} from '@danielsimonjr/mathts-functions';
import { BODY_FIELDS, type BodyTypeRecord, type World } from '@danielsimonjr/physjs-core';

const LINEAR = BODY_FIELDS.linearVelocity.components;
const ANGULAR = BODY_FIELDS.angularVelocity.components;
const ORIENTATION = BODY_FIELDS.rotation.components;

/** Offsets into a sample buffer, sized from the velocity columns of `BODY_FIELDS`. */
export const SAMPLE_LAYOUT = Object.freeze({
  /** Linear acceleration, m/s^2, one number per linear velocity component. */
  linear: 0,
  /** Angular acceleration, rad/s^2, one number per angular velocity component. */
  angular: LINEAR,
  /** Factor `1 / (1 + c dt)` on the new linear velocity. */
  linearFactor: LINEAR + ANGULAR,
  /** Factor `1 / (1 + c dt)` on the new angular velocity. */
  angularFactor: LINEAR + ANGULAR + 1,
  /** Buffer length. */
  length: LINEAR + ANGULAR + 2,
});

/** Whether any of `count` numbers of `column` from `start` is non-zero. */
function anyNonZero(column: Float64Array, start: number, count: number): boolean {
  for (let k = start; k < start + count; k++) if (column[k] !== 0) return true;
  return false;
}

/**
 * World angular acceleration `R I^-1 R^T tau` of a body with orientation `q`
 * and principal inverse inertia `inverseInertia` (body frame).
 */
function angularAcceleration(
  q: readonly number[],
  inverseInertia: readonly number[],
  torque: readonly number[]
): number[] {
  const local = quaternionRotate(quaternionConjugate(q), torque);
  return quaternionRotate(q, dotMultiply(local, inverseInertia) as number[]);
}

/**
 * Writes the sample of body `slot` into `out`. A body that is not dynamic gets
 * zero acceleration and no damping, so it moves by its own velocities.
 */
export function loadSample(
  world: World,
  slot: number,
  row: BodyTypeRecord,
  dt: number,
  out: Float64Array
): void {
  out.fill(0);
  out[SAMPLE_LAYOUT.linearFactor] = 1;
  out[SAMPLE_LAYOUT.angularFactor] = 1;
  if (!row.dynamic) return;
  const { fields } = world.bodies;
  const inverseMass = fields.inverseMass[slot]!;
  const gravityScale = fields.gravityScale[slot]!;
  for (let k = 0; k < LINEAR; k++) {
    out[SAMPLE_LAYOUT.linear + k] =
      world.gravity[k]! * gravityScale + fields.force[slot * LINEAR + k]! * inverseMass;
  }
  const at = slot * ANGULAR;
  if (anyNonZero(fields.torque, at, ANGULAR)) {
    const q = Array.from(fields.rotation.subarray(slot * ORIENTATION, (slot + 1) * ORIENTATION));
    const inverseInertia = Array.from(fields.inverseInertia.subarray(at, at + ANGULAR));
    const torque = Array.from(fields.torque.subarray(at, at + ANGULAR));
    out.set(angularAcceleration(q, inverseInertia, torque), SAMPLE_LAYOUT.angular);
  }
  out[SAMPLE_LAYOUT.linearFactor] = 1 / (1 + dt * fields.linearDamping[slot]!);
  out[SAMPLE_LAYOUT.angularFactor] = 1 / (1 + dt * fields.angularDamping[slot]!);
}
