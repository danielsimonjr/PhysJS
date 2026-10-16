import { describe, expect, it } from 'bun:test';
import { quaternionFromAxisAngle } from '@danielsimonjr/mathts-functions';
import { INTEGRATOR_CATALOG } from '@danielsimonjr/physjs-core';
import { INTEGRATORS } from '../src/dynamics/integrators';
import {
  addBody,
  applyForce,
  applyTorque,
  bodyCount,
  createWorld,
  getAngularVelocity,
  getLinearVelocity,
  getPosition,
  getRotation,
  removeBody,
  setPosition,
  step,
} from '../src/index';

const dt = 1 / 60;

const close = (actual: ArrayLike<number>, expected: ArrayLike<number>, tol = 1e-12) => {
  expect(actual.length).toBe(expected.length);
  for (let k = 0; k < expected.length; k++) {
    expect(Math.abs(actual[k]! - expected[k]!)).toBeLessThanOrEqual(tol);
  }
};

describe('INTEGRATORS', () => {
  it('has one function per catalog entry and nothing else', () => {
    expect(Object.keys(INTEGRATORS).sort()).toEqual(INTEGRATOR_CATALOG.map((r) => r.name).sort());
    expect(Object.isFrozen(INTEGRATORS)).toBe(true);
  });
});

