import { describe, expect, it } from 'bun:test';
import { quaternionFromAxisAngle } from '@danielsimonjr/mathts-functions';
import {
  addBody,
  addCollider,
  colliderAabb,
  createWorld,
  findContacts,
  getCollider,
  overlap,
  pointQuery,
  raycast,
  setPosition,
  type BodyTypeName,
  type ColliderHandle,
  type ShapeDescriptor,
  type World,
} from '../src/index';
import { sweepAndPrune } from '../src/collision/broadphase';

const near = (a: number, b: number, tol = 1e-9) =>
  expect(Math.abs(a - b)).toBeLessThanOrEqual(tol * Math.max(1, Math.abs(b)));
const nearVec = (a: readonly number[], b: readonly number[], tol = 1e-9) =>
  b.forEach((x, k) => near(a[k]!, x, tol));
const turn = (axis: number[], angle: number) =>
  quaternionFromAxisAngle(axis as never, angle) as unknown as number[];

/** A world from rows of `[type, shape, position, rotation?]`; returns world and collider handles. */
function scene(rows: readonly [BodyTypeName, ShapeDescriptor, number[], number[]?][]): {
  world: World;
  colliders: ColliderHandle[];
} {
  const world = createWorld({ dims: 3 });
  const colliders = rows.map(([type, shape, position, rotation]) => {
    const body = addBody(world, {
      type,
      position,
      ...(rotation === undefined ? {} : { rotation }),
    });
    return addCollider(world, body, { shape, density: 1000 });
  });
  return { world, colliders };
}

const ground: [BodyTypeName, ShapeDescriptor, number[]] = [
  'static',
  { type: 'box', halfExtents: [10, 1, 10] },
  [0, 0, 0],
];

