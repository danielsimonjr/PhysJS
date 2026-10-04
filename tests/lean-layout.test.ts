import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'bun:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const leanDir = join(root, 'lean');

function leanFiles(): string[] {
  return readdirSync(leanDir)
    .filter((name) => name.endsWith('.lean'))
    .sort();
}

function moduleName(file: string): string {
  return file.slice(0, -'.lean'.length);
}

function rootsFromLakefile(): string[] {
  const text = readFileSync(join(root, 'lakefile.toml'), 'utf8');
  const match = /roots = \[([\s\S]*?)\]/.exec(text);
  const body = match?.[1];
  if (body === undefined) {
    throw new Error('lakefile.toml has no roots array');
  }
  return [...body.matchAll(/"([^"]+)"/g)].map((found) => found[1] ?? '');
}

function namespaceDeclarations(): Set<string> {
  const names = new Set<string>();
  for (const file of leanFiles()) {
    const text = readFileSync(join(leanDir, file), 'utf8');
    for (const line of text.split('\n')) {
      if (line.startsWith('namespace ')) {
        names.add(line.slice('namespace '.length).trim());
      }
    }
  }
  return names;
}

function theoremNames(value: unknown, out: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) theoremNames(item, out);
    return;
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'theorem' && typeof item === 'string') out.push(item);
      else theoremNames(item, out);
    }
  }
}

describe('flat lean layout', () => {
  test('every lean file is a Lake root directly under lean/', () => {
    expect(statSync(leanDir).isDirectory()).toBe(true);
    expect(existsSync(join(leanDir, 'PhysJS'))).toBe(false);
    const files = leanFiles();
    expect(files).toContain('PhysJS.lean');
    expect(rootsFromLakefile()).toEqual(files.map(moduleName));
  });

  test('imports use flat module names', () => {
    const modules = new Set(leanFiles().map(moduleName));
    for (const file of leanFiles()) {
      const text = readFileSync(join(leanDir, file), 'utf8');
      expect(text.includes('import PhysJS.'), file).toBe(false);
      if (file !== 'PhysJS.lean') {
        expect(text, file).toMatch(/^namespace PhysJS(\s|$|\.)/m);
      }
      for (const line of text.split('\n')) {
        if (!line.startsWith('import ')) continue;
        const imported = line.slice('import '.length).split(/\s/u)[0] ?? '';
        if (!imported.includes('.')) {
          expect(modules.has(imported), `${file} imports ${imported}`).toBe(true);
        }
      }
    }
  });

  test('lean-files.json lists proof paths and not lean/PhysJS/', () => {
    const listed = JSON.parse(
      readFileSync(join(root, 'manifest/lean-files.json'), 'utf8')
    ) as readonly string[];
    const expected = leanFiles()
      .filter((file) => file !== 'PhysJS.lean')
      .map((file) => `lean/${file}`);
    expect(listed).toEqual(expected);
    expect(listed).not.toContain('lean/PhysJS.lean');
    expect(listed.some((path) => path.startsWith('lean/PhysJS/'))).toBe(false);
  });

  test('bridge theorem namespaces are still declared', () => {
    const manifest = JSON.parse(
      readFileSync(join(root, 'manifest/bridges.json'), 'utf8')
    ) as unknown;
    const theorems: string[] = [];
    theoremNames(manifest, theorems);
    const namespaces = namespaceDeclarations();
    expect(theorems.length).toBeGreaterThan(0);
    for (const theorem of theorems) {
      const parts = theorem.split('.');
      expect(parts[0], theorem).toBe('PhysJS');
      expect(parts.length, theorem).toBeGreaterThanOrEqual(3);
      expect(namespaces.has(`PhysJS.${parts[1]}`), theorem).toBe(true);
    }
  });
});
