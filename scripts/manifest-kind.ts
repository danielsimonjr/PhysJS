/**
 * The `kind` of every manifest entry comes from the Lean source.
 *
 * A keyed entry's kind is how its theorem relates to the catalog equation the
 * key names. The module docstring of the file that declares the theorem says
 * so in one line per key:
 *
 *     `be-80`. Bridge. Mott–Gurney law.
 *
 * The word after the key is one of `Bridge` (the theorem states the catalog
 * equation), `Reduction`, `Limit`, `Derivation step`, `Property`, or
 * `Cross-check`. This script reads that line for each entry and writes or
 * checks `kind` in `manifest/bridges.json`. The kind word is not repeated at
 * the head of the covers line. No list of keys is kept here.
 *
 *   bun scripts/manifest-kind.ts           # exit 1 when a kind disagrees with its Lean file
 *   bun scripts/manifest-kind.ts --write   # write every kind from the Lean files
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { format } from 'prettier';

/** Kind words as the Lean docstring writes them, and the manifest value of each. */
export const KINDS: Readonly<Record<string, string>> = {
  Bridge: 'bridge',
  Reduction: 'reduction',
  Limit: 'limit',
  'Derivation step': 'derivation-step',
  Property: 'property',
  'Cross-check': 'cross-check',
};

/** Manifest kind values. */
export const KIND_VALUES: readonly string[] = Object.values(KINDS);

const KIND_LINE = new RegExp(
  `^\`([a-z]+-[a-z0-9-]+)\`\\. (${Object.keys(KINDS).join('|')})\\.(?:\\s|$)`
);

/** A covers line that still opens with a kind word. */
const KIND_PREFIX = new RegExp(`^(${KIND_VALUES.join('|')}): `);

export interface ManifestEntry {
  readonly key: string;
  readonly theorem: string;
  readonly kind?: string;
  readonly covers: string;
  readonly [field: string]: unknown;
}

export interface Manifest {
  readonly schema: string;
  readonly entries: readonly ManifestEntry[];
  readonly [field: string]: unknown;
}

/** One Lean source file: its name under `lean/` and its text. */
export interface LeanFile {
  readonly file: string;
  readonly text: string;
}

