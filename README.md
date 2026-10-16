# PhysJS

**A TypeScript physics engine built on [MathTS](https://github.com/danielsimonjr/MathTS).**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

PhysJS is being rebuilt as a rigid-body physics engine (bodies, shapes, collision, constraints, queries) with the same monorepo layout and API style as MathTS. It takes all units, physical constants and mathematics from MathTS and defines none of its own. The design, scope and 0.x milestones are in [docs/design/PHYSICS_ENGINE_PLAN.md](docs/design/PHYSICS_ENGINE_PLAN.md). The end goal is for [fourJS](https://github.com/danielsimonjr/fourJS) to replace its physics and math layers with PhysJS and MathTS, through a `@fourjs/physics-physjs` adapter.

**Status: 0.0.0, skeleton only.** No engine code has landed yet.

## Packages

| Package                      | Directory    | Contents                                                        |
| ---------------------------- | ------------ | --------------------------------------------------------------- |
| `@danielsimonjr/physjs`      | `functions/` | The public API (world, bodies, collision, constraints, queries) |
| `@danielsimonjr/physjs-core` | `core/`      | Types, data catalogs, configuration                             |

## The Lean proofs moved to UPT

The Lean 4 proofs of the Universal Physics Tensor bridge dictionaries that used to live here are now maintained in **[Universal-Physics-Tensor `lean/`](https://github.com/danielsimonjr/Universal-Physics-Tensor/tree/master/lean)**, which is canonical (merged with their full history in UPT 11.0.0). They were removed from PhysJS in 0.0.0; the tag [`lean-archive`](https://github.com/danielsimonjr/PhysJS/tree/lean-archive) marks the last PhysJS commit that changed them, and the git history keeps everything.

## Development

```sh
bun install
bun run build
bun run test        # bun test in each package, then the root vitest suites
bun run typecheck
bun run lint
bun run format:check
```

Releases use [changesets](https://github.com/changesets/changesets): add a changeset with `bun run changeset`, and CI opens the "chore: release packages" PR. Nobody publishes by hand.

## License

MIT
