import { describe, expect, it } from 'bun:test';
import {
  addBody,
  addCollider,
  addJoint,
  applyTorque,
  checksum,
  createWorld,
  findContacts,
  getAngularVelocity,
  getJoint,
  getPosition,
  getRotation,
  removeBody,
  removeJoint,
  restore,
  setAngularVelocity,
  setLinearVelocity,
  snapshot,
  step,
  type BodyHandle,
  type JointDescriptor,
  type World,
} from '../src/index';

const dt = 1 / 60;
const run = (world: World, steps: number, each?: (i: number) => void) => {
  for (let i = 0; i < steps; i++) {
    step(world, dt);
    each?.(i);
  }
};
const distance = (a: readonly number[], b: readonly number[]) =>
  Math.hypot(...a.map((x, k) => x - b[k]!));

function ball(world: World, position: number[], radius = 0.2): BodyHandle {
  const body = addBody(world, { type: 'dynamic', position });
  addCollider(world, body, { shape: { type: 'sphere', radius }, density: 1000 });
  return body;
}

describe('joints', () => {
  it('a spherical joint keeps a pendulum at its length', () => {
    const world = createWorld({ dims: 3 });
    const pivot = addBody(world, { type: 'static' });
    const bob = ball(world, [1, 0, 0]);
    addJoint(world, { type: 'spherical', bodyA: pivot, bodyB: bob, anchorA: [0, 0, 0] });
    let lowest = 0;
    run(world, 120, () => {
      const p = getPosition(world, bob);
      // Velocity rows with Baumgarte drift correction: a few percent at dt = 1/60.
      expect(Math.abs(distance(p, [0, 0, 0]) - 1)).toBeLessThan(0.02);
      lowest = Math.min(lowest, p[1]!);
    });
    expect(lowest).toBeLessThan(-0.9);
  });

  it('a hinge only lets the body turn about its axis', () => {
    const world = createWorld({ dims: 3, gravity: [0, 0, 0] });
    const frame = addBody(world, { type: 'static' });
    const door = addBody(world, { type: 'dynamic', position: [0.5, 0, 0] });
    addCollider(world, door, { shape: { type: 'box', halfExtents: [0.5, 1, 0.05] }, density: 100 });
    addJoint(world, {
      type: 'hinge',
      bodyA: frame,
      bodyB: door,
      anchorA: [0, 0, 0],
      axis: [0, 1, 0],
    });
    run(world, 60, () => {
      applyTorque(world, door, [5, 5, 5]);
    });
    const w = getAngularVelocity(world, door);
    expect(Math.abs(w[0]!)).toBeLessThan(1e-3);
    expect(Math.abs(w[2]!)).toBeLessThan(1e-3);
    expect(w[1]!).toBeGreaterThan(0.1);
    // The hinge point stays put: the door's centre stays 0.5 from the axis, at y = 0.
    const p = getPosition(world, door);
    expect(Math.abs(Math.hypot(p[0]!, p[2]!) - 0.5)).toBeLessThan(0.01);
    expect(Math.abs(p[1]!)).toBeLessThan(0.01);
  });

  it('a fixed joint holds the relative pose of two falling, spinning bodies', () => {
    const world = createWorld({ dims: 3 });
    const a = ball(world, [0, 10, 0]);
    const b = ball(world, [1, 10, 0]);
    addJoint(world, { type: 'fixed', bodyA: a, bodyB: b, anchorA: [0.5, 10, 0] });
    setAngularVelocity(world, a, [0, 0, 2]);
    setLinearVelocity(world, b, [0, 1, 0]);
    run(world, 90);
    expect(Math.abs(distance(getPosition(world, a), getPosition(world, b)) - 1)).toBeLessThan(0.02);
    const qa = getRotation(world, a);
    const qb = getRotation(world, b);
    const align = Math.abs(qa.reduce((s, x, k) => s + x * qb[k]!, 0));
    expect(align).toBeGreaterThan(0.999);
  });

  it('a spring oscillates with period 2 pi sqrt(m / k)', () => {
    const world = createWorld({ dims: 3, gravity: [0, 0, 0] });
    const wall = addBody(world, { type: 'static' });
    const mass = addBody(world, { type: 'dynamic', mass: 2, position: [1.5, 0, 0] });
    const k = 50;
    addJoint(world, {
      type: 'spring',
      bodyA: wall,
      bodyB: mass,
      anchorA: [0, 0, 0],
      anchorB: [1.5, 0, 0],
      stiffness: k,
      restLength: 1,
    });
    const crossings: number[] = [];
    let previous = getPosition(world, mass)[0]! - 1;
    run(world, 300, (i) => {
      const x = getPosition(world, mass)[0]! - 1;
      if (previous > 0 && x <= 0) crossings.push((i + 1) * dt);
      previous = x;
    });
    const period = crossings[1]! - crossings[0]!;
    expect(Math.abs(period - 2 * Math.PI * Math.sqrt(2 / k)) / period).toBeLessThan(0.02);
  });

  it('jointed bodies stop colliding unless collideConnected', () => {
    for (const collideConnected of [false, true]) {
      const world = createWorld({ dims: 3 });
      const a = ball(world, [0, 0, 0], 0.5);
      const b = ball(world, [0.8, 0, 0], 0.5);
      addJoint(world, {
        type: 'spherical',
        bodyA: a,
        bodyB: b,
        anchorA: [0.4, 0, 0],
        collideConnected,
      });
      expect(findContacts(world)).toHaveLength(collideConnected ? 1 : 0);
    }
  });

  it('validates descriptors against the JOINT_TYPES row', () => {
    const world = createWorld({ dims: 3 });
    const a = ball(world, [0, 0, 0]);
    const b = ball(world, [1, 0, 0]);
    const base = { bodyA: a, bodyB: b, anchorA: [0, 0, 0] };
    const bad = (d: Record<string, unknown>) => () =>
      addJoint(world, d as unknown as JointDescriptor);
    expect(bad({ ...base, type: 'weld' })).toThrow(RangeError);
    expect(bad({ ...base, type: 'hinge' })).toThrow(TypeError);
    expect(bad({ ...base, type: 'hinge', axis: [0, 0, 0] })).toThrow(RangeError);
    expect(bad({ ...base, type: 'fixed', axis: [0, 1, 0] })).toThrow(TypeError);
    expect(bad({ ...base, type: 'spring', stiffness: -1 })).toThrow(RangeError);
    expect(bad({ ...base, bodyB: a, type: 'fixed' })).toThrow(RangeError);
    const spring = addJoint(world, { ...base, anchorB: [1, 0, 0], type: 'spring', stiffness: 1 });
    expect(getJoint(world, spring)!.restLength).toBe(1);
    expect(getJoint(world, spring)!.damping).toBe(0);
  });

  it('removeJoint and removeBody drop joints', () => {
    const world = createWorld({ dims: 3 });
    const a = ball(world, [0, 0, 0]);
    const b = ball(world, [1, 0, 0]);
    const j = addJoint(world, { type: 'fixed', bodyA: a, bodyB: b, anchorA: [0.5, 0, 0] });
    removeJoint(world, j);
    expect(getJoint(world, j)).toBeUndefined();
    expect(() => removeJoint(world, j)).toThrow(RangeError);
    const k = addJoint(world, { type: 'fixed', bodyA: a, bodyB: b, anchorA: [0.5, 0, 0] });
    removeBody(world, b);
    expect(getJoint(world, k)).toBeUndefined();
    run(world, 2);
  });
});

