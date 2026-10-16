/**
 * Joint rows, built from the `JOINT_TYPES` modes: one builder per linear mode
 * and one per angular mode, so a joint type is the pair of its modes. Locked
 * modes add velocity rows whose target removes the drift (Baumgarte with
 * `SOLVER_DEFAULTS.jointBaumgarte`); the spring mode adds a load before the
 * velocity phase instead.
 */

import {
  quaternionConjugate,
  quaternionMultiply,
  quaternionRotate,
} from '@danielsimonjr/mathts-functions';
import {
  BODY_FIELDS,
  JOINT_TYPES,
  SOLVER_DEFAULTS,
  type AngularMode,
  type JointRecord,
  type LinearMode,
  type World,
} from '@danielsimonjr/physjs-core';
import { add, cross, dot, length, neg, scale, sub, unit, AXES } from '../collision/vector';
import { requireSlot } from '../world/handles';
import {
  makeRow,
  responds,
  tangents,
  type JointRowBuilder,
  type Row,
  type SolverBody,
} from '../dynamics/solver';

type Quat = Parameters<typeof quaternionRotate>[0];
type Vec3 = Parameters<typeof quaternionRotate>[1];
const rotate = (q: readonly number[], v: readonly number[]): number[] =>
  quaternionRotate(q as unknown as Quat, v as unknown as Vec3);

const MODES = new Map<string, { linear: LinearMode; angular: AngularMode }>(
  JOINT_TYPES.map((row) => [row.name, { linear: row.linear, angular: row.angular }])
);

/** World anchor points of a joint for the given body poses. */
function anchors(joint: JointRecord, a: SolverBody, b: SolverBody): [number[], number[]] {
  return [
    add(a.position, rotate(a.rotation, joint.localAnchorA)),
    add(b.position, rotate(b.rotation, joint.localAnchorB)),
  ];
}

type RowsFn = (joint: JointRecord, a: SolverBody, b: SolverBody, dt: number) => Row[];

/** Rows of each linear mode. */
const LINEAR_ROWS: Readonly<Record<LinearMode, RowsFn>> = {
  locked: (joint, a, b, dt) => {
    const [pA, pB] = anchors(joint, a, b);
    const error = sub(pB, pA);
    const beta = SOLVER_DEFAULTS.jointBaumgarte / dt;
    // Rows through each anchor: the lever arms differ, so build them per body.
    return AXES.map((axis, k) =>
      makeRow(
        a,
        b,
        [...axis],
        cross(sub(pA, a.position), axis),
        cross(sub(pB, b.position), axis),
        () => -beta * error[k]!
      )
    );
  },
  spring: () => [],
  free: () => [],
};

/** Small-angle rotation vector of the unit quaternion `q` (shortest way). */
function rotationVector(q: readonly number[]): number[] {
  const sign = q[0]! < 0 ? -2 : 2;
  return [q[1]! * sign, q[2]! * sign, q[3]! * sign];
}

const angularRow = (a: SolverBody, b: SolverBody, d: number[], target: number) =>
  makeRow(a, b, [0, 0, 0], d, d, () => target);

/** Rows of each angular mode. */
const ANGULAR_ROWS: Readonly<Record<AngularMode, RowsFn>> = {
  locked: (joint, a, b, dt) => {
    // Error: the rotation from B's target orientation qA * reference to qB, world frame.
    const target = quaternionMultiply(
      a.rotation as unknown as Quat,
      joint.reference as unknown as Quat
    );
    const error = rotationVector(
      quaternionMultiply(
        b.rotation as unknown as Quat,
        quaternionConjugate(target as unknown as Quat) as unknown as Quat
      ) as unknown as number[]
    );
    const beta = SOLVER_DEFAULTS.jointBaumgarte / dt;
    return AXES.map((axis, k) => angularRow(a, b, [...axis], -beta * error[k]!));
  },
  hinge: (joint, a, b, dt) => {
    const axisA = rotate(a.rotation, joint.localAxisA);
    const axisB = rotate(b.rotation, joint.localAxisB);
    const error = cross(axisA, axisB);
    const beta = SOLVER_DEFAULTS.jointBaumgarte / dt;
    return tangents(axisA).map((t) => angularRow(a, b, t, -beta * dot(error, t)));
  },
  free: () => [],
};

/** Every joint's velocity rows for this step. */
export const jointRows: JointRowBuilder = (world, bodyOf, dt) =>
  [...world.joints.byHandle.values()].flatMap((joint) => {
    const a = bodyOf(joint.bodyA);
    const b = bodyOf(joint.bodyB);
    if (a.inverseMass === 0 && b.inverseMass === 0) return [];
    const modes = MODES.get(joint.type)!;
    return [
      ...LINEAR_ROWS[modes.linear](joint, a, b, dt),
      ...ANGULAR_ROWS[modes.angular](joint, a, b, dt),
    ];
  });

/**
 * Adds the spring loads of every `spring`-mode joint to the bodies' force and
 * torque accumulators: `F = (k (l - rest) + c dl/dt)` along the anchor line,
 * pulling the anchors together when stretched.
 */
export function applySpringLoads(world: World): void {
  const { fields } = world.bodies;
  const LINEAR = BODY_FIELDS.force.components;
  for (const joint of world.joints.byHandle.values()) {
    if (MODES.get(joint.type)!.linear !== 'spring') continue;
    const slotA = requireSlot(world.bodies, joint.bodyA);
    const slotB = requireSlot(world.bodies, joint.bodyB);
    const body = (slot: number): SolverBody => {
      const read = (name: 'linearVelocity' | 'angularVelocity' | 'position' | 'rotation') =>
        Array.from(
          fields[name].subarray(
            slot * BODY_FIELDS[name].components,
            (slot + 1) * BODY_FIELDS[name].components
          )
        );
      return {
        slot,
        v: read('linearVelocity'),
        w: read('angularVelocity'),
        position: read('position'),
        rotation: read('rotation'),
        inverseMass: 0,
        inverseInertia: [0, 0, 0],
      };
    };
    const a = body(slotA);
    const b = body(slotB);
    const [pA, pB] = anchors(joint, a, b);
    const n = unit(sub(pB, pA));
    if (n === undefined) continue;
    const rA = sub(pA, a.position);
    const rB = sub(pB, b.position);
    const speed = dot(n, sub(add(b.v, cross(b.w, rB)), add(a.v, cross(a.w, rA))));
    const magnitude =
      joint.stiffness * (length(sub(pB, pA)) - joint.restLength) + joint.damping * speed;
    const force = scale(n, magnitude);
    for (const [slot, f, r] of [
      [slotA, force, rA],
      [slotB, neg(force), rB],
    ] as const) {
      if (!responds(world, slot)) continue;
      const torque = cross(r, f);
      for (let k = 0; k < LINEAR; k++) {
        fields.force[slot * LINEAR + k] = fields.force[slot * LINEAR + k]! + f[k]!;
        fields.torque[slot * LINEAR + k] = fields.torque[slot * LINEAR + k]! + torque[k]!;
      }
    }
  }
}

/** Joint links as body pairs, for waking: a moving body wakes the bodies jointed to it. */
export const jointLinks = (world: World) =>
  [...world.joints.byHandle.values()].map(({ bodyA, bodyB }) => ({ bodyA, bodyB }));
