import { describe, expect, it } from 'bun:test';
import { gravity } from '@danielsimonjr/mathts-functions';
import {
  addBody,
  bodyCount,
  createWorld,
  getAngularVelocity,
  getBodyType,
  getLinearVelocity,
  getMass,
  getPosition,
  getRotation,
  hasBody,
  removeBody,
  setAngularVelocity,
  setLinearVelocity,
  setPosition,
  setRotation,
  type BodyHandle,
} from '../src/index';

const standardGravity = gravity.toNumeric('m/s^2') as number;

describe('createWorld', () => {
  it('defaults gravity to MathTS standard gravity along -Y', () => {
    const world = createWorld({ dims: 3 });
    expect(Array.from(world.gravity)).toEqual([0, -standardGravity, 0]);
    expect(world.integrator).toBe('semi-implicit-euler');
    expect(world.time).toBe(0);
    expect(world.steps).toBe(0);
    expect(bodyCount(world)).toBe(0);
  });

  it('takes a custom gravity from an array or a typed array', () => {
    expect(Array.from(createWorld({ dims: 3, gravity: [0, 0, -1.62] }).gravity)).toEqual([
      0, 0, -1.62,
    ]);
    expect(
      Array.from(createWorld({ dims: 3, gravity: new Float64Array([1, 2, 3]) }).gravity)
    ).toEqual([1, 2, 3]);
  });

  it('copies gravity, so later edits to the input do not reach the world', () => {
    const g = [0, -1, 0];
    const world = createWorld({ dims: 3, gravity: g });
    g[1] = 5;
    expect(world.gravity[1]).toBe(-1);
  });

  it('rejects unsupported dimensions, bad gravity, unknown integrators and unknown options', () => {
    expect(() => createWorld({ dims: 2 as 3 })).toThrow(RangeError);
    expect(() => createWorld({ dims: 3, gravity: [0, -1] })).toThrow(TypeError);
    expect(() => createWorld({ dims: 3, gravity: [0, NaN, 0] })).toThrow(RangeError);
    expect(() => createWorld({ dims: 3, integrator: 'rk9' as 'semi-implicit-euler' })).toThrow(
      RangeError
    );
    expect(() => createWorld({ dims: 3, initialBodyCapacity: 0 })).toThrow(RangeError);
    expect(() => createWorld({ dims: 3, initialBodyCapacity: 1.5 })).toThrow(RangeError);
    expect(() => createWorld({ dims: 3, lengthUnit: 'm' } as never)).toThrow(TypeError);
    expect(() => createWorld(null as never)).toThrow(TypeError);
  });
});

describe('addBody', () => {
  it('fills omitted fields from the catalog defaults', () => {
    const world = createWorld({ dims: 3 });
    const h = addBody(world, { type: 'static' });
    expect(getPosition(world, h)).toEqual([0, 0, 0]);
    expect(getRotation(world, h)).toEqual([1, 0, 0, 0]);
    expect(getLinearVelocity(world, h)).toEqual([0, 0, 0]);
    expect(getAngularVelocity(world, h)).toEqual([0, 0, 0]);
    expect(getBodyType(world, h)).toBe('static');
    expect(getMass(world, h)).toBe(Infinity);
    expect(bodyCount(world)).toBe(1);
  });

  it('stores the given pose and velocities and the mass of a dynamic body', () => {
    const world = createWorld({ dims: 3 });
    const h = addBody(world, {
      type: 'dynamic',
      mass: 2,
      position: [1, 2, 3],
      linearVelocity: [4, 5, 6],
      angularVelocity: [0, 0, 1],
    });
    expect(getPosition(world, h)).toEqual([1, 2, 3]);
    expect(getLinearVelocity(world, h)).toEqual([4, 5, 6]);
    expect(getAngularVelocity(world, h)).toEqual([0, 0, 1]);
    expect(getMass(world, h)).toBe(2);
  });

  it('normalizes the rotation quaternion [w, x, y, z]', () => {
    const world = createWorld({ dims: 3 });
    const h = addBody(world, { type: 'kinematic-position', rotation: [2, 0, 0, 0] });
    expect(getRotation(world, h)).toEqual([1, 0, 0, 0]);
    expect(() => addBody(world, { type: 'static', rotation: [0, 0, 0, 0] })).toThrow();
  });

  it('ignores mass and inertia on bodies that do not respond to loads', () => {
    const world = createWorld({ dims: 3 });
    const h = addBody(world, { type: 'kinematic-velocity', mass: 3, inertia: [1, 1, 1] });
    expect(getMass(world, h)).toBe(Infinity);
  });

  it('rejects invalid descriptors with the offending field named', () => {
    const world = createWorld({ dims: 3 });
    expect(() => addBody(world, { type: 'ghost' as 'static' })).toThrow(RangeError);
    expect(() => addBody(world, { type: 'dynamic' })).toThrow(/mass/);
    expect(() => addBody(world, { type: 'dynamic', mass: 0 })).toThrow(/mass/);
    expect(() => addBody(world, { type: 'dynamic', mass: Infinity })).toThrow(/mass/);
    expect(() => addBody(world, { type: 'dynamic', mass: 1, inertia: [1, 0, 1] })).toThrow(
      /inertia/
    );
    expect(() => addBody(world, { type: 'static', position: [1, 2] })).toThrow(/position/);
    expect(() => addBody(world, { type: 'static', position: [1, NaN, 2] })).toThrow(/position/);
    expect(() => addBody(world, { type: 'dynamic', mass: 1, linearDamping: -1 })).toThrow(
      /linearDamping/
    );
    expect(() => addBody(world, { type: 'dynamic', mass: [1] as never })).toThrow(TypeError);
    expect(() => addBody(world, { type: 'static', centerOfMass: [0, 0, 0] } as never)).toThrow(
      /centerOfMass/
    );
    expect(() => addBody(world, { type: 'static', force: [0, 0, 0] } as never)).toThrow(/force/);
    expect(bodyCount(world)).toBe(0);
  });

  it('rejects a velocity on a body type that never integrates it', () => {
    const world = createWorld({ dims: 3 });
    expect(() => addBody(world, { type: 'static', linearVelocity: [1, 0, 0] })).toThrow(
      /linearVelocity/
    );
    expect(() =>
      addBody(world, { type: 'kinematic-position', angularVelocity: [0, 1, 0] })
    ).toThrow(/angularVelocity/);
    const h = addBody(world, { type: 'static', linearVelocity: [0, 0, 0] });
    expect(() => setLinearVelocity(world, h, [0, 1, 0])).toThrow(/linearVelocity/);
  });

  it('accepts Infinity in one inertia component, which locks that axis', () => {
    const world = createWorld({ dims: 3 });
    expect(() =>
      addBody(world, { type: 'dynamic', mass: 1, inertia: [1, Infinity, 1] })
    ).not.toThrow();
  });
});

