<!-- repo-map:no-verification -->
<!-- GENERATED FILE -- do not edit by hand.
     Regenerate with `repo-tools map`. -->

# Test Coverage Analysis

## Summary

| Metric | Count |
|--------|-------|
| Total Source Files | 25 |
| Total Test Files | 8 |
| Source Files with Tests | 19 |
| Source Files without Tests | 6 |
| Coverage (raw, direct-import) | **76.0%** |
---

## Source Files Without Test Coverage

The following 6 source files are not directly imported by any test file:

### root/

- `core/bun-test-preload.ts` → Expected test: `tests/unit/root/bun-test-preload.test.ts`
- `functions/bun-test-preload.ts` → Expected test: `tests/unit/root/bun-test-preload.test.ts`

### src/

- `core/src/catalog/freeze.ts` → Expected test: `tests/unit/src/freeze.test.ts`
- `functions/src/dynamics/sample.ts` → Expected test: `tests/unit/src/sample.test.ts`
- `functions/src/world/storage.ts` → Expected test: `tests/unit/src/storage.test.ts`
- `functions/src/world/validate.ts` → Expected test: `tests/unit/src/validate.test.ts`

---

## Source Files With Test Coverage

| Source File | Test Files |
|-------------|------------|
| `catalog/body-fields.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `catalog/body-types.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `catalog/integrators.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `catalog/shapes.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `catalog/value-rules.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `src/config.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `src/index.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `types/body.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `types/numeric.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `types/shape.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `types/world.ts` | `catalog.test.ts`, `index.test.ts`, `step.test.ts` |
| `collision/shapes.ts` | `index.test.ts`, `shapes.test.ts`, `step.test.ts`, `world.test.ts`, `free-fall.test.ts` |
| `dynamics/integrators.ts` | `step.test.ts` |
| `dynamics/loads.ts` | `index.test.ts`, `shapes.test.ts`, `step.test.ts`, `world.test.ts`, `free-fall.test.ts` |
| `src/index.ts` | `index.test.ts`, `shapes.test.ts`, `step.test.ts`, `world.test.ts`, `free-fall.test.ts` |
| `world/bodies.ts` | `index.test.ts`, `shapes.test.ts`, `step.test.ts`, `world.test.ts`, `free-fall.test.ts` |
| `world/create-world.ts` | `index.test.ts`, `shapes.test.ts`, `step.test.ts`, `world.test.ts`, `free-fall.test.ts` |
| `world/handles.ts` | `index.test.ts`, `shapes.test.ts`, `step.test.ts`, `world.test.ts`, `free-fall.test.ts` |
| `world/step.ts` | `index.test.ts`, `shapes.test.ts`, `step.test.ts`, `world.test.ts`, `free-fall.test.ts` |

---

## Test File Details

| Test File | Imports from Source |
|-----------|---------------------|
| `tests/catalog.test.ts` | 11 files |
| `tests/index.test.ts` | 11 files |
| `tests/index.test.ts` | 7 files |
| `tests/shapes.test.ts` | 7 files |
| `tests/step.test.ts` | 19 files |
| `tests/world.test.ts` | 7 files |
| `tests/free-fall.test.ts` | 7 files |
| `tests/workspace.test.ts` | 0 files |
