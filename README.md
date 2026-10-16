# PhysJS

**A TypeScript physics engine built on [MathTS](https://github.com/danielsimonjr/MathTS).**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

PhysJS is being rebuilt as a rigid-body physics engine (bodies, shapes, collision, constraints, queries) with the same monorepo layout and API style as MathTS. It takes all units, physical constants and mathematics from MathTS and defines none of its own. The design, scope and 0.x milestones are in [docs/design/PHYSICS_ENGINE_PLAN.md](docs/design/PHYSICS_ENGINE_PLAN.md). The end goal is for [fourJS](https://github.com/danielsimonjr/fourJS) to replace its physics and math layers with PhysJS and MathTS, through a `@fourjs/physics-physjs` adapter.

**Status: 0.1 milestone, bodies and integration.** A 3D world holds static, dynamic and kinematic bodies in struct-of-arrays storage and steps them with semi-implicit Euler under MathTS standard gravity, applied forces and torques, and damping. Collision, contacts and joints are later milestones. Mass from a collider's shape and density waits on MathTS [#378](https://github.com/danielsimonjr/MathTS/issues/378); until then a dynamic body takes an explicit `mass` and principal `inertia`.

```ts
import { addBody, applyForce, createWorld, getPosition, step } from '@danielsimonjr/physjs';

const world = createWorld({ dims: 3 }); // gravity [0, -9.80665, 0] from MathTS
const ball = addBody(world, {
  type: 'dynamic',
  mass: 1,
  inertia: [0.1, 0.1, 0.1],
  position: [0, 5, 0],
});
applyForce(world, ball, [2, 0, 0]); // newtons, for the next step only
step(world, 1 / 60);
getPosition(world, ball); // [x, y, z] in metres
```

Rotations are unit quaternions `[w, x, y, z]`, the MathTS convention. Body types, per-body fields, integrators and shapes are data tables in `core/src/catalog/`.

## Packages

| Package                      | Directory    | Contents                                                                             |
| ---------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| `@danielsimonjr/physjs`      | `functions/` | The public API: worlds, bodies, loads, `step`; later collision, constraints, queries |
| `@danielsimonjr/physjs-core` | `core/`      | Types, data catalogs (body types, body fields, integrators, shapes), world defaults  |

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
