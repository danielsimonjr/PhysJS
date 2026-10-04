/**
 * Tier 0 exit: the workspace is the ten marker packages, and no TypeScript
 * source under packages/ exports anything but the package name.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const expected = [
  'bridges',
  'core',
  'em',
  'fluids',
  'gr',
  'mechanics',
  'optics',
  'plasma',
  'proofs',
  'thermo',
] as const;

const root = join(import.meta.dir, '..', 'packages');
const found = readdirSync(root).sort();

if (found.join() !== [...expected].join()) {
  console.error(`packages/: expected ${expected.join(', ')}; found ${found.join(', ')}`);
  process.exit(1);
}

const forbidden = /export\s+(async\s+)?function\s+evaluate|\\frac|formalRef/;

for (const name of found) {
  const srcDir = join(root, name, 'src');
  const files = walk(srcDir);
  if (files.length !== 1 || !files[0]?.endsWith(`${join('src', 'index.ts')}`)) {
    console.error(`${name} must contain only src/index.ts`);
    process.exit(1);
  }
  const source = readFileSync(files[0], 'utf8');
  if (!source.includes(`export const packageName = '@danielsimonjr/physjs-${name}'`)) {
    console.error(`${name} does not export its package marker`);
    process.exit(1);
  }
  if (forbidden.test(source)) {
    console.error(`${name} contains a physics formula`);
    process.exit(1);
  }
  const pkg = JSON.parse(readFileSync(join(root, name, 'package.json'), 'utf8')) as {
    private?: boolean;
    name?: string;
  };
  if (pkg.private !== true) {
    console.error(`${pkg.name} is not private`);
    process.exit(1);
  }
}

console.log('tier 0 markers ok');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (entry.endsWith('.ts')) out.push(path);
  }
  return out;
}
