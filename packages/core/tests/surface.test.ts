import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as core from '../src/index.ts';

const constants = [
  'ALPHA',
  'B_WIEN_SI',
  'C_SI',
  'E_SI',
  'FARADAY_SI',
  'G_SI',
  'GM_SUN_SI',
  'GM_SUN_SOURCE',
  'H0_SI',
  'HBAR_SI',
  'H_SI',
  'K_B_SI',
  'L_P_SI',
  'M_E_SI',
  'M_P_SI',
  'M_PROTON_SI',
  'M_SUN_SI',
  'M_U_SI',
  'N_A_SI',
  'T_P_SI',
] as const;

describe('core public surface', () => {
  test('exports constants, quantity, and the expression binding', () => {
    expect(Object.keys(core).sort()).toEqual(
      [
        'Quantity',
        'compilePhysicsExpr',
        'packageName',
        'physicsValue',
        'quantity',
        ...constants,
      ].sort()
    );
  });

  test('stays private', () => {
    const pkg = JSON.parse(readFileSync(join(import.meta.dir, '../package.json'), 'utf8')) as {
      private?: boolean;
    };
    expect(pkg.private).toBe(true);
  });
});
