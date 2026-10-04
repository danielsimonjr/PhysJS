import { describe, expect, test } from 'bun:test';
import { E_SI, compilePhysicsExpr, physicsValue } from '../src/index.ts';

describe('physics expression binding', () => {
  test('bare e is the elementary charge, exp(1) is Euler, euler throws, E is unbound', () => {
    expect(Object.is(physicsValue('e'), 1.602176634e-19)).toBe(true);
    expect(Object.is(physicsValue('e'), E_SI)).toBe(true);
    expect(Object.is(compilePhysicsExpr('e').evaluate(), E_SI)).toBe(true);

    expect(Object.is(physicsValue('exp(1)'), Math.E)).toBe(true);
    expect(Object.is(compilePhysicsExpr('exp(1)').evaluate(), Math.E)).toBe(true);

    expect(() => physicsValue('euler')).toThrow(/euler/);
    expect(() => compilePhysicsExpr('euler').evaluate()).toThrow(/euler/);

    expect(() => physicsValue('E')).toThrow(/E/);
    expect(physicsValue('E', { E: 4.5 })).toBe(4.5);
  });

  test('an explicit scope entry for e wins', () => {
    expect(physicsValue('e', { e: 2 })).toBe(2);
  });
});
