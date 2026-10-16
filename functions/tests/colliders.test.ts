import { describe, expect, it } from 'bun:test';
import {
  addBody,
  addCollider,
  createWorld,
  getCollider,
  getMass,
  removeBody,
  removeCollider,
  type ColliderHandle,
} from '../src/index';

const PI = Math.PI;
const close = (a: number, b: number) =>
  expect(Math.abs(a - b)).toBeLessThanOrEqual(1e-12 * Math.max(1, Math.abs(b)));
const inertiaOf = (world: ReturnType<typeof createWorld>, slotHandle: number) =>
  Array.from(
    world.bodies.fields.inertia.subarray((slotHandle % 2 ** 24) * 3, (slotHandle % 2 ** 24) * 3 + 3)
  );

describe('addCollider', () => {
  it('a sphere collider sets mass and inertia from density (MathTS massProperties)', () => {
    const world = createWorld({ dims: 3 });
    const ball = addBody(world, { type: 'dynamic' });
    addCollider(world, ball, { shape: { type: 'sphere', radius: 0.5 }, density: 1000 });
    const m = 1000 * (4 / 3) * PI * 0.125;
    close(getMass(world, ball), m);
    for (const i of inertiaOf(world, ball)) close(i, 0.4 * m * 0.25);
  });

  it('box and capsule colliders sum on one body; removal recomputes', () => {
    const world = createWorld({ dims: 3 });
    const body = addBody(world, { type: 'dynamic', mass: 1, inertia: [1, 1, 1] });
    const box = addCollider(world, body, {
      shape: { type: 'box', halfExtents: [1, 2, 3] },
      density: 2,
    });
    close(getMass(world, body), 96);
    const cap = addCollider(world, body, {
      shape: { type: 'capsule', radius: 1, halfHeight: 1 },
      density: 1,
    });
    const capMass = PI * 2 + (4 / 3) * PI;
    close(getMass(world, body), 96 + capMass);
    expect(getCollider(world, cap)?.shape).toEqual({ type: 'capsule', radius: 1, halfHeight: 1 });
    removeCollider(world, cap);
    close(getMass(world, body), 96);
    const [ix, iy, iz] = inertiaOf(world, body);
    close(ix!, (96 * (16 + 36)) / 12);
    close(iy!, (96 * (4 + 36)) / 12);
    close(iz!, (96 * (4 + 16)) / 12);
    // inverse mass refreshed
    close(world.bodies.fields.inverseMass[body % 2 ** 24]!, 1 / 96);
    expect(getCollider(world, box)?.density).toBe(2);
  });

  it('static bodies keep infinite mass', () => {
    const world = createWorld({ dims: 3 });
    const ground = addBody(world, { type: 'static' });
    addCollider(world, ground, {
      shape: { type: 'box', halfExtents: [10, 0.5, 10] },
      density: 1000,
    });
    expect(getMass(world, ground)).toBe(Infinity);
  });

  it('copies typed-array parameters and rejects bad input', () => {
    const world = createWorld({ dims: 3 });
    const body = addBody(world, { type: 'dynamic' });
    const h = addCollider(world, body, {
      shape: { type: 'box', halfExtents: new Float64Array([1, 1, 1]) },
      density: 1,
    });
    expect(getCollider(world, h)?.shape).toEqual({ type: 'box', halfExtents: [1, 1, 1] });
    expect(() =>
      addCollider(world, body, { shape: { type: 'sphere', radius: 1 }, density: 0 })
    ).toThrow(/density/);
    expect(() =>
      addCollider(world, body, { shape: { type: 'sphere', radius: -1 }, density: 1 })
    ).toThrow(/radius/);
    expect(() =>
      addCollider(world, body, {
        shape: { type: 'sphere', radius: 1 },
        density: 1,
        extra: 1,
      } as never)
    ).toThrow(/extra/);
    expect(() => removeCollider(world, 9999 as ColliderHandle)).toThrow(RangeError);
  });

  it('removeBody drops its colliders', () => {
    const world = createWorld({ dims: 3 });
    const body = addBody(world, { type: 'dynamic' });
    const h = addCollider(world, body, { shape: { type: 'sphere', radius: 1 }, density: 1 });
    removeBody(world, body);
    expect(getCollider(world, h)).toBeUndefined();
    expect(() =>
      addCollider(world, body, { shape: { type: 'sphere', radius: 1 }, density: 1 })
    ).toThrow(/stale/);
  });
});
