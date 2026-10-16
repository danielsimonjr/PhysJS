import { defineConfig } from 'tsdown';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Same shape as MathTS: read the version at build time so VERSION never drifts
// from package.json; declarations come from tsc (tsconfig.dts.json).
const { version } = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8')
) as { version: string };

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  dts: false,
  fixedExtension: false,
  clean: true,
  define: { __PKG_VERSION__: JSON.stringify(version) },
});
