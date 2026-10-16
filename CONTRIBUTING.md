# Contributing to PhysJS

PhysJS is a TypeScript physics engine built on MathTS. The design and milestones are in `docs/design/PHYSICS_ENGINE_PLAN.md`. The Lean proofs that used to live here are maintained in [Universal-Physics-Tensor `lean/`](https://github.com/danielsimonjr/Universal-Physics-Tensor/tree/master/lean); contribute proofs there.

## Setup

- [Bun](https://bun.sh) 1.4.2 (the `packageManager` pin)

```sh
bun install
bun run build
bun run test
```

`bun run test` runs `bun test` in each package through turbo, then the root vitest suites in `tests/`.

## Rules

- Units, physical constants and all mathematics come from MathTS. Do not add local copies; file a MathTS issue (label `physjs`) instead.
- Shapes, joints, integrators and material rules are data in `core/src/catalog/`, run by one engine. No per-feature files or growing hand-written lists.
- 0.x has two packages: `core` (`@danielsimonjr/physjs-core`) and `functions` (`@danielsimonjr/physjs`).
- Releases go through changesets and CI. Nobody publishes by hand.
