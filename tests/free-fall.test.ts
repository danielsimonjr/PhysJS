import { describe, expect, it } from 'vitest';
import { addBody, createWorld, getPosition, step } from '@danielsimonjr/physjs';

// Cross-package scenario: the built public package, imported by name the way a
// consumer (and later the fourJS adapter) does.
describe('@danielsimonjr/physjs public package', () => {
  it('drops a ball under MathTS standard gravity', () => {
    const world = createWorld({ dims: 3 });
    const ball = addBody(world, { type: 'dynamic', mass: 1, position: [0, 10, 0] });
    for (let i = 0; i < 60; i++) step(world, 1 / 60);
    const [x, y, z] = getPosition(world, ball);
    expect(x).toBe(0);
    expect(z).toBe(0);
    // Semi-implicit Euler: y = 10 - g dt^2 n (n + 1) / 2 with g = 9.80665, n = 60.
    expect(y).toBeCloseTo(10 - (9.80665 * 61) / 120, 10);
  });
});
