import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'bun:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const leanDir = join(root, 'lean');

function proofFiles(): string[] {
  return readdirSync(leanDir)
    .filter((name) => name.endsWith('.lean'))
    .sort();
}

function moduleName(file: string): string {
  return file.slice(0, -'.lean'.length);
}

function lakefile(): string {
  return readFileSync(join(root, 'lakefile.toml'), 'utf8');
}

function quotedList(key: string): string[] {
  const match = new RegExp(`${key} = \\[([\\s\\S]*?)\\]`).exec(lakefile());
  const body = match?.[1];
  if (body === undefined) {
    throw new Error(`lakefile.toml has no ${key} array`);
  }
  return [...body.matchAll(/"([^"]+)"/g)].map((found) => found[1] ?? '');
}

function namespaceDeclarations(): Set<string> {
  const names = new Set<string>();
  for (const file of proofFiles()) {
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
  test('proof files sit in lean/ and the aggregator is lean.lean', () => {
    expect(statSync(leanDir).isDirectory()).toBe(true);
    expect(existsSync(join(leanDir, 'PhysJS'))).toBe(false);
    expect(existsSync(join(leanDir, 'PhysJS.lean'))).toBe(false);
    expect(existsSync(join(root, 'lean.lean'))).toBe(true);
    expect(quotedList('roots')).toEqual(['lean']);
    expect(quotedList('globs')).toEqual(['lean.*']);
    expect(lakefile()).toMatch(/^srcDir = "\."$/m);
  });

  test('every proof module is reachable from lean.lean', () => {
    const modules = new Set(proofFiles().map(moduleName));
    const importsOf = (text: string): string[] =>
      text
        .split('\n')
        .filter((line) => line.startsWith('import lean.'))
        .map((line) => line.slice('import lean.'.length).trim());
    const seen = new Set<string>();
    const stack = importsOf(readFileSync(join(root, 'lean.lean'), 'utf8'));
    while (stack.length > 0) {
      const name = stack.pop();
      if (name === undefined || seen.has(name)) continue;
      expect(modules.has(name), name).toBe(true);
      seen.add(name);
      stack.push(...importsOf(readFileSync(join(leanDir, `${name}.lean`), 'utf8')));
    }
    expect([...seen].sort()).toEqual([...modules].sort());
  });

  test('proof imports use lean.<File> and namespaces stay PhysJS', () => {
    const modules = new Set(proofFiles().map(moduleName));
    for (const file of proofFiles()) {
      const text = readFileSync(join(leanDir, file), 'utf8');
      expect(text.includes('import PhysJS.'), file).toBe(false);
      expect(text, file).toMatch(/^namespace PhysJS(\s|$|\.)/m);
      for (const line of text.split('\n')) {
        if (!line.startsWith('import ')) continue;
        const imported = line.slice('import '.length).split(/\s/u)[0] ?? '';
        if (imported.startsWith('lean.')) {
          const name = imported.slice('lean.'.length);
          expect(name.includes('.'), `${file} imports ${imported}`).toBe(false);
          expect(modules.has(name), `${file} imports ${imported}`).toBe(true);
        }
      }
    }
  });

  test('lean-files.json lists proof paths and not lean/PhysJS/', () => {
    const listed = JSON.parse(
      readFileSync(join(root, 'manifest/lean-files.json'), 'utf8')
    ) as readonly string[];
    const expected = proofFiles().map((file) => `lean/${file}`);
    expect(listed).toEqual(expected);
    expect(listed).not.toContain('lean.lean');
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
