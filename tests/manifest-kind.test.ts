import { describe, expect, test } from 'bun:test';
import {
  KIND_VALUES,
  declaredKinds,
  leanFiles,
  manifestKindProblems,
  readManifest,
  statements,
  type LeanFile,
  type Manifest,
  type ManifestEntry,
} from '../scripts/manifest-kind';

const manifest = readManifest();
const files = leanFiles();

const first = manifest.entries[0];
if (first === undefined) throw new Error('empty manifest');

/** The first entry that carries a nested statement, and that statement's field. */
const nestedHost = manifest.entries.find((entry) => statements(entry).length > 1);
if (nestedHost === undefined) throw new Error('no nested statement in the manifest');
const nestedLabel = statements(nestedHost)[1]?.label ?? '';
const nestedField = nestedLabel.slice(nestedHost.key.length + 1);

/** `manifest` with `entry` in place of the entry of the same key. */
function replaced(entry: ManifestEntry): Manifest {
  return { ...manifest, entries: manifest.entries.map((e) => (e.key === entry.key ? entry : e)) };
}

/** `nestedHost` with its nested statement changed by `change`. */
function nestedChanged(
  change: (value: Record<string, unknown>) => Record<string, unknown>
): Manifest {
  const host = nestedHost as ManifestEntry;
  return replaced({ ...host, [nestedField]: change(host[nestedField] as Record<string, unknown>) });
}

/** `files` with the kind line of `label` reduced to the bare label. */
function withoutKindLine(label: string): LeanFile[] {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const line = new RegExp(`^\`${escaped}\`\\. [A-Z][a-z-]*(?: step)?\\.`, 'm');
  return files.map(({ file, text }) => ({ file, text: text.replace(line, `\`${label}\`.`) }));
}

const flip = (kind: unknown): string => (kind === 'bridge' ? 'derivation-step' : 'bridge');

describe('manifest kinds come from the Lean files', () => {
  test('every statement has the kind its Lean module docstring declares', () => {
    expect(manifestKindProblems(manifest, files)).toEqual([]);
  });

  test('the schema is v2 and every statement, nested ones included, carries a kind', () => {
    expect(manifest.schema).toBe('physjs-bridge-manifest/v2');
    const all = manifest.entries.flatMap(statements);
    expect(all.length).toBeGreaterThan(manifest.entries.length);
    for (const statement of all) {
      expect(KIND_VALUES, statement.label).toContain(statement.kind ?? '');
    }
  });

  test('a flipped kind is caught', () => {
    const flipped = flip(first.kind);
    expect(manifestKindProblems(replaced({ ...first, kind: flipped }), files).join('\n')).toContain(
      `${first.key}: kind is '${flipped}'`
    );
  });

  test('a flipped nested kind is caught', () => {
    let flipped = '';
    const lied = nestedChanged((value) => {
      flipped = flip(value['kind']);
      return { ...value, kind: flipped };
    });
    expect(manifestKindProblems(lied, files).join('\n')).toContain(
      `${nestedLabel}: kind is '${flipped}'`
    );
  });

  test('a missing nested kind is caught', () => {
    const missing = nestedChanged(({ kind: _kind, ...rest }) => rest);
    expect(manifestKindProblems(missing, files).join('\n')).toContain(
      `${nestedLabel}: kind '' is not one of`
    );
  });

  test('a kind word at the head of a covers line is caught', () => {
    const prefixed = replaced({ ...first, covers: `derivation-step: ${first.covers}` });
    expect(manifestKindProblems(prefixed, files).join('\n')).toContain(
      `${first.key}: the covers line opens with a kind word`
    );
  });

  test('a kind word at the head of a nested covers line is caught', () => {
    const prefixed = nestedChanged((value) => ({
      ...value,
      covers: `reduction: ${String(value['covers'])}`,
    }));
    expect(manifestKindProblems(prefixed, files).join('\n')).toContain(
      `${nestedLabel}: the covers line opens with a kind word`
    );
  });

  test('an entry whose Lean file declares no kind is caught', () => {
    expect(manifestKindProblems(manifest, withoutKindLine(first.key)).join('\n')).toContain(
      `${first.key}: lean/`
    );
  });

  test('a nested statement whose Lean file declares no kind is caught', () => {
    expect(manifestKindProblems(manifest, withoutKindLine(nestedLabel)).join('\n')).toContain(
      `${nestedLabel}: lean/`
    );
  });

  test('a kind line that names no statement of its file is caught', () => {
    const stray = files.map(({ file, text }, i) => ({
      file,
      text: i === 0 ? text.replace('/-!', `/-!\n\`${nestedHost.key}.notAField\`. Bridge.\n`) : text,
    }));
    expect(manifestKindProblems(manifest, stray).join('\n')).toContain(
      `the kind line \`${nestedHost.key}.notAField\` names no manifest statement`
    );
  });

  test('a kind line is read from a module docstring only', () => {
    expect(
      declaredKinds(
        '/-!\n`be-1`. Bridge. Text.\n`be-2`. Derivation step.\n`be-2.inner`. Reduction. `t`.\n-/'
      )
    ).toEqual(
      new Map([
        ['be-1', ['bridge']],
        ['be-2', ['derivation-step']],
        ['be-2.inner', ['reduction']],
      ])
    );
    expect(declaredKinds('/-- `be-1`. Bridge. -/\n-- `be-2`. Bridge.').size).toBe(0);
  });
});
