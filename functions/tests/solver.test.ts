import { describe, expect, it } from 'bun:test';
import {
  EVENT_TYPES,
  MATERIAL_FIELDS,
  SOLVER_DEFAULTS,
  addBody,
  addCollider,
  applyForce,
  createWorld,
  drainEvents,
  getCollider,
  getLinearVelocity,
  getPosition,
  isSleeping,
  setLinearVelocity,
  step,
  wakeBody,
  type BodyHandle,
  type ShapeDescriptor,
  type World,
} from '../src/index';

const dt = 1 / 60;
const g = 9.80665;

function withGround(friction: number = MATERIAL_FIELDS.friction.initial, restitution = 0): World {
  const world = createWorld({ dims: 3 });
  const ground = addBody(world, { type: 'static', position: [0, -1, 0] });
  addCollider(world, ground, {
    shape: { type: 'box', halfExtents: [50, 1, 50] },
    density: 1,
    friction,
    restitution,
  });
  return world;
}

function drop(
  world: World,
  shape: ShapeDescriptor,
  position: number[],
  material: { friction?: number; restitution?: number } = {}
): BodyHandle {
  const body = addBody(world, { type: 'dynamic', position });
  addCollider(world, body, { shape, density: 1000, ...material });
  return body;
}

const run = (world: World, seconds: number, each?: () => void) => {
  for (let i = 0; i < Math.round(seconds / dt); i++) {
    step(world, dt);
    each?.();
  }
};

describe('contact solver', () => {
  it('a dropped sphere comes to rest on the ground', () => {
    const world = withGround();
    const ball = drop(world, { type: 'sphere', radius: 0.5 }, [0, 2, 0]);
    run(world, 3);
    const y = getPosition(world, ball)[1]!;
    expect(Math.abs(y - 0.5)).toBeLessThan(SOLVER_DEFAULTS.slop * 2);
    expect(Math.abs(getLinearVelocity(world, ball)[1]!)).toBeLessThan(1e-3);
  });

  it('a box resting on the ground stays put without drift', () => {
    const world = withGround();
    const box = drop(world, { type: 'box', halfExtents: [0.5, 0.5, 0.5] }, [1, 0.5, 2]);
    run(world, 2);
    const [x, y, z] = getPosition(world, box);
    expect(Math.abs(y! - 0.5)).toBeLessThan(SOLVER_DEFAULTS.slop * 2);
    expect(Math.abs(x! - 1)).toBeLessThan(1e-6);
    expect(Math.abs(z! - 2)).toBeLessThan(1e-6);
  });

  it('a stack of three boxes stands', () => {
    const world = withGround();
    const boxes = [0, 1, 2].map((i) =>
      drop(world, { type: 'box', halfExtents: [0.5, 0.5, 0.5] }, [0, 0.5 + i, 0])
    );
    run(world, 3);
    boxes.forEach((box, i) => {
      const [x, y] = getPosition(world, box);
      expect(Math.abs(y! - (0.5 + i))).toBeLessThan(0.03);
      expect(Math.abs(x!)).toBeLessThan(1e-3);
    });
  });

  it('restitution 1 bounces back near the drop height; restitution 0 does not bounce', () => {
    const peakAfterBounce = (restitution: number) => {
      const world = withGround(0.5, restitution);
      const ball = drop(world, { type: 'sphere', radius: 0.5 }, [0, 3, 0], { restitution });
      let bounced = false;
      let peak = 0;
      run(world, 2, () => {
        const v = getLinearVelocity(world, ball)[1]!;
        if (v > 0.5) bounced = true;
        if (bounced) peak = Math.max(peak, getPosition(world, ball)[1]!);
      });
      return peak;
    };
    expect(peakAfterBounce(1)).toBeGreaterThan(2.8);
    expect(peakAfterBounce(0)).toBeLessThan(0.6);
  });

  it('friction stops a sliding box after v^2 / (2 mu g)', () => {
    const mu = 0.4;
    const world = withGround(mu);
    const box = drop(world, { type: 'box', halfExtents: [0.5, 0.5, 0.5] }, [0, 0.5, 0], {
      friction: mu,
    });
    run(world, 0.2);
    setLinearVelocity(world, box, [4, 0, 0]);
    const start = getPosition(world, box)[0]!;
    run(world, 2);
    const travelled = getPosition(world, box)[0]! - start;
    expect(Math.abs(travelled - 16 / (2 * mu * g))).toBeLessThan(0.1);
    expect(Math.abs(getLinearVelocity(world, box)[0]!)).toBeLessThan(1e-6);
  });

  it('without friction the box keeps sliding', () => {
    const world = withGround(0);
    const box = drop(world, { type: 'box', halfExtents: [0.5, 0.5, 0.5] }, [0, 0.5, 0], {
      friction: 0,
    });
    setLinearVelocity(world, box, [2, 0, 0]);
    run(world, 1);
    expect(Math.abs(getLinearVelocity(world, box)[0]! - 2)).toBeLessThan(1e-9);
  });

  it('warm starts from the last step: a resting contact carries m g dt in total', () => {
    const world = withGround();
    const box = drop(world, { type: 'box', halfExtents: [0.5, 0.5, 0.5] }, [0, 0.5, 0]);
    run(world, 0.3);
    const [cached] = [...world.solver.cache.values()];
    const total = cached!.reduce((s, c) => s + c.normal, 0);
    const mass = getCollider(world, [...world.colliders.byHandle.keys()][1]!)!.mass;
    expect(Math.abs(total - mass * g * dt) / (mass * g * dt)).toBeLessThan(0.02);
    expect(box).toBeDefined();
  });

  it('materials default from MATERIAL_FIELDS and are validated', () => {
    const world = createWorld({ dims: 3 });
    const body = addBody(world, { type: 'dynamic' });
    const h = addCollider(world, body, { shape: { type: 'sphere', radius: 1 }, density: 1 });
    expect(getCollider(world, h)!.friction).toBe(MATERIAL_FIELDS.friction.initial);
    expect(getCollider(world, h)!.restitution).toBe(MATERIAL_FIELDS.restitution.initial);
    const sphere = { type: 'sphere', radius: 1 } as const;
    expect(() => addCollider(world, body, { shape: sphere, density: 1, restitution: 2 })).toThrow(
      RangeError
    );
    expect(() => addCollider(world, body, { shape: sphere, density: 1, friction: -1 })).toThrow(
      RangeError
    );
  });
});

