/**
 * The `kind` of every manifest entry comes from the Lean source.
 *
 * A statement's kind is how its theorem relates to the catalog equation the
 * key names. A statement is a keyed entry, or a nested object on one (a field
 * whose value carries its own `theorem`). The module docstring of the file
 * that declares the theorem says so in one line per statement, labelled by the
 * key, or by the key and the field for a nested one:
 *
 *     `be-80`. Bridge. Mott–Gurney law.
 *     `be-13.vacuum`. Reduction. `vacuum_density`.
 *
 * The word after the label is one of `Bridge` (the theorem states the catalog
 * equation), `Reduction`, `Limit`, `Derivation step`, `Property`, or
 * `Cross-check`. This script reads that line for each statement and writes or
 * checks `kind` in `manifest/bridges.json`. The kind word is not repeated at
 * the head of a covers line. A kind line that names no statement its file
 * declares is a problem too. No list of keys or nested names is kept here.
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
  `^\`([a-z]+-[a-z0-9-]+(?:\\.[A-Za-z_][A-Za-z0-9_]*)?)\`\\. (${Object.keys(KINDS).join('|')})\\.(?:\\s|$)`
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

/** A keyed entry or a nested object on one: anything with its own theorem, kind, and covers line. */
export interface Statement {
  /** `key` for the entry, `key.field` for a nested object. */
  readonly label: string;
  readonly theorem: string;
  readonly kind: string | undefined;
  readonly covers: string;
}

function isNested(value: unknown): value is Record<string, unknown> & { readonly theorem: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as { theorem?: unknown }).theorem === 'string'
  );
}

/** The entry itself, then each nested object on it, in field order. */
export function statements(entry: ManifestEntry): Statement[] {
  const one = (label: string, value: Record<string, unknown>): Statement => ({
    label,
    theorem: String(value['theorem']),
    kind: typeof value['kind'] === 'string' ? value['kind'] : undefined,
    covers: typeof value['covers'] === 'string' ? value['covers'] : '',
  });
  const out = [one(entry.key, entry)];
  for (const [field, value] of Object.entries(entry)) {
    if (isNested(value)) out.push(one(`${entry.key}.${field}`, value));
  }
  return out;
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

/** The kind each statement takes from its Lean file, and every statement or kind line for which that fails. */
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
  const used = new Set<string>();
  for (const statement of manifest.entries.flatMap(statements)) {
    const { label, theorem } = statement;
    const where = fileOf.get(theorem) ?? [];
    const file = where[0];
    if (where.length !== 1 || file === undefined) {
      problems.push(`${label}: ${theorem} is declared in ${where.length} Lean files`);
      continue;
    }
    used.add(`${file}\u0000${label}`);
    const declared = kindsOf.get(file)?.get(label) ?? [];
    const kind = declared[0];
    if (declared.length !== 1 || kind === undefined) {
      problems.push(
        `${label}: lean/${file} has ${declared.length} kind lines for it; the module docstring needs one line \`${label}\`. <Kind>.`
      );
      continue;
    }
    kinds.set(label, kind);
  }
  for (const [file, declared] of kindsOf) {
    for (const label of declared.keys()) {
      if (!used.has(`${file}\u0000${label}`)) {
        problems.push(
          `lean/${file}: the kind line \`${label}\` names no manifest statement this file declares`
        );
      }
    }
  }
  return { kinds, problems };
}

/** Every way `manifest` disagrees with the Lean files: a missing or wrong kind, or a kind word on a covers line. */
export function manifestKindProblems(manifest: Manifest, files: readonly LeanFile[]): string[] {
  const { kinds, problems } = leanKinds(manifest, files);
  const out = [...problems];
  for (const { label, kind, covers } of manifest.entries.flatMap(statements)) {
    const expected = kinds.get(label);
    if (kind === undefined || !KIND_VALUES.includes(kind)) {
      out.push(`${label}: kind '${kind ?? ''}' is not one of ${KIND_VALUES.join(', ')}`);
    } else if (expected !== undefined && kind !== expected) {
      out.push(`${label}: kind is '${kind}', its Lean file says '${expected}'`);
    }
    if (KIND_PREFIX.test(covers)) {
      out.push(`${label}: the covers line opens with a kind word; the kind is the kind field`);
    }
  }
  return out;
}

/** `value` with `kind` placed after `theorem`. */
function withKind(
  value: Readonly<Record<string, unknown>>,
  kind: string | undefined
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [field, inner] of Object.entries(value)) {
    if (field === 'kind') continue;
    out[field] = inner;
    if (field === 'theorem') out['kind'] = kind;
  }
  return out;
}

/** `manifest` with every statement's kind taken from the Lean files, placed after its `theorem`. */
export function withLeanKinds(manifest: Manifest, files: readonly LeanFile[]): Manifest {
  const { kinds, problems } = leanKinds(manifest, files);
  if (problems.length > 0) throw new Error(problems.join('\n'));
  return {
    ...manifest,
    entries: manifest.entries.map((entry) => {
      const nested: Record<string, unknown> = {};
      for (const [field, value] of Object.entries(entry)) {
        nested[field] = isNested(value)
          ? withKind(value, kinds.get(`${entry.key}.${field}`))
          : value;
      }
      return withKind(nested, kinds.get(entry.key)) as ManifestEntry;
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
  const count = manifest.entries.flatMap(statements).length;
  console.log(
    `manifest kinds match the Lean files (${manifest.entries.length} entries, ${count} statements)`
  );
  return 0;
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2));