describe('findContacts', () => {
  it('a sphere on a box: one point, normal +Y, depth from the overlap', () => {
    const { world, colliders } = scene([
      ground,
      ['dynamic', { type: 'sphere', radius: 0.5 }, [0.3, 1.4, -0.2]],
    ]);
    const [m] = findContacts(world);
    expect(m!.colliderA).toBe(colliders[0]!);
    nearVec(m!.normal, [0, 1, 0]);
    expect(m!.points).toHaveLength(1);
    near(m!.points[0]!.depth, 0.1);
    nearVec(m!.points[0]!.position, [0.3, 0.95, -0.2]);
  });

  it('two spheres: analytic depth and a normal from A to B', () => {
    const { world } = scene([
      ['dynamic', { type: 'sphere', radius: 1 }, [0, 0, 0]],
      ['dynamic', { type: 'sphere', radius: 0.5 }, [1.12, 0.84, 0]],
    ]);
    const [m] = findContacts(world);
    near(m!.points[0]!.depth, 0.1);
    nearVec(m!.normal, [0.8, 0.6, 0]);
  });

  it('a box resting on a box: four corner points at the same depth', () => {
    const { world } = scene([
      ground,
      ['dynamic', { type: 'box', halfExtents: [0.5, 0.5, 0.5] }, [1, 1.49, 2]],
    ]);
    const [m] = findContacts(world);
    nearVec(m!.normal, [0, 1, 0], 1e-7);
    expect(m!.points).toHaveLength(4);
    for (const p of m!.points) {
      near(p.depth, 0.01, 1e-7);
      near(Math.abs(p.position[0]! - 1), 0.5, 1e-7);
      near(Math.abs(p.position[2]! - 2), 0.5, 1e-7);
    }
  });

  it('a tilted box resting on a corner edge: GJK/EPA depth', () => {
    // Rotated 45 degrees about Z, the lowest edge sits sqrt(2)/2 below the centre.
    const y = Math.SQRT1_2 * 1 + 1 - 0.02;
    const { world } = scene([
      ground,
      [
        'dynamic',
        { type: 'box', halfExtents: [0.5, 0.5, 0.5] },
        [0, y, 0],
        turn([0, 0, 1], Math.PI / 4),
      ],
    ]);
    const [m] = findContacts(world);
    nearVec(m!.normal, [0, 1, 0], 1e-6);
    expect(m!.points).toHaveLength(2);
    for (const p of m!.points) near(p.depth, 0.02, 1e-6);
  });

  it('a capsule lying on a box: two points along its axis', () => {
    const { world } = scene([
      ground,
      [
        'dynamic',
        { type: 'capsule', radius: 0.25, halfHeight: 1 },
        [0, 1.2, 0],
        turn([0, 0, 1], Math.PI / 2),
      ],
    ]);
    const [m] = findContacts(world);
    expect(m!.points).toHaveLength(2);
    const xs = m!.points.map((p) => p.position[0]!).sort((a, b) => a - b);
    nearVec(xs, [-1, 1], 1e-7);
    for (const p of m!.points) near(p.depth, 0.05, 1e-7);
  });

  it('parallel capsules: two points over their common span', () => {
    const { world } = scene([
      ['dynamic', { type: 'capsule', radius: 0.5, halfHeight: 1 }, [0, 0, 0]],
      ['dynamic', { type: 'capsule', radius: 0.5, halfHeight: 1 }, [0.9, 0.5, 0]],
    ]);
    const [m] = findContacts(world);
    nearVec(m!.normal, [1, 0, 0]);
    const ys = m!.points.map((p) => p.position[1]!).sort((a, b) => a - b);
    nearVec(ys, [-0.5, 1]);
    for (const p of m!.points) near(p.depth, 0.1);
  });

  it('separated shapes report nothing, and the margin catches near pairs', () => {
    const { world } = scene([ground, ['dynamic', { type: 'sphere', radius: 0.5 }, [0, 1.6, 0]]]);
    expect(findContacts(world)).toHaveLength(0);
    const [m] = findContacts(world, { margin: 0.2 });
    near(m!.points[0]!.depth, -0.1);
  });

  it('skips pairs of non-dynamic bodies and colliders on one body', () => {
    const { world } = scene([ground, ['static', { type: 'sphere', radius: 1 }, [0, 1, 0]]]);
    expect(findContacts(world)).toHaveLength(0);
    const body = addBody(world, { type: 'dynamic', position: [5, 5, 5] });
    addCollider(world, body, { shape: { type: 'sphere', radius: 1 }, density: 1 });
    addCollider(world, body, { shape: { type: 'box', halfExtents: [1, 1, 1] }, density: 1 });
    expect(findContacts(world)).toHaveLength(0);
  });

  it('GJK agrees with the analytic distance for spheres against boxes', () => {
    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    for (let i = 0; i < 50; i++) {
      const centre = [random() * 3, 1.2 + Math.abs(random()), random() * 3];
      const { world } = scene([
        ['static', { type: 'box', halfExtents: [1, 1, 1] }, [0, 0, 0]],
        ['dynamic', { type: 'sphere', radius: 0.4 }, centre],
      ]);
      const clamped = centre.map((c) => Math.max(-1, Math.min(1, c)));
      const gap = Math.hypot(...centre.map((c, k) => c - clamped[k]!)) - 0.4;
      const [m] = findContacts(world, { margin: 10 });
      near(-m!.points[0]!.depth, gap, 1e-7);
    }
  });

  it('EPA agrees with the overlap of axis-aligned boxes', () => {
    let seed = 5;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    for (let i = 0; i < 50; i++) {
      const a = [0.5 + Math.abs(random()), 0.5 + Math.abs(random()), 0.5 + Math.abs(random())];
      const b = [0.5 + Math.abs(random()), 0.5 + Math.abs(random()), 0.5 + Math.abs(random())];
      const centre = [random(), random(), random()];
      const { world } = scene([
        ['static', { type: 'box', halfExtents: a }, [0, 0, 0]],
        ['dynamic', { type: 'box', halfExtents: b }, centre],
      ]);
      const depth = Math.min(...centre.map((c, k) => a[k]! + b[k]! - Math.abs(c)));
      const [m] = findContacts(world);
      near(Math.max(...m!.points.map((p) => p.depth)), depth, 1e-6);
    }
  });

  it('rejects a bad margin', () => {
    const world = createWorld({ dims: 3 });
    expect(() => findContacts(world, { margin: -1 })).toThrow(RangeError);
    expect(() => findContacts(world, { extra: 1 } as never)).toThrow(TypeError);
  });
});

describe('sweepAndPrune', () => {
  it('finds exactly the brute-force overlapping pairs, call after call', () => {
    let seed = 11;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const shapes: ShapeDescriptor[] = [
      { type: 'sphere', radius: 0.6 },
      { type: 'box', halfExtents: [0.5, 0.3, 0.7] },
      { type: 'capsule', radius: 0.3, halfHeight: 0.5 },
    ];
    const { world, colliders } = scene(
      Array.from({ length: 40 }, (_, i) => [
        'dynamic',
        shapes[i % shapes.length]!,
        [random() * 6, random() * 6, random() * 6],
        turn([random(), random(), random()], random() * 6),
      ])
    );
    for (let round = 0; round < 3; round++) {
      const boxes = colliders.map((h) => colliderAabb(world, getCollider(world, h)!));
      const expected: [number, number][] = [];
      colliders.forEach((a, i) =>
        colliders.slice(i + 1).forEach((b, j) => {
          const [p, q] = [boxes[i]!, boxes[i + 1 + j]!];
          if (p.min.every((lo, k) => lo <= q.max[k]! && q.min[k]! <= p.max[k]!))
            expected.push([a, b]);
        })
      );
      expect(sweepAndPrune(world, 0)).toEqual(expected as never);
      for (const h of colliders) {
        const body = getCollider(world, h)!.body;
        setPosition(world, body, [random() * 6, random() * 6, random() * 6]);
      }
    }
  });
});

