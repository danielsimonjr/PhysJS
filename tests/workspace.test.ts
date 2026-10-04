import { describe, expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';

describe('tier 0 workspace', () => {
  test('marker check passes', () => {
    const result = spawnSync('bun', ['scripts/check-tier0-markers.ts'], {
      encoding: 'utf8',
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('tier 0 markers ok');
  });
});
