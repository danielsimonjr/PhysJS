import { describe, expect, it } from 'bun:test';
import {
  BODY_FIELDS,
  BODY_TYPES,
  INTEGRATOR_CATALOG,
  SHAPES,
  SUPPORTED_DIMS,
  VALUE_RULES,
  WORLD_DEFAULTS,
  type BodyDescriptor,
  type BodyFieldName,
  type DescriptorFieldName,
  type ShapeDescriptor,
  type ShapeType,
} from '../src/index';

// Compile-time checks: the hand-documented descriptor types name exactly the
// fields the catalog tables declare. `bun run typecheck` fails if they drift.
type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const descriptorKeysMatch: Equals<
  Exclude<keyof BodyDescriptor, 'type'>,
  DescriptorFieldName
> = true;
const shapeTypesMatch: Equals<ShapeDescriptor['type'], ShapeType> = true;

const fieldNames = Object.keys(BODY_FIELDS) as BodyFieldName[];

describe('BODY_FIELDS', () => {
  it('matches the documented descriptor types', () => {
    expect(descriptorKeysMatch).toBe(true);
    expect(shapeTypesMatch).toBe(true);
  });

  it('gives every field an initial value with one entry per component', () => {
    for (const name of fieldNames) {
      const field = BODY_FIELDS[name];
      expect(field.components).toBeGreaterThan(0);
      expect(field.initial).toHaveLength(field.components);
    }
  });

  it('marks scalar fields as one component', () => {
    for (const name of fieldNames) {
      const field = BODY_FIELDS[name];
      if ('scalar' in field && field.scalar) expect(field.components).toBe(1);
    }
  });

  it('derives each derived field from a descriptor field of the same size', () => {
    for (const name of fieldNames) {
      const field = BODY_FIELDS[name];
      if (field.role !== 'derived') continue;
      const source = BODY_FIELDS[field.derivedFrom];
      expect(source.descriptor).toBe(true);
      expect(source.components).toBe(field.components);
    }
  });

  it('starts at rest, unrotated, with no load and unit gravity scale', () => {
    expect(BODY_FIELDS.position.initial).toEqual([0, 0, 0]);
    expect(BODY_FIELDS.rotation.initial).toEqual([1, 0, 0, 0]);
    expect(BODY_FIELDS.linearVelocity.initial).toEqual([0, 0, 0]);
    expect(BODY_FIELDS.angularVelocity.initial).toEqual([0, 0, 0]);
    expect(BODY_FIELDS.force.initial).toEqual([0, 0, 0]);
    expect(BODY_FIELDS.torque.initial).toEqual([0, 0, 0]);
    expect(BODY_FIELDS.gravityScale.initial).toEqual([1]);
  });

  it('names a known value rule on every field', () => {
    for (const name of fieldNames) expect(VALUE_RULES[BODY_FIELDS[name].rule]).toBeDefined();
  });
});

describe('BODY_TYPES', () => {
  it('lists the four fourJS body types once each', () => {
    expect(BODY_TYPES.map((t) => t.name).sort()).toEqual([
      'dynamic',
      'kinematic-position',
      'kinematic-velocity',
      'static',
    ]);
  });

  it('lets only dynamic bodies respond to loads, and only moving types integrate', () => {
    const byName = Object.fromEntries(BODY_TYPES.map((t) => [t.name, t]));
    expect(byName['dynamic']).toMatchObject({ integrates: true, dynamic: true });
    expect(byName['kinematic-velocity']).toMatchObject({ integrates: true, dynamic: false });
    expect(byName['kinematic-position']).toMatchObject({ integrates: false, dynamic: false });
    expect(byName['static']).toMatchObject({ integrates: false, dynamic: false });
  });
});

describe('VALUE_RULES', () => {
  const cases: [keyof typeof VALUE_RULES, number[], number[]][] = [
    ['finite', [0, -1, 2.5], [NaN, Infinity, -Infinity]],
    ['nonNegative', [0, 3], [-1e-300, NaN, Infinity]],
    ['positive', [1e-300, 7], [0, -1, NaN, Infinity]],
    ['positiveOrInfinite', [1e-300, Infinity], [0, -1, NaN, -Infinity]],
  ];
  for (const [rule, accepted, rejected] of cases) {
    it(`${rule} accepts and rejects the right numbers`, () => {
      for (const x of accepted) expect(VALUE_RULES[rule].test(x)).toBe(true);
      for (const x of rejected) expect(VALUE_RULES[rule].test(x)).toBe(false);
      expect(VALUE_RULES[rule].description.length).toBeGreaterThan(0);
    });
  }
});

describe('INTEGRATOR_CATALOG', () => {
  it('has unique names and includes the default', () => {
    const names = INTEGRATOR_CATALOG.map((r) => r.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain(WORLD_DEFAULTS.integrator);
  });

  it('records semi-implicit Euler as first order and symplectic', () => {
    expect(INTEGRATOR_CATALOG.find((r) => r.name === 'semi-implicit-euler')).toMatchObject({
      order: 1,
      symplectic: true,
    });
  });
});

describe('SHAPES', () => {
  it('has the 0.x 3D core shapes with fourJS parameter names', () => {
    const byType = Object.fromEntries(SHAPES.map((s) => [s.type, s]));
    expect(Object.keys(byType).sort()).toEqual(['box', 'capsule', 'sphere']);
    expect(Object.keys(byType['sphere']!.params)).toEqual(['radius']);
    expect(Object.keys(byType['box']!.params)).toEqual(['halfExtents']);
    expect(Object.keys(byType['capsule']!.params).sort()).toEqual(['halfHeight', 'radius']);
  });

  it('gives every parameter a positive rule and a component count', () => {
    for (const shape of SHAPES) {
      expect(SUPPORTED_DIMS as readonly number[]).toContain(shape.dims);
      for (const param of Object.values(shape.params)) {
        expect(param.rule).toBe('positive');
        expect(param.components).toBeGreaterThan(0);
      }
    }
  });
});

describe('catalog tables', () => {
  it('are frozen all the way down', () => {
    const tables = [
      BODY_FIELDS,
      BODY_TYPES,
      INTEGRATOR_CATALOG,
      SHAPES,
      SUPPORTED_DIMS,
      VALUE_RULES,
      WORLD_DEFAULTS,
    ];
    const visit = (value: unknown): void => {
      if (typeof value !== 'object' || value === null) return;
      expect(Object.isFrozen(value)).toBe(true);
      for (const inner of Object.values(value)) visit(inner);
    };
    for (const table of tables) visit(table);
  });
});

describe('WORLD_DEFAULTS', () => {
  it('points up along +Y with a unit vector, and has a positive capacity', () => {
    expect(WORLD_DEFAULTS.up).toEqual([0, 1, 0]);
    expect(Number.isInteger(WORLD_DEFAULTS.initialBodyCapacity)).toBe(true);
    expect(WORLD_DEFAULTS.initialBodyCapacity).toBeGreaterThan(0);
  });
});