describe('step', () => {
  it('advances free fall by the semi-implicit Euler recurrence', () => {
    const g = -9.80665;
    const world = createWorld({ dims: 3, gravity: [0, g, 0] });
    const h = addBody(world, { type: 'dynamic', mass: 1, position: [0, 100, 0] });
    const n = 120;
    for (let i = 0; i < n; i++) step(world, dt);
    // v_n = n g dt; y_n = y_0 + g dt^2 n (n + 1) / 2 (velocity first, then position).
    close(getLinearVelocity(world, h), [0, n * g * dt, 0]);
    close(getPosition(world, h), [0, 100 + (g * dt * dt * n * (n + 1)) / 2, 0], 1e-9);
    expect(world.steps).toBe(n);
    expect(world.time).toBeCloseTo(n * dt, 12);
  });

  it('leads the exact parabola by g t dt / 2, the documented first-order error', () => {
    const g = -10;
    const world = createWorld({ dims: 3, gravity: [0, g, 0] });
    const h = addBody(world, { type: 'dynamic', mass: 5 });
    const n = 600;
    for (let i = 0; i < n; i++) step(world, dt);
    const t = n * dt;
    const exact = 0.5 * g * t * t;
    close(getPosition(world, h), [0, exact + 0.5 * g * t * dt, 0], 1e-9);
  });

  it('scales gravity per body', () => {
    const world = createWorld({ dims: 3, gravity: [0, -10, 0] });
    const still = addBody(world, { type: 'dynamic', mass: 1, gravityScale: 0 });
    const up = addBody(world, { type: 'dynamic', mass: 1, gravityScale: -0.5 });
    step(world, 0.1);
    close(getLinearVelocity(world, still), [0, 0, 0]);
    close(getLinearVelocity(world, up), [0, 0.5, 0]);
  });

  it('moves kinematic-velocity bodies at their own velocity, ignoring gravity and loads', () => {
    const world = createWorld({ dims: 3 });
    const h = addBody(world, { type: 'kinematic-velocity', linearVelocity: [1, 0, 0] });
    applyForce(world, h, [100, 100, 100]);
    for (let i = 0; i < 10; i++) step(world, 0.1);
    close(getLinearVelocity(world, h), [1, 0, 0]);
    close(getPosition(world, h), [1, 0, 0]);
  });

  it('never moves static or kinematic-position bodies, except where the caller puts them', () => {
    const world = createWorld({ dims: 3 });
    const s = addBody(world, { type: 'static', position: [0, 1, 0] });
    const k = addBody(world, { type: 'kinematic-position' });
    applyForce(world, s, [0, 50, 0]);
    step(world, dt);
    setPosition(world, k, [3, 0, 0]);
    step(world, dt);
    expect(getPosition(world, s)).toEqual([0, 1, 0]);
    expect(getPosition(world, k)).toEqual([3, 0, 0]);
  });

  it('applies force / mass for one step and then clears the accumulator', () => {
    const world = createWorld({ dims: 3, gravity: [0, 0, 0] });
    const h = addBody(world, { type: 'dynamic', mass: 4 });
    applyForce(world, h, [8, 0, 0]);
    applyForce(world, h, [4, 0, 0]);
    step(world, 0.5);
    close(getLinearVelocity(world, h), [1.5, 0, 0]);
    step(world, 0.5);
    close(getLinearVelocity(world, h), [1.5, 0, 0]);
  });

  it('damps velocity by 1 / (1 + c dt) per step', () => {
    const world = createWorld({ dims: 3, gravity: [0, 0, 0] });
    const h = addBody(world, {
      type: 'dynamic',
      mass: 1,
      inertia: [1, 1, 1],
      linearVelocity: [2, 0, 0],
      angularVelocity: [0, 3, 0],
      linearDamping: 0.5,
      angularDamping: 2,
    });
    const n = 30;
    for (let i = 0; i < n; i++) step(world, dt);
    close(getLinearVelocity(world, h), [2 / (1 + 0.5 * dt) ** n, 0, 0]);
    close(getAngularVelocity(world, h), [0, 3 / (1 + 2 * dt) ** n, 0]);
  });

  it('turns the orientation exactly through |w| t about a constant angular velocity', () => {
    const world = createWorld({ dims: 3 });
    const axis = [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)];
    const rate = 2.5;
    const h = addBody(world, {
      type: 'kinematic-velocity',
      angularVelocity: axis.map((a) => a * rate),
    });
    const n = 90;
    for (let i = 0; i < n; i++) step(world, dt);
    close(getRotation(world, h), quaternionFromAxisAngle(axis, rate * n * dt), 1e-12);
  });

  it('keeps the rotation a unit quaternion over a long spin', () => {
    const world = createWorld({ dims: 3 });
    const h = addBody(world, { type: 'kinematic-velocity', angularVelocity: [0.3, -7, 2] });
    for (let i = 0; i < 10_000; i++) step(world, dt);
    const q = getRotation(world, h);
    expect(Math.abs(Math.hypot(...q) - 1)).toBeLessThan(1e-12);
  });

  it('turns a world torque into angular acceleration through the rotated principal inertia', () => {
    const world = createWorld({ dims: 3, gravity: [0, 0, 0] });
    // Rotated a quarter turn about +Z: body +X points along world +Y, body +Y along world -X.
    const rotation = quaternionFromAxisAngle([0, 0, 1], Math.PI / 2);
    const h = addBody(world, { type: 'dynamic', mass: 1, inertia: [1, 2, 4], rotation });
    applyTorque(world, h, [0, 1, 0]); // about body +X, inertia 1
    applyTorque(world, h, [2, 0, 0]); // about body -Y, inertia 2
    applyTorque(world, h, [0, 0, 8]); // about body +Z, inertia 4
    const tiny = 1e-3;
    step(world, tiny);
    close(getAngularVelocity(world, h), [tiny * 1, tiny * 1, tiny * 2], 1e-15);
  });

  it('does not rotate a body whose inertia was omitted (rotation locked)', () => {
    const world = createWorld({ dims: 3 });
    const h = addBody(world, { type: 'dynamic', mass: 1 });
    applyTorque(world, h, [5, 5, 5]);
    step(world, dt);
    expect(getAngularVelocity(world, h)).toEqual([0, 0, 0]);
    expect(getRotation(world, h)).toEqual([1, 0, 0, 0]);
  });

  it('is deterministic: identical inputs give bit-identical states', () => {
    const run = () => {
      const world = createWorld({ dims: 3 });
      const h = addBody(world, {
        type: 'dynamic',
        mass: 3,
        inertia: [1, 2, 3],
        linearVelocity: [1, 2, 3],
        angularVelocity: [0.1, 0.2, 0.3],
        linearDamping: 0.1,
      });
      for (let i = 0; i < 200; i++) {
        applyTorque(world, h, [Math.sin(i), Math.cos(i), 0]);
        step(world, dt);
      }
      return [...getPosition(world, h), ...getRotation(world, h), ...getAngularVelocity(world, h)];
    };
    expect(run()).toEqual(run());
  });

  it('rejects a time step that is not a positive finite number', () => {
    const world = createWorld({ dims: 3 });
    for (const bad of [0, -dt, NaN, Infinity]) expect(() => step(world, bad)).toThrow(RangeError);
    expect(world.steps).toBe(0);
  });

  it('skips removed bodies', () => {
    const world = createWorld({ dims: 3 });
    const a = addBody(world, { type: 'dynamic', mass: 1 });
    const b = addBody(world, { type: 'dynamic', mass: 1 });
    removeBody(world, a);
    step(world, dt);
    expect(bodyCount(world)).toBe(1);
    expect(getLinearVelocity(world, b)[1]).toBeLessThan(0);
  });
});

describe('applyForce / applyTorque', () => {
  it('reject non-finite or wrongly sized loads and stale handles', () => {
    const world = createWorld({ dims: 3 });
    const h = addBody(world, { type: 'dynamic', mass: 1 });
    expect(() => applyForce(world, h, [1, 2])).toThrow(TypeError);
    expect(() => applyTorque(world, h, [NaN, 0, 0])).toThrow(RangeError);
    removeBody(world, h);
    expect(() => applyForce(world, h, [1, 0, 0])).toThrow(RangeError);
  });
});
