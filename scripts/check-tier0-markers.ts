/**
 * Workspace surface.
 *
 * The nine packages other than core are Tier 0 markers: only `src/index.ts`,
 * exporting the package name. `core` may export the SI table, `Quantity`, and
 * the physics expression binding. No package exports a domain formula, and
 * every package stays private.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

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

const coreFiles = new Set(['constants.ts', 'expr.ts', 'index.ts', 'quantity.ts']);

const coreConstants = new Set([
  'ALPHA',
  'B_WIEN_SI',
  'C_SI',
  'E_SI',
  'FARADAY_SI',
  'G_SI',
  'GM_SUN_SI',
  'GM_SUN_SOURCE',
  'H0_SI',
  'HBAR_SI',
  'H_SI',
  'K_B_SI',
  'L_P_SI',
  'M_E_SI',
  'M_P_SI',
  'M_PROTON_SI',
  'M_SUN_SI',
  'M_U_SI',
  'N_A_SI',
  'T_P_SI',
  'packageName',
]);

const coreFunctions = new Set(['compilePhysicsExpr', 'physicsValue', 'quantity']);
const coreClasses = new Set(['Quantity']);

const forbidden = /export\s+(async\s+)?function\s+evaluate\b|\\frac|formalRef/;

const root = join(import.meta.dir, '..', 'packages');
const found = readdirSync(root).sort();

if (found.join() !== [...expected].join()) {
  console.error(`packages/: expected ${expected.join(', ')}; found ${found.join(', ')}`);
  process.exit(1);
}

for (const name of found) {
  const srcDir = join(root, name, 'src');
  const files = walk(srcDir);
  if (name === 'core') {
    const bases = files.map((file) => basename(file)).sort();
    if (bases.join() !== [...coreFiles].join()) {
      console.error(
        `core src files must be ${[...coreFiles].join(', ')}; found ${bases.join(', ')}`
      );
      process.exit(1);
    }
  } else if (files.length !== 1 || !files[0]?.endsWith(`${join('src', 'index.ts')}`)) {
    console.error(`${name} must contain only src/index.ts`);
    process.exit(1);
  }

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    if (file.endsWith(`${join('src', 'index.ts')}`)) {
      if (!source.includes(`export const packageName = '@danielsimonjr/physjs-${name}'`)) {
        console.error(`${name} does not export its package marker`);
        process.exit(1);
      }
    }
    if (forbidden.test(source)) {
      console.error(`${name} contains a physics formula (${basename(file)})`);
      process.exit(1);
    }
    checkExports(name, source);
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
console.log('tier 1 core surface ok');

function checkExports(pkg: string, source: string): void {
  const constants = names(source, /export\s+const\s+([A-Za-z0-9_]+)/g);
  const functions = names(source, /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g);
  const classes = names(source, /export\s+class\s+([A-Za-z0-9_]+)/g);
  if (pkg === 'core') {
    for (const constant of constants) {
      if (!coreConstants.has(constant)) {
        console.error(`core exports an unexpected constant ${constant}`);
        process.exit(1);
      }
    }
    for (const fn of functions) {
      if (!coreFunctions.has(fn)) {
        console.error(`core exports an unexpected function ${fn}`);
        process.exit(1);
      }
    }
    for (const cls of classes) {
      if (!coreClasses.has(cls)) {
        console.error(`core exports an unexpected class ${cls}`);
        process.exit(1);
      }
    }
    return;
  }
  for (const constant of constants) {
    if (constant !== 'packageName') {
      console.error(`${pkg} exports ${constant}; domain packages stay markers`);
      process.exit(1);
    }
  }
  if (functions.length > 0 || classes.length > 0) {
    console.error(`${pkg} exports a domain formula`);
    process.exit(1);
  }
}

function names(source: string, pattern: RegExp): string[] {
  return [...source.matchAll(pattern)].map((match) => match[1] ?? '');
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (entry.endsWith('.ts')) out.push(path);
  }
  return out;
}
