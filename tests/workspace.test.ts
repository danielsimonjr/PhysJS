import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) =>
  JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

const root = read('package.json') as { workspaces: string[] };

describe('workspace', () => {
  it('lists exactly the 0.x packages', () => {
    expect(root.workspaces).toEqual(['core', 'functions']);
  });

  for (const dir of root.workspaces) {
    it(`${dir} is a public 0.x package under @danielsimonjr`, () => {
      const pkg = read(`${dir}/package.json`) as {
        name: string;
        version: string;
        private?: boolean;
        publishConfig?: { access?: string };
      };
      expect(pkg.name.startsWith('@danielsimonjr/physjs')).toBe(true);
      expect(pkg.version.startsWith('0.')).toBe(true);
      expect(pkg.private).toBeUndefined();
      expect(pkg.publishConfig?.access).toBe('public');
    });
  }

  // A semver range, not `workspace:*`: `changeset publish` runs npm, which does not
  // rewrite workspace protocols, and changesets keeps this range in step with core.
  it('functions depends on the current core version by caret range', () => {
    const core = read('core/package.json') as { version: string };
    const fns = read('functions/package.json') as { dependencies: Record<string, string> };
    expect(fns.dependencies['@danielsimonjr/physjs-core']).toBe(`^${core.version}`);
  });
});
