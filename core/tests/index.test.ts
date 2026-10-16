import { describe, expect, it } from 'bun:test';
import pkg from '../package.json' with { type: 'json' };
import { PACKAGE_NAME, VERSION } from '../src/index';

describe('physjs-core', () => {
  it('names itself and reports the package.json version', () => {
    expect(PACKAGE_NAME).toBe(pkg.name);
    expect(VERSION).toBe(pkg.version);
  });
});
