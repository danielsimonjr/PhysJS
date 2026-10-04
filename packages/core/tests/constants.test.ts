import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ALPHA,
  B_WIEN_SI,
  C_SI,
  E_SI,
  FARADAY_SI,
  G_SI,
  GM_SUN_SI,
  GM_SUN_SOURCE,
  H0_SI,
  HBAR_SI,
  H_SI,
  K_B_SI,
  L_P_SI,
  M_E_SI,
  M_P_SI,
  M_PROTON_SI,
  M_SUN_SI,
  M_U_SI,
  N_A_SI,
  T_P_SI,
} from '../src/index.ts';

/**
 * Right-hand sides copied from UPT `src/core/constants.ts`.
 * The test fails if a literal is shortened or rewritten.
 */
const uptExportLines = [
  'export const C_SI = 299792458;',
  'export const G_SI = 6.67430e-11;',
  'export const H_SI = 6.62607015e-34;',
  'export const HBAR_SI = H_SI / (2 * Math.PI);',
  'export const K_B_SI = 1.380649e-23;',
  'export const E_SI = 1.602176634e-19;',
  'export const ALPHA = 7.2973525693e-3;',
  'export const M_P_SI = 2.176434e-8;',
  'export const L_P_SI = 1.616255e-35;',
  'export const T_P_SI = 5.391247e-44;',
  'export const H0_SI = 67.4e3 / 3.0857e22;',
  'export const M_SUN_SI = 1.989e30;',
  'export const GM_SUN_SI = 1.3271244e20;',
  "export const GM_SUN_SOURCE = 'IAU 2015 Resolution B3, nominal solar mass parameter (GM)☉ = 1.3271244e20 m³ s⁻²';",
  'export const M_E_SI = 9.1093837015e-31;',
  'export const M_PROTON_SI = 1.67262192369e-27;',
  'export const N_A_SI = 6.02214076e23;',
  'export const FARADAY_SI = N_A_SI * E_SI;',
  'export const B_WIEN_SI = 2.897771955e-3;',
  'export const M_U_SI = 1.66053906660e-27;',
] as const;

describe('SI constants', () => {
  test('export expressions match UPT src/core/constants.ts', () => {
    const source = readFileSync(join(import.meta.dir, '../src/constants.ts'), 'utf8');
    const statements = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .split(';')
      .map((part) => part.replace(/\s+/g, ' ').trim())
      .filter((part) => part.startsWith('export const '))
      .map((part) => `${part};`);
    expect(statements).toEqual([...uptExportLines]);
  });

  test('HBAR_SI is H_SI / (2π), not a truncated display', () => {
    expect(Object.is(HBAR_SI, H_SI / (2 * Math.PI))).toBe(true);
    expect(Object.is(HBAR_SI, 1.054571817e-34)).toBe(false);
  });

  test('GM_SUN_SI is its own constant, not G_SI * M_SUN_SI', () => {
    expect(GM_SUN_SI).toBe(1.3271244e20);
    expect(Object.is(GM_SUN_SI, G_SI * M_SUN_SI)).toBe(false);
    expect(GM_SUN_SOURCE).toBe(
      'IAU 2015 Resolution B3, nominal solar mass parameter (GM)☉ = 1.3271244e20 m³ s⁻²'
    );
  });

  test('every name is the UPT value', () => {
    expect(C_SI).toBe(299792458);
    expect(G_SI).toBe(6.6743e-11);
    expect(Object.is(G_SI, 6.6743e-11)).toBe(true);
    expect(H_SI).toBe(6.62607015e-34);
    expect(K_B_SI).toBe(1.380649e-23);
    expect(E_SI).toBe(1.602176634e-19);
    expect(ALPHA).toBe(7.2973525693e-3);
    expect(M_P_SI).toBe(2.176434e-8);
    expect(L_P_SI).toBe(1.616255e-35);
    expect(T_P_SI).toBe(5.391247e-44);
    expect(Object.is(H0_SI, 67.4e3 / 3.0857e22)).toBe(true);
    expect(M_SUN_SI).toBe(1.989e30);
    expect(M_E_SI).toBe(9.1093837015e-31);
    expect(M_PROTON_SI).toBe(1.67262192369e-27);
    expect(N_A_SI).toBe(6.02214076e23);
    expect(Object.is(FARADAY_SI, N_A_SI * E_SI)).toBe(true);
    expect(B_WIEN_SI).toBe(2.897771955e-3);
    expect(M_U_SI).toBe(1.6605390666e-27);
  });
});
