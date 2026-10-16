import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const { version } = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8')
) as { version: string };

export default defineConfig({
  define: { __PKG_VERSION__: JSON.stringify(version) },
  test: { include: ['tests/**/*.test.ts'], environment: 'node', globals: false },
});
