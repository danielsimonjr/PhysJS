/**
 * After @danielsimonjr/physjs-proofs exists, a change to manifest/bridges.json
 * needs a changeset that names that package.
 *
 * The base is the first argument, or origin/main.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const base = process.argv[2] ?? 'origin/main';
const diff = spawnSync(
  'git',
  ['diff', '--name-only', `${base}...HEAD`, '--', 'manifest/bridges.json'],
  {
    encoding: 'utf8',
  }
);

if (diff.status !== 0) {
  console.error(diff.stderr);
  process.exit(diff.status ?? 1);
}

const changed = diff.stdout.trim().length > 0;
if (!changed) {
  console.log('manifest/bridges.json unchanged');
  process.exit(0);
}

const dir = join(import.meta.dir, '..', '.changeset');
const notes = readdirSync(dir).filter((name) => name.endsWith('.md'));
const hit = notes.some((name) =>
  readFileSync(join(dir, name), 'utf8').includes('@danielsimonjr/physjs-proofs')
);

if (!hit) {
  console.error(
    'manifest/bridges.json changed without a changeset for @danielsimonjr/physjs-proofs'
  );
  process.exit(1);
}

console.log('proofs changeset present');