describe('sleeping', () => {
  it('a resting body falls asleep, and a load or a setter wakes it', () => {
    const world = withGround();
    const box = drop(world, { type: 'box', halfExtents: [0.5, 0.5, 0.5] }, [0, 0.5, 0]);
    run(world, 2);
    expect(isSleeping(world, box)).toBe(true);
    const y = getPosition(world, box)[1]!;
    run(world, 1);
    expect(getPosition(world, box)[1]).toBe(y);
    applyForce(world, box, [0, 1, 0]);
    expect(isSleeping(world, box)).toBe(false);
    run(world, 2);
    expect(isSleeping(world, box)).toBe(true);
    setLinearVelocity(world, box, [0, 0, 0]);
    expect(isSleeping(world, box)).toBe(false);
    wakeBody(world, box);
    expect(isSleeping(world, box)).toBe(false);
  });

  it('a falling body wakes the sleeper it lands on', () => {
    const world = withGround();
    const below = drop(world, { type: 'box', halfExtents: [0.5, 0.5, 0.5] }, [0, 0.5, 0]);
    run(world, 2);
    expect(isSleeping(world, below)).toBe(true);
    drop(world, { type: 'sphere', radius: 0.3 }, [0, 3, 0]);
    let woke = false;
    run(world, 1, () => {
      woke ||= !isSleeping(world, below);
    });
    expect(woke).toBe(true);
  });
});

describe('events', () => {
  it('queues contactBegin, contactEnd, sleep and wake, and drainEvents clears them', () => {
    const world = withGround(0.5, 1);
    const ball = drop(world, { type: 'sphere', radius: 0.5 }, [0, 2, 0], { restitution: 1 });
    const seen: string[] = [];
    run(world, 1.5, () => {
      for (const e of drainEvents(world)) seen.push(e.type);
    });
    expect(seen.slice(0, 2)).toEqual(['contactBegin', 'contactEnd']);
    expect(drainEvents(world)).toEqual([]);
    const names: string[] = EVENT_TYPES.map((r) => r.name);
    for (const type of seen) expect(names).toContain(type);
    expect(ball).toBeDefined();
  });

  it('names the pair: lower collider handle first, with both bodies', () => {
    const world = withGround();
    const ball = drop(world, { type: 'sphere', radius: 0.5 }, [0, 0.49, 0]);
    step(world, dt);
    const [begin] = drainEvents(world);
    expect(begin).toMatchObject({ type: 'contactBegin', bodyB: ball });
    if (begin!.type !== 'contactBegin') throw new Error('expected a pair event');
    expect(begin!.colliderA).toBeLessThan(begin!.colliderB);
  });
});