describe('handles', () => {
  it('turn stale when the body is removed, and a reused slot gets a new handle', () => {
    const world = createWorld({ dims: 3 });
    const a = addBody(world, { type: 'static', position: [1, 0, 0] });
    removeBody(world, a);
    expect(hasBody(world, a)).toBe(false);
    expect(bodyCount(world)).toBe(0);
    expect(() => getPosition(world, a)).toThrow(RangeError);
    expect(() => removeBody(world, a)).toThrow(RangeError);
    const b = addBody(world, { type: 'static', position: [2, 0, 0] });
    expect(b).not.toBe(a);
    expect(hasBody(world, a)).toBe(false);
    expect(hasBody(world, b)).toBe(true);
    expect(getPosition(world, b)).toEqual([2, 0, 0]);
  });

  it('resets every field of a reused slot to its default', () => {
    const world = createWorld({ dims: 3 });
    const a = addBody(world, { type: 'dynamic', mass: 1, linearVelocity: [1, 2, 3] });
    removeBody(world, a);
    const b = addBody(world, { type: 'dynamic', mass: 1 });
    expect(getLinearVelocity(world, b)).toEqual([0, 0, 0]);
  });

  it('reject numbers that were never handles of this world', () => {
    const world = createWorld({ dims: 3 });
    expect(hasBody(world, 0 as BodyHandle)).toBe(false);
    expect(hasBody(world, -1 as BodyHandle)).toBe(false);
    expect(hasBody(world, 1.5 as BodyHandle)).toBe(false);
    expect(() => getPosition(world, 12345 as BodyHandle)).toThrow(RangeError);
  });

  it('survive storage growth past the initial capacity', () => {
    const world = createWorld({ dims: 3, initialBodyCapacity: 2 });
    const handles = Array.from({ length: 50 }, (_, i) =>
      addBody(world, { type: 'static', position: [i, -i, 2 * i] })
    );
    expect(bodyCount(world)).toBe(50);
    handles.forEach((h, i) => expect(getPosition(world, h)).toEqual([i, -i, 2 * i]));
  });
});

describe('accessors', () => {
  it('write into a caller-supplied out array and return it', () => {
    const world = createWorld({ dims: 3 });
    const h = addBody(world, { type: 'static', position: [7, 8, 9] });
    const out = new Float64Array(3);
    expect(getPosition(world, h, out)).toBe(out);
    expect(Array.from(out)).toEqual([7, 8, 9]);
    expect(() => getPosition(world, h, new Float64Array(2))).toThrow(TypeError);
  });

  it('validate and store new values', () => {
    const world = createWorld({ dims: 3 });
    const h = addBody(world, { type: 'dynamic', mass: 1 });
    setPosition(world, h, [1, 1, 1]);
    setLinearVelocity(world, h, [0, 2, 0]);
    setAngularVelocity(world, h, [0, 0, 3]);
    setRotation(world, h, [0, 0, 0, 5]);
    expect(getPosition(world, h)).toEqual([1, 1, 1]);
    expect(getLinearVelocity(world, h)).toEqual([0, 2, 0]);
    expect(getAngularVelocity(world, h)).toEqual([0, 0, 3]);
    expect(getRotation(world, h)).toEqual([0, 0, 0, 1]);
    expect(() => setPosition(world, h, [Infinity, 0, 0])).toThrow(RangeError);
  });
});
