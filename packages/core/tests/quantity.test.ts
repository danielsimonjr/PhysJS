import { describe, expect, test } from 'bun:test';
import { quantity } from '../src/index.ts';

describe('quantity', () => {
  test('25degC round-trips through MathTS toSI to 298.15 K', () => {
    const parsed = quantity('25degC');
    expect(parsed.unit.value).toBe(25);
    expect(parsed.unit.formatUnits()).toBe('degC');

    const si = parsed.toSI();
    expect(si.unit.value).toBe(298.15);
    expect(si.unit.formatUnits()).toBe('K');
    expect(si.unit.toString()).toBe('298.15 K');

    const back = si.to('degC');
    expect(back.unit.value).toBe(25);
    expect(back.unit.formatUnits()).toBe('degC');
  });

  test('carries the MathTS unit instance', () => {
    const parsed = quantity('25degC');
    expect(parsed.unit.isUnit).toBe(true);
    expect(parsed.unit.type).toBe('Unit');
  });
});
