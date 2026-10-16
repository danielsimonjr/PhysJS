import { describe, expect, it } from 'bun:test';
import pkg from '../package.json' with { type: 'json' };
import { CORE_PACKAGE_NAME, PACKAGE_NAME, VERSION } from '../src/index';

describe('physjs', () => {
  it('names itself and reports the package.json version', () => {
    expect(PACKAGE_NAME).toBe(pkg.name);
    expect(VERSION).toBe(pkg.version);
  });

  it('re-exports core', () => {
    expect(CORE_PACKAGE_NAME).toBe('@danielsimonjr/physjs-core');
  });
});