describe('snapshot, restore and checksum', () => {
  function scene(): { world: World; bodies: BodyHandle[] } {
    const world = createWorld({ dims: 3 });
    const ground = addBody(world, { type: 'static', position: [0, -1, 0] });
    addCollider(world, ground, { shape: { type: 'box', halfExtents: [10, 1, 10] }, density: 1 });
    const bodies = [0, 1, 2].map((i) => {
      const body = addBody(world, { type: 'dynamic', position: [i * 0.3, 0.6 + i * 1.1, 0] });
      addCollider(world, body, {
        shape: { type: 'box', halfExtents: [0.5, 0.5, 0.5] },
        density: 500,
        restitution: 0.3,
      });
      return body;
    });
    const pivot = addBody(world, { type: 'static', position: [3, 3, 0] });
    const bob = ball(world, [4, 3, 0]);
    addJoint(world, { type: 'spherical', bodyA: pivot, bodyB: bob, anchorA: [3, 3, 0] });
    return { world, bodies: [...bodies, bob] };
  }

  it('a restored world replays bit for bit', () => {
    const { world, bodies } = scene();
    run(world, 30);
    const saved = snapshot(world);
    const before = checksum(world);
    run(world, 60);
    const after = checksum(world);
    const positions = bodies.map((b) => getPosition(world, b));
    expect(after).not.toBe(before);
    restore(world, saved);
    expect(checksum(world)).toBe(before);
    run(world, 60);
    expect(checksum(world)).toBe(after);
    bodies.forEach((b, i) => expect(getPosition(world, b)).toEqual(positions[i]!));
  });

  it('restores into a fresh world and keeps Infinity, -0 and handles', () => {
    const { world, bodies } = scene();
    run(world, 10);
    const copy = createWorld({ dims: 3 });
    restore(copy, snapshot(world));
    expect(checksum(copy)).toBe(checksum(world));
    expect(getPosition(copy, bodies[0]!)).toEqual(getPosition(world, bodies[0]!));
    expect(Object.is(copy.bodies.fields.mass[0], Infinity)).toBe(true);
    world.bodies.fields.linearDamping[0] = -0;
    restore(copy, snapshot(world));
    expect(Object.is(copy.bodies.fields.linearDamping[0], -0)).toBe(true);
    run(copy, 10);
    run(world, 10);
    expect(checksum(copy)).toBe(checksum(world));
  });

  it('rejects truncated or foreign data', () => {
    const { world } = scene();
    const saved = new Uint8Array(snapshot(world));
    expect(() => restore(world, saved.slice(0, saved.length - 3))).toThrow(RangeError);
    expect(() => restore(world, new Uint8Array([200]))).toThrow(RangeError);
    const garbled = saved.slice();
    garbled[30] = garbled[30]! ^ 0xff;
    expect(() => restore(world, garbled)).toThrow(RangeError);
  });
});
