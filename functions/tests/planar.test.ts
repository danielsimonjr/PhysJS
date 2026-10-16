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
  getLinearVelocity,
  getPosition,
  getRotation,
  raycast,
  restore,
  setRotation,
  snapshot,
  step,
  type ShapeDescriptor,
  type World,
} from '../src/index';

const dt = 1 / 60;
const near = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(tol);

function ground(world: World): void {
  const g = addBody(world, { type: 'static', position: [0, -1] });
  addCollider(world, g, { shape: { type: 'rectangle', halfExtents: [20, 1] }, density: 1 });
}

function drop(world: World, shape: ShapeDescriptor, position: number[]) {
  const body = addBody(world, { type: 'dynamic', position });
  addCollider(world, body, { shape, density: 1000 });
  return body;
}

const run = (world: World, seconds: number) => {
  for (let i = 0; i < Math.round(seconds / dt); i++) step(world, dt);
};

describe('2-D worlds (dims: 2)', () => {
  it('reads and writes [x, y] vectors and an angle, and lifts gravity', () => {
    const world = createWorld({ dims: 2, gravity: [0, -10] });
    expect(Array.from(world.gravity)).toEqual([0, -10, 0]);
    const body = addBody(world, { type: 'dynamic', position: [1, 2], rotation: [0.5] });
    expect(getPosition(world, body)).toEqual([1, 2]);
    near(getRotation(world, body)[0]!, 0.5);
    setRotation(world, body, [3]);
    near(getRotation(world, body)[0]!, 3);
    expect(() => addBody(world, { type: 'dynamic', position: [1, 2, 3] })).toThrow();
  });

  it('only accepts 2-D shapes and joints its row allows', () => {
    const world = createWorld({ dims: 2 });
    const body = addBody(world, { type: 'dynamic' });
    expect(() =>
      addCollider(world, body, { shape: { type: 'sphere', radius: 1 }, density: 1 })
    ).toThrow(RangeError);
    const other = addBody(world, { type: 'dynamic', position: [0, 2] });
    expect(() =>
      addJoint(world, {
        type: 'hinge',
        bodyA: body,
        bodyB: other,
        anchorA: [0, 1],
        axis: [0, 0, 1],
      })
    ).toThrow(RangeError);
    const world3 = createWorld({ dims: 3 });
    const b3 = addBody(world3, { type: 'dynamic' });
    expect(() =>
      addCollider(world3, b3, { shape: { type: 'circle', radius: 1 }, density: 1 })
    ).toThrow(RangeError);
  });

  it('validates polygons: convex, counter-clockwise, centred', () => {
    const world = createWorld({ dims: 2 });
    const body = addBody(world, { type: 'dynamic' });
    const poly = (vertices: number[][]) => () =>
      addCollider(world, body, { shape: { type: 'polygon', vertices }, density: 1 });
    expect(
      poly([
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ])
    ).not.toThrow();
    expect(
      poly([
        [-1, -1],
        [-1, 1],
        [1, 1],
        [1, -1],
      ])
    ).toThrow();
    expect(
      poly([
        [-1, -1],
        [1, -1],
        [0, -0.5],
        [1, 1],
        [-1, 1],
      ])
    ).toThrow();
    expect(
      poly([
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2],
      ])
    ).toThrow(RangeError);
    expect(
      poly([
        [0, 0],
        [1, 0],
      ])
    ).toThrow();
  });

  it('rejects a star polygon, whose turns all go left but wind twice', () => {
    const world = createWorld({ dims: 2 });
    const body = addBody(world, { type: 'dynamic' });
    const vertices = [0, 2, 4, 1, 3].map((k) => [
      Math.cos((2 * Math.PI * k) / 5),
      Math.sin((2 * Math.PI * k) / 5),
    ]);
    expect(() =>
      addCollider(world, body, { shape: { type: 'polygon', vertices }, density: 1 })
    ).toThrow(RangeError);
  });

  it('locks rotation to the z axis through infinite x and y inertia', () => {
    const world = createWorld({ dims: 2, gravity: [0, 0] });
    const body = drop(world, { type: 'rectangle', halfExtents: [1, 1] }, [0, 0]);
    applyTorque(world, body, [10]);
    step(world, dt);
    expect(getAngularVelocity(world, body)).toHaveLength(1);
    expect(getAngularVelocity(world, body)[0]!).toBeGreaterThan(0);
    expect(Array.from(world.bodies.fields.angularVelocity.subarray(0, 2))).toEqual([0, 0]);
  });

  it('a circle comes to rest on a rectangle with in-plane contacts', () => {
    const world = createWorld({ dims: 2 });
    ground(world);
    const ball = drop(world, { type: 'circle', radius: 0.5 }, [0, 2]);
    run(world, 3);
    near(getPosition(world, ball)[1]!, 0.5, 0.02);
    for (const m of findContacts(world)) {
      expect(m.normal[2]).toBe(0);
      expect(m.points).toHaveLength(1);
      for (const p of m.points) expect(p.position[2]).toBe(0);
    }
  });

  it('stacks rectangles, a capsule and a polygon without drifting out of plane', () => {
    const world = createWorld({ dims: 2 });
    ground(world);
    const shapes: ShapeDescriptor[] = [
      { type: 'rectangle', halfExtents: [0.5, 0.5] },
      { type: 'rectangle', halfExtents: [0.5, 0.5] },
      {
        type: 'polygon',
        vertices: [
          [-0.5, -0.5],
          [0.5, -0.5],
          [0.5, 0.5],
          [-0.5, 0.5],
        ],
      },
    ];
    const bodies = shapes.map((shape, i) => drop(world, shape, [0, 0.5 + i * 1.01]));
    const pill = drop(world, { type: 'capsule2d', radius: 0.25, halfHeight: 0.5 }, [4, 1]);
    run(world, 4);
    bodies.forEach((body, i) => {
      const [x, y] = getPosition(world, body);
      near(x!, 0, 0.05);
      near(y!, 0.5 + i, 0.05);
    });
    expect(getPosition(world, pill)[1]!).toBeGreaterThan(0.2);
    const manifold = findContacts(world).find((m) => m.points.length > 1)!;
    expect(manifold.points).toHaveLength(2);
    for (let slot = 0; slot < world.bodies.capacity; slot++) {
      expect(world.bodies.fields.position[slot * 3 + 2]).toBe(0);
    }
  });

  it('raycasts polygons in the plane', () => {
    const world = createWorld({ dims: 2 });
    const body = addBody(world, { type: 'static', position: [0, 0] });
    const collider = addCollider(world, body, {
      shape: {
        type: 'polygon',
        vertices: [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ],
      },
      density: 1,
    });
    const hit = raycast(world, [5, 0.5], [-1, 0])!;
    expect(hit.collider).toBe(collider);
    near(hit.distance, 4.5);
    near(hit.normal[0], Math.SQRT1_2);
    near(hit.normal[1], Math.SQRT1_2);
    expect(raycast(world, [5, 2], [-1, 0])).toBeUndefined();
  });

  it('swings a pin-jointed (spherical) pendulum in the plane and round-trips a snapshot', () => {
    const world = createWorld({ dims: 2 });
    const pivot = addBody(world, { type: 'static', position: [0, 0] });
    const bob = drop(world, { type: 'circle', radius: 0.1 }, [1, 0]);
    addJoint(world, { type: 'spherical', bodyA: pivot, bodyB: bob, anchorA: [0, 0] });
    run(world, 1);
    const [x, y] = getPosition(world, bob);
    near(Math.hypot(x!, y!), 1, 0.02);
    const saved = snapshot(world);
    const before = checksum(world);
    run(world, 0.5);
    const after = getLinearVelocity(world, bob);
    const copy = createWorld({ dims: 2 });
    restore(copy, saved);
    expect(checksum(copy)).toBe(before);
    run(copy, 0.5);
    expect(getLinearVelocity(copy, bob)).toEqual(after);
  });
});