describe('raycast', () => {
  it('hits the nearest collider with its distance, point and normal', () => {
    const { world, colliders } = scene([
      ground,
      ['dynamic', { type: 'sphere', radius: 0.5 }, [0, 3, 0]],
    ]);
    const hit = raycast(world, [0, 10, 0], [0, -2, 0])!;
    expect(hit.collider).toBe(colliders[1]!);
    near(hit.distance, 6.5);
    nearVec(hit.point, [0, 3.5, 0]);
    nearVec(hit.normal, [0, 1, 0]);
    const side = raycast(world, [3, 10, 0], [0, -1, 0])!;
    expect(side.collider).toBe(colliders[0]!);
    near(side.distance, 9);
    expect(raycast(world, [0, 10, 0], [0, -1, 0], 6)).toBeUndefined();
    expect(raycast(world, [0, 10, 0], [0, 1, 0])).toBeUndefined();
  });

  it('respects rotation: a box turned 45 degrees about Y', () => {
    const { world } = scene([
      ['static', { type: 'box', halfExtents: [1, 1, 1] }, [0, 0, 0], turn([0, 1, 0], Math.PI / 4)],
    ]);
    const hit = raycast(world, [5, 0, 0], [-1, 0, 0])!;
    near(hit.distance, 5 - Math.SQRT2);
  });

  it('hits a capsule on its side and on its cap', () => {
    const { world } = scene([
      ['static', { type: 'capsule', radius: 0.5, halfHeight: 1 }, [0, 0, 0]],
    ]);
    near(raycast(world, [5, 0.5, 0], [-1, 0, 0])!.distance, 4.5);
    const cap = raycast(world, [0, 5, 0], [0, -1, 0])!;
    near(cap.distance, 3.5);
    nearVec(cap.normal, [0, 1, 0]);
  });

  it('a ray starting inside hits at distance 0, facing back', () => {
    const { world } = scene([
      ['static', { type: 'capsule', radius: 0.5, halfHeight: 1 }, [0, 0, 0]],
    ]);
    const hit = raycast(world, [0, 0.3, 0.1], [1, 0, 0])!;
    near(hit.distance, 0);
    nearVec(hit.normal, [-1, 0, 0]);
  });

  it('rejects a zero direction', () => {
    expect(() => raycast(createWorld({ dims: 3 }), [0, 0, 0], [0, 0, 0])).toThrow(RangeError);
  });
});

describe('overlap and pointQuery', () => {
  const rows: [BodyTypeName, ShapeDescriptor, number[], number[]?][] = [
    ['static', { type: 'box', halfExtents: [1, 1, 1] }, [0, 0, 0], turn([0, 1, 0], Math.PI / 4)],
    ['static', { type: 'sphere', radius: 1 }, [5, 0, 0]],
    ['static', { type: 'capsule', radius: 0.5, halfHeight: 1 }, [0, 0, 5]],
  ];

  it('pointQuery returns the colliders containing the point', () => {
    const { world, colliders } = scene(rows);
    expect(pointQuery(world, [1.3, 0, 0])).toEqual([colliders[0]!]);
    expect(pointQuery(world, [1.5, 0, 0])).toEqual([]);
    expect(pointQuery(world, [5, 0.99, 0])).toEqual([colliders[1]!]);
    expect(pointQuery(world, [0.3, 1.3, 5])).toEqual([colliders[2]!]);
    expect(pointQuery(world, [0.4, 1.4, 5.4])).toEqual([]);
  });

  it('overlap returns the colliders touching a placed shape', () => {
    const { world, colliders } = scene(rows);
    expect(overlap(world, { type: 'sphere', radius: 2.2 }, [3, 0, 0])).toEqual([
      colliders[0]!,
      colliders[1]!,
    ]);
    expect(overlap(world, { type: 'box', halfExtents: [0.1, 0.1, 3] }, [0, 0, 2.5])).toEqual([
      colliders[0]!,
      colliders[2]!,
    ]);
    expect(overlap(world, { type: 'sphere', radius: 0.1 }, [3, 3, 3])).toEqual([]);
  });
});
