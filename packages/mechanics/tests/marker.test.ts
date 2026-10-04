import { describe, expect, test } from 'bun:test';
import { packageName } from '../src/index.ts';

describe(packageName, () => {
  test('is the package marker', () => {
    expect(packageName).toBe('@danielsimonjr/physjs-mechanics');
  });
});