const DECLARATION =
  /^\s*(?:@\[[^\]]*\]\s*)?(?:(?:private|protected|noncomputable)\s+)*(?:theorem|lemma)\s+([^\s(:{[]+)/;

/** Full names of the theorems and lemmas `source` declares, from its namespace and section lines. */
export function declaredTheorems(source: string): string[] {
  const scopes: { readonly namespace: boolean; readonly name: string }[] = [];
  const out: string[] = [];
  let depth = 0;
  for (const raw of source.split('\n')) {
    let line = '';
    for (let i = 0; i < raw.length; i++) {
      if (raw.startsWith('/-', i)) {
        depth++;
        i++;
      } else if (depth > 0 && raw.startsWith('-/', i)) {
        depth--;
        i++;
      } else if (depth === 0) {
        if (raw.startsWith('--', i)) break;
        line += raw[i];
      }
    }
    const ns = /^\s*namespace\s+(\S+)/.exec(line);
    if (ns !== null) {
      scopes.push({ namespace: true, name: ns[1] ?? '' });
      continue;
    }
    const section = /^\s*(?:noncomputable\s+)?section(?:\s+(\S+))?\s*$/.exec(line);
    if (section !== null) {
      scopes.push({ namespace: false, name: section[1] ?? '' });
      continue;
    }
    const end = /^\s*end(?:\s+(\S+))?\s*$/.exec(line);
    if (end !== null) {
      const at = scopes.map((scope) => scope.name).lastIndexOf(end[1] ?? '');
      if (at >= 0) scopes.length = at;
      continue;
    }
    const decl = DECLARATION.exec(line);
    if (decl === null) continue;
    const name = decl[1] ?? '';
    if (name.startsWith('_root_.')) {
      out.push(name.slice('_root_.'.length));
      continue;
    }
    const prefix = scopes.filter((scope) => scope.namespace).map((scope) => scope.name);
    out.push([...prefix, name].join('.'));
  }
  return out;
}

/** Key → manifest kind, from the kind lines of the module docstrings (`/-! … -/`) of `source`. */
export function declaredKinds(source: string): Map<string, string[]> {
  const kinds = new Map<string, string[]>();
  for (const block of source.matchAll(/\/-!([\s\S]*?)-\//g)) {
    for (const line of (block[1] ?? '').split('\n')) {
      const found = KIND_LINE.exec(line);
      if (found === null) continue;
      const key = found[1] ?? '';
      kinds.set(key, [...(kinds.get(key) ?? []), KINDS[found[2] ?? ''] ?? '']);
    }
  }
  return kinds;
}

/** The kind each entry takes from its Lean file, and every entry for which there is none. */
export function leanKinds(
  manifest: Manifest,
  files: readonly LeanFile[]
): { readonly kinds: ReadonlyMap<string, string>; readonly problems: readonly string[] } {
  const fileOf = new Map<string, string[]>();
  const kindsOf = new Map<string, Map<string, string[]>>();
  for (const { file, text } of files) {
    for (const theorem of declaredTheorems(text)) {
      fileOf.set(theorem, [...(fileOf.get(theorem) ?? []), file]);
    }
    kindsOf.set(file, declaredKinds(text));
  }
  const kinds = new Map<string, string>();
  const problems: string[] = [];
  for (const entry of manifest.entries) {
    const where = fileOf.get(entry.theorem) ?? [];
    const file = where[0];
    if (where.length !== 1 || file === undefined) {
      problems.push(`${entry.key}: ${entry.theorem} is declared in ${where.length} Lean files`);
      continue;
    }
    const declared = kindsOf.get(file)?.get(entry.key) ?? [];
    const kind = declared[0];
    if (declared.length !== 1 || kind === undefined) {
      problems.push(
        `${entry.key}: lean/${file} has ${declared.length} kind lines for it; the module docstring needs one line \`${entry.key}\`. <Kind>.`
      );
      continue;
    }
    kinds.set(entry.key, kind);
  }
  return { kinds, problems };
}

/** Every way `manifest` disagrees with the Lean files: a missing or wrong kind, or a kind word on a covers line. */
export function manifestKindProblems(manifest: Manifest, files: readonly LeanFile[]): string[] {
  const { kinds, problems } = leanKinds(manifest, files);
  const out = [...problems];
  for (const entry of manifest.entries) {
    const expected = kinds.get(entry.key);
    if (entry.kind === undefined || !KIND_VALUES.includes(entry.kind)) {
      out.push(`${entry.key}: kind '${entry.kind ?? ''}' is not one of ${KIND_VALUES.join(', ')}`);
    } else if (expected !== undefined && entry.kind !== expected) {
      out.push(`${entry.key}: kind is '${entry.kind}', its Lean file says '${expected}'`);
    }
    if (KIND_PREFIX.test(entry.covers)) {
      out.push(`${entry.key}: the covers line opens with a kind word; the kind is the kind field`);
    }
  }
  return out;
}

/** `manifest` with every entry's kind taken from the Lean files, placed after `theorem`. */
export function withLeanKinds(manifest: Manifest, files: readonly LeanFile[]): Manifest {
  const { kinds, problems } = leanKinds(manifest, files);
  if (problems.length > 0) throw new Error(problems.join('\n'));
  return {
    ...manifest,
    entries: manifest.entries.map((entry) => {
      const out: Record<string, unknown> = {};
      for (const [field, value] of Object.entries(entry)) {
        if (field === 'kind') continue;
        out[field] = value;
        if (field === 'theorem') out['kind'] = kinds.get(entry.key);
      }
      return out as ManifestEntry;
    }),
  };
}

const root = resolve(import.meta.dir, '..');

/** Every `lean/<File>.lean` of this checkout. */
export function leanFiles(dir: string = join(root, 'lean')): LeanFile[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.lean'))
    .sort()
    .map((file) => ({ file, text: readFileSync(join(dir, file), 'utf8') }));
}

/** `manifest/bridges.json` of this checkout. */
export function readManifest(path: string = join(root, 'manifest/bridges.json')): Manifest {
  return JSON.parse(readFileSync(path, 'utf8')) as Manifest;
}

async function main(argv: readonly string[]): Promise<number> {
  const path = join(root, 'manifest/bridges.json');
  const manifest = readManifest(path);
  const files = leanFiles();
  if (argv.includes('--write')) {
    const next = withLeanKinds(manifest, files);
    writeFileSync(path, await format(JSON.stringify(next), { parser: 'json', printWidth: 100 }));
    return 0;
  }
  const problems = manifestKindProblems(manifest, files);
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    return 1;
  }
  console.log(`manifest kinds match the Lean files (${manifest.entries.length} entries)`);
  return 0;
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2));
