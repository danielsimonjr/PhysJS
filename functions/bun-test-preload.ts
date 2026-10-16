// Mirrors the build-time `define` from tsdown.config.ts for tests that import source.
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as {
  version: string;
};
(globalThis as { __PKG_VERSION__?: string }).__PKG_VERSION__ = version;
