import { describe, expect, test } from 'bun:test';
import {
  KIND_VALUES,
  declaredKinds,
  leanFiles,
  manifestKindProblems,
  readManifest,
  type Manifest,
} from '../scripts/manifest-kind';

const manifest = readManifest();
const files = leanFiles();

describe('manifest kinds come from the Lean files', () => {
  test('every entry has the kind its Lean module docstring declares', () => {
    expect(manifestKindProblems(manifest, files)).toEqual([]);
  });

  test('the schema is v2 and every entry carries a kind', () => {
    expect(manifest.schema).toBe('physjs-bridge-manifest/v2');
    for (const entry of manifest.entries) {
      expect(KIND_VALUES, entry.key).toContain(entry.kind ?? '');
    }
  });

  test('a flipped kind is caught', () => {
    const first = manifest.entries[0];
    if (first === undefined) throw new Error('empty manifest');
    const flipped = first.kind === 'bridge' ? 'derivation-step' : 'bridge';
    const lied: Manifest = {
      ...manifest,
      entries: [{ ...first, kind: flipped }, ...manifest.entries.slice(1)],
    };
    expect(manifestKindProblems(lied, files).join('\n')).toContain(
      `${first.key}: kind is '${flipped}'`
    );
  });

  test('a kind word at the head of a covers line is caught', () => {
    const first = manifest.entries[0];
    if (first === undefined) throw new Error('empty manifest');
    const prefixed: Manifest = {
      ...manifest,
      entries: [
        { ...first, covers: `derivation-step: ${first.covers}` },
        ...manifest.entries.slice(1),
      ],
    };
    expect(manifestKindProblems(prefixed, files).join('\n')).toContain(
      `${first.key}: the covers line opens with a kind word`
    );
  });

  test('an entry whose Lean file declares no kind is caught', () => {
    const stripped = files.map((file) => ({
      file: file.file,
      text: file.text.replace(/^`be-80`\. Bridge\./m, '`be-80`.'),
    }));
    expect(manifestKindProblems(manifest, stripped).join('\n')).toContain('be-80: lean/');
  });

  test('a kind line is read from a module docstring only', () => {
    expect(declaredKinds('/-!\n`be-1`. Bridge. Text.\n`be-2`. Derivation step.\n-/')).toEqual(
      new Map([
        ['be-1', ['bridge']],
        ['be-2', ['derivation-step']],
      ])
    );
    expect(declaredKinds('/-- `be-1`. Bridge. -/\n-- `be-2`. Bridge.').size).toBe(0);
  });
});
