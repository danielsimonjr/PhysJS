<!-- repo-map:no-verification -->
<!-- GENERATED FILE -- do not edit by hand.
     Regenerate with `repo-tools map`. -->

# Complete File Inventory

This report lists each source file that the map census finds, with a disposition. The census reads the files that git tracks. Outside a git work tree, it walks the folder. The census skips tool state, dependency folders and build output (for example `.git/`, `node_modules/`, `dist/` and `target/`), and `obj/` and `bin/` for C#.

**Language**: typescript

**Total files**: 38

## Disposition counts

| Disposition | Count | Meaning |
| --- | --: | --- |
| `reachable` | 0 | A `src`-area file that an entry root reaches. |
| `build-entry` | 23 | A `src`-area file that is an entry root. |
| `test-only` | 0 | A `src`-area file that only a test reaches. |
| `orphan` | 2 | A `src`-area file that nothing reaches. Delete it, or wire it to a root. |
| `test` | 8 | A file in a `tests/` folder, or a `*.test.ts` or `*.spec.ts` file. |
| `tool` | 0 | A file in a `tools/` or `scripts/` folder outside `src/`. |
| `config` | 5 | A `*.config.*` file of TypeScript or JavaScript. |
| `example` | 0 | A file in `examples/` or `docs/`. |
| `bench` | 0 | A file in `bench/` or `benchmarks/`, or a `*.bench.*` file. |
| **Total** | **38** | |

## Per-area counts

| Area | Files |
| --- | --: |
| `config` | 5 |
| `src` | 25 |
| `tests` | 8 |

## Per-package counts

| Package | Files |
| --- | --: |
| `(root)` | 3 |
| `@danielsimonjr/physjs` | 18 |
| `@danielsimonjr/physjs-core` | 17 |

## All files

| File | Package | Area | Disposition | Lines |
| --- | --- | --- | --- | --: |
| `core/bun-test-preload.ts` | @danielsimonjr/physjs-core | src | orphan | 9 |
| `core/src/catalog/body-fields.ts` | @danielsimonjr/physjs-core | src | build-entry | 151 |
| `core/src/catalog/body-types.ts` | @danielsimonjr/physjs-core | src | build-entry | 38 |
| `core/src/catalog/freeze.ts` | @danielsimonjr/physjs-core | src | build-entry | 10 |
| `core/src/catalog/integrators.ts` | @danielsimonjr/physjs-core | src | build-entry | 30 |
| `core/src/catalog/shapes.ts` | @danielsimonjr/physjs-core | src | build-entry | 51 |
| `core/src/catalog/value-rules.ts` | @danielsimonjr/physjs-core | src | build-entry | 34 |
| `core/src/config.ts` | @danielsimonjr/physjs-core | src | build-entry | 30 |
| `core/src/index.ts` | @danielsimonjr/physjs-core | src | build-entry | 36 |
| `core/src/types/body.ts` | @danielsimonjr/physjs-core | src | build-entry | 39 |
| `core/src/types/numeric.ts` | @danielsimonjr/physjs-core | src | build-entry | 10 |
| `core/src/types/shape.ts` | @danielsimonjr/physjs-core | src | build-entry | 32 |
| `core/src/types/world.ts` | @danielsimonjr/physjs-core | src | build-entry | 57 |
| `core/tests/catalog.test.ts` | @danielsimonjr/physjs-core | tests | test | 177 |
| `core/tests/index.test.ts` | @danielsimonjr/physjs-core | tests | test | 10 |
| `core/tsdown.config.ts` | @danielsimonjr/physjs-core | config | config | 18 |
| `core/vitest.config.ts` | @danielsimonjr/physjs-core | config | config | 12 |
| `functions/bun-test-preload.ts` | @danielsimonjr/physjs | src | orphan | 9 |
| `functions/src/collision/shapes.ts` | @danielsimonjr/physjs | src | build-entry | 35 |
| `functions/src/dynamics/integrators.ts` | @danielsimonjr/physjs | src | build-entry | 71 |
| `functions/src/dynamics/loads.ts` | @danielsimonjr/physjs | src | build-entry | 34 |
| `functions/src/dynamics/sample.ts` | @danielsimonjr/physjs | src | build-entry | 82 |
| `functions/src/index.ts` | @danielsimonjr/physjs | src | build-entry | 65 |
| `functions/src/world/bodies.ts` | @danielsimonjr/physjs | src | build-entry | 182 |
| `functions/src/world/create-world.ts` | @danielsimonjr/physjs | src | build-entry | 70 |
| `functions/src/world/handles.ts` | @danielsimonjr/physjs | src | build-entry | 36 |
| `functions/src/world/step.ts` | @danielsimonjr/physjs | src | build-entry | 42 |
| `functions/src/world/storage.ts` | @danielsimonjr/physjs | src | build-entry | 100 |
| `functions/src/world/validate.ts` | @danielsimonjr/physjs | src | build-entry | 82 |
| `functions/tests/index.test.ts` | @danielsimonjr/physjs | tests | test | 14 |
| `functions/tests/shapes.test.ts` | @danielsimonjr/physjs | tests | test | 31 |
| `functions/tests/step.test.ts` | @danielsimonjr/physjs | tests | test | 208 |
| `functions/tests/world.test.ts` | @danielsimonjr/physjs | tests | test | 212 |
| `functions/tsdown.config.ts` | @danielsimonjr/physjs | config | config | 18 |
| `functions/vitest.config.ts` | @danielsimonjr/physjs | config | config | 12 |
| `tests/free-fall.test.ts` | (root) | tests | test | 17 |
| `tests/workspace.test.ts` | (root) | tests | test | 33 |
| `vitest.config.ts` | (root) | config | config | 14 |

## Skipped links

Links (symbolic links and junctions) that the census did not follow. A link can point to another repository, so no file behind a link is in this inventory or in the graph.

_None._

## Warnings

_None._
