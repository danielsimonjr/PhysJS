# PhysJS physics engine plan

**Status:** approved by Daniel on 2026-10-15 (PR #77), including all six recommendations in section 10. No code lands with this document.
**Decisions (Daniel, 2026-10-15):** package `@danielsimonjr/physjs`, starting at 0.x; mirror MathTS's directory tree, packages and API style; template is a *core subset* of fourJS's physics; units, constants and all mathematics come from MathTS; the Lean proofs leave PhysJS (UPT `lean/` is canonical); this work comes before UPT 11.0.0 dogfooding.
**Inputs studied (pulled to latest on 2026-10-15):** MathTS `main` @ `c7a33f69`, fourJS `main` @ `ee5de9a`, PhysJS `main` @ `a737eab`.

## 1. What MathTS looks like (the structure to mirror)

- **Bun + turbo monorepo.** Root `package.json` is private (`mathts`), `packageManager: bun@1.4.2`, workspaces are top-level directories (`core`, `matrix`, `functions`, `units`, `linalg`, ...) plus `packages/*` for vendored infrastructure (`typed-function`, `workerpool`). `turbo.json` orders builds with `dependsOn: ["^build"]`.
- **Each package directory** holds `package.json`, `README.md`, `CHANGELOG.md`, `src/index.ts`, `tsconfig.json`, `tsconfig.dts.json`, `tsconfig.test.json`, `vitest.config.ts`, `bunfig.toml`. Published as `@danielsimonjr/mathts-<name>`.
- **core / functions split.** `@danielsimonjr/mathts-core` holds types, config, the factory/typed machinery and constants with no heavy dependencies. `@danielsimonjr/mathts-functions` holds the user-facing operations, re-exported through one barrel (`functions/src/index.ts`) and dispatched polymorphically through `mathTyped(name, signatures)` (typed-function).
- **API style.** Free functions, named exports only, polymorphic on argument type via typed-function, plain data in / plain data out, optional acceleration tiers that are opt-in (`await loadWasm()`; until then the JS path runs).
- **Releases.** Changesets (`.changeset/config.json`, `access: public`, `baseBranch: main`), a "chore: release packages" PR, CI publish (`release.yml`, `publish.yml`, `.github/scripts/ensure-package-releases.sh`). Nobody publishes by hand.
- **Tooling.** oxlint, prettier, husky pre-commit, vitest + `bun test`, dependency-graph docs (`tools/create-dependency-graph`), benchmarks under `tools/benchmark`, `AGENTS.md`/`CLAUDE.md`/`CONTRIBUTING.md`.

## 2. What fourJS's physics is (the template)

fourJS already separates a **solver-independent API** from **solvers**:

| fourJS package | Role | Size (lines) |
|---|---|---|
| `@fourjs/physics` | Stable API: `PhysicsWorld` (4560), `RigidBody` (1765), `Collider`, shapes, materials, joints (1318), force fields, queries, events, validation, serializers, `SolverRegistry`, the `PhysicsSolverAdapter` contract | ~16k |
| `@fourjs/physics-rapier` | Adapter to Rapier 2D/3D (WASM); the engine that actually simulates today | ~3.4k in the 3D adapter |
| `@fourjs/physics-box2d` | Adapter to Box2D | |
| `@fourjs/physics-soft` | Stub (1 line) | |
| `@fourjs/motion` | Integrators (`explicitEuler`, `semiImplicitEuler`, `velocityVerlet`, `rk2`, `rk4` in an `INTEGRATORS` table), spring-damper, PID, spatial hash, steering, IK, character/kinematic controllers, trajectories | |
| `@fourjs/math` | `Vector2/3/4`, `Quaternion`, `Matrix3/4`, `Frustum`, `Rectangle2`, color, an allocation counter | |

The adapter contract (`packages/physics/src/adapter.ts`) is: `initialize`, `createBody/destroyBody`, `createCollider/destroyCollider`, `createJoint/destroyJoint`, `step(delta)`, `setEventInterest?`, `drainEvents`, `syncSceneToSolver`, `syncSolverToScene`, `raycast`, `shapeCast`, `overlap`, `pointQuery`, `createSnapshot?/restoreSnapshot?`, `dispose`, plus declared `PhysicsCapabilities`.

Shape vocabulary: 2D `circle, rectangle, capsule, polygon, polyline, chain`; 3D `sphere, box, capsule, cylinder, cone, convex-hull, triangle-mesh, height-field`. Joints: `fixed, hinge, slider, spherical, rope, spring` (+ motors, break thresholds).

**Consequence for the design.** fourJS's own physics is the *API layer*; the *engine* is Rapier. So PhysJS should be the native TypeScript **engine** that implements fourJS's solver vocabulary, with a pure, scene-free API. FourJS migrates by registering one thin `physjs` solver (or, per the existing architecture note, by calling PhysJS directly) and later retiring Rapier/Box2D. PhysJS must not import anything from fourJS (no `Node`, no scene, no ECS).

## 3. Proposed directory tree and packages

```
PhysJS/
  package.json            private root "physjs", bun@1.4.2, workspaces, turbo scripts
  turbo.json  bunfig.toml  .oxlintrc.json  .prettierrc  .husky/
  .changeset/config.json  access public, baseBranch main
  .github/workflows/      ci.yml, release.yml (MathTS shape)
  AGENTS.md CONTRIBUTING.md README.md CHANGELOG.md
  core/                   @danielsimonjr/physjs-core
    src/types/            Body, Shape, Material, Joint, World, Contact, Event, Query records (plain data)
    src/config.ts         world defaults (gravity from MathTS, iterations, sleep thresholds)
    src/catalog/          DATA tables: shapes, joints, integrators, material-combine rules
    src/index.ts
  functions/              @danielsimonjr/physjs   the public package (Daniel's chosen name)
    src/dynamics/         integrators, forces, mass properties, sleeping
    src/collision/        broadphase, narrowphase (analytic + GJK/EPA), ray-vs-shape, manifolds, queries
    src/constraints/      contact + joint solver (sequential impulse / PGS)
    src/world/            createWorld, step, events, snapshot
    src/index.ts
  tools/benchmark/        step benchmarks (same scenes as fourJS benchmarks/physics-step.mjs)
  tests/                  cross-package and fourJS-adapter conformance scenarios
  docs/design/            this file
```

**Decision (2):** 0.x ships only `core` and `functions`. `dynamics`, `collision` and `constraints` are directories inside `functions/` and split into their own packages later without an API change. **Decision (1):** GJK/EPA, support mapping and ray-vs-shape tests live in PhysJS `functions/src/collision/`. **Decision (4):** 2D runs on the same engine with `dims: 2`.

**Data-driven, not hand lists.** Each shape kind is one record in `core/src/catalog/shapes.ts` (`{ kind, dims, params schema, support, massProperties, aabb, raycast }`); the narrowphase picks an algorithm per *pair of capabilities* (sphere-like, convex-support, mesh) from a table, not a `switch` per pair. Joints are rows of constrained DOFs (`{ kind, linearAxes, angularAxes, limits, motor }`) solved by one generic constraint row solver. Integrators are the same table fourJS already uses (`INTEGRATORS`). Adding a shape or joint means adding a row, not a file.

## 4. API sketch

MathTS style: free functions, plain data, named exports, typed-function dispatch for vector inputs (arrays, MathTS `Matrix`, typed arrays).

```ts
import { createWorld, addBody, addCollider, addJoint, step, raycast, drainEvents } from '@danielsimonjr/physjs';
import { gravity } from '@danielsimonjr/mathts-functions';   // standard gravity, not redefined here
import { unit } from '@danielsimonjr/mathts-units';

const world = createWorld({ dims: 3, gravity: [0, -gravity.toNumber('m/s^2'), 0], lengthUnit: unit('m') });
const ground = addBody(world, { type: 'static' });
addCollider(world, ground, { shape: { type: 'box', halfExtents: [10, 0.5, 10] }, material: { friction: 0.6 } });
const ball = addBody(world, { type: 'dynamic', position: [0, 5, 0] });
addCollider(world, ball, { shape: { type: 'sphere', radius: 0.5 }, density: 1000 });
addJoint(world, { type: 'spring', a: ground, b: ball, stiffness: 50, damping: 2 });

step(world, 1 / 60);                         // fixed step, deterministic for a given input
for (const e of drainEvents(world)) { /* contact-begin / contact-end / trigger */ }
const hits = raycast(world, { origin: [0, 10, 0], direction: [0, -1, 0], maxDistance: 20 });
const snap = snapshot(world); restore(world, snap);   // ArrayBuffer, matches fourJS createSnapshot
```

Handles are opaque numbers (generation-tagged, like fourJS's `stale-handle.ts`). Body state is stored in struct-of-arrays `Float64Array`s inside the world, so `step` does not allocate; read accessors (`getPosition(world, h, out?)`) take an optional `out` to stay allocation-free. Descriptor field names follow fourJS's `RigidBodyDescriptor` / `ColliderDescriptor` / `JointDescriptor` so the fourJS adapter is a near pass-through.

## 5. Core subset first, later pieces

| Area | 0.x core (first) | Later |
|---|---|---|
| Bodies | dynamic / kinematic / static, mass & inertia from shape+density, damping, gravity scale, sleeping | CCD, body-type transitions with velocity inheritance, pose-target blending |
| Shapes 3D | sphere, box, capsule | cylinder, cone, convex-hull, triangle-mesh, height-field, compound |
| Shapes 2D | circle, rectangle, capsule, polygon | polyline, chain |
| Broadphase | sweep-and-prune on AABBs (one algorithm, both dims) | dynamic AABB tree, spatial hash for particles |
| Narrowphase | analytic sphere/capsule pairs + GJK/EPA for convex support shapes; contact manifolds | mesh/heightfield, persistent manifolds w/ warm-start caching tuned |
| Solver | sequential impulse (PGS) with warm start, friction, restitution, Baumgarte/split-impulse | TGS/sub-stepping, island splitting, parallel (MathTS `parallel`) |
| Joints | fixed, hinge, spherical, spring (generic DOF-row solver) | slider, rope, motors, limits, break thresholds |
| Integrators | semi-implicit Euler (default), velocity Verlet | rk2/rk4 for force fields, symplectic options |
| Queries | raycast, overlap, point query | shapeCast, swept character controller |
| Events | contact begin/end, trigger enter/exit | contact force reports, event interest filters |
| Other | snapshot/restore, checksum | force fields, soft bodies, Modelica (see library-architecture.md), WASM tier |

## 6. MathTS dependencies and gaps

PhysJS uses MathTS for: units (`@danielsimonjr/mathts-units`, including world length/mass scaling now done by fourJS `world-units.ts`), constants (`gravity`, CODATA 2022 set in `mathts-functions`), vectors/matrices/linear algebra (`dot`, `cross`, `norm`, `inv`, `det`, `eigs`, `cholesky`, `lusolve`), quaternions (`quaternionMultiply/Normalize/FromAxisAngle/Rotate/ToRotationMatrix/Slerp/Inverse/...`), geometry (`convexHull`, halfspace intersection).

Gaps filed as MathTS issues (label `physjs`; nothing copied into PhysJS). GJK/EPA and ray-vs-shape tests are not a MathTS gap: they live in PhysJS collision (decision 1).

1. **Allocation-free fixed-size vec2/vec3/quat/mat3 kernels.** MathTS quaternion/vector helpers take `number[]` and return new arrays. A solver inner loop needs `out`-parameter or strided `Float64Array` variants (e.g. `vec3.cross(out, a, b)`, `quat.integrate(out, q, omega, dt)`). fourJS's `alloc-counter.ts` shows this matters. [MathTS #375](https://github.com/danielsimonjr/MathTS/issues/375)
2. **Duplicate quaternion modules.** `functions/src/geometry-extra.ts` and `functions/src/geometry/geometry-extra.ts` both define quaternion functions; one canonical set is needed before PhysJS depends on it. [MathTS #376](https://github.com/danielsimonjr/MathTS/issues/376)
3. **Symmetric 3x3 eigen-decomposition (Jacobi) and inertia-tensor ops** (rotate tensor `R I R^T`, parallel-axis shift). `eigs` is general N x N and allocates. [MathTS #377](https://github.com/danielsimonjr/MathTS/issues/377)
4. **Mass properties of shapes/polyhedra** (volume, centroid, inertia tensor of convex polyhedron, capsule, cylinder, cone). Pure geometry, belongs next to `convexHull`. [MathTS #378](https://github.com/danielsimonjr/MathTS/issues/378)
5. **Small dense box-constrained LCP / projected Gauss-Seidel solver** (generic numerics; PhysJS uses it for contacts and joints). [MathTS #379](https://github.com/danielsimonjr/MathTS/issues/379)
6. **Determinism controls:** a documented deterministic mode (no FMA/reordering differences between JS and WASM tiers) so `checksum()`/snapshot replay match across runs. [MathTS #380](https://github.com/danielsimonjr/MathTS/issues/380)
7. **Mat4 / affine transforms and Frustum** are used heavily by fourJS rendering (Matrix4 ~330 uses, Frustum 24). Not needed by PhysJS, but needed for the "fourJS math replaced by MathTS" end goal. [MathTS #381](https://github.com/danielsimonjr/MathTS/issues/381)

## 7. Lean removal plan

UPT `lean/` became canonical in UPT 11.0.0 (merged with full history, `f0aa620c`). In PhysJS, one PR (milestone 0.0.0) will:

- delete `lean/`, `lean.lean`, `lakefile.toml`, `lean-toolchain`, `lake-manifest.json`, `manifest/`, `packages/proofs`, `scripts/check-proofs-changeset.ts`, `scripts/manifest-kind.ts`, `scripts/check-tier0-markers.ts`, `tests/lean-layout.test.ts`, `tests/manifest-kind.test.ts`, the Lean jobs in `.github/workflows/`, and the proof-only changesets in `.changeset/`;
- delete the private bridge packages (`bridges, em, fluids, gr, mechanics, optics, plasma, thermo`, current `core`) and the Modelica plan (decision 5, clean start);
- rewrite `README.md`: "Lean proofs moved to [UPT `lean/`](https://github.com/danielsimonjr/Universal-Physics-Tensor/tree/master/lean); history before commit `<sha>` holds them";
- delete `docs/design/library-architecture.md` (with its Modelica plan) and `docs/feasibility/`; this plan replaces them;
- git history stays; nothing is rewritten or force-pushed. Tag the last proof commit `lean-archive` for easy reference.

## 8. FourJS migration map

| fourJS today | PhysJS / MathTS replacement |
|---|---|
| `@fourjs/math` `Vector2/3/4`, `Quaternion`, `Matrix3` (Vector3 ~3.4k uses, 1.35k in physics) | MathTS fixed-size kernels (gap 1); fourJS keeps thin classes over them during transition |
| `@fourjs/math` `Matrix4`, `Frustum`, color | MathTS (gap 8); rendering migration is separate from physics |
| `@fourjs/physics` `PhysicsSolverAdapter` | new `@fourjs/physics-physjs` adapter behind `SolverRegistry` (decision 3) mapping 1:1 to PhysJS `createWorld/addBody/addCollider/addJoint/step/drainEvents/raycast/overlap/pointQuery/snapshot` |
| `RigidBodyDescriptor`, `ColliderDescriptor`, `JointDescriptor`, shape unions | PhysJS core types use the same field names; adapter is pass-through |
| `world-units.ts` (`toSiLength`, `toSiMass`) | MathTS units |
| `@fourjs/motion` `INTEGRATORS` | PhysJS `dynamics` integrator table (same names) |
| `@fourjs/motion` spatial hash | PhysJS broadphase (later) |
| `@fourjs/physics-rapier`, `physics-box2d` | retired once the PhysJS adapter passes fourJS's physics test suite and `benchmarks/physics-step.mjs` within an agreed factor |
| fourJS-only concerns (scene sync, `Node`, transform authority, ECS systems, serializer registry) | stay in fourJS |

Acceptance gate for migration: fourJS's existing physics tests run against the PhysJS adapter via `SolverRegistry` alongside Rapier, and differences are reported, not hidden.

## 9. Milestones (0.x releases)

| Version | Content |
|---|---|
| 0.0.0 | Lean + bridge packages + Modelica plan removed, README points to UPT `lean/`, MathTS-shaped skeleton (`core` + `functions`, turbo, changesets, CI, oxlint, vitest + bun test) |
| 0.1.0 | core types + catalog tables, `createWorld`, bodies, semi-implicit Euler, gravity, sphere/box/capsule mass properties |
| 0.2.0 | broadphase (SAP), narrowphase (analytic + GJK/EPA), contact manifolds, overlap/raycast/point queries |
| 0.3.0 | PGS contact solver w/ friction, restitution, warm start, sleeping; events |
| 0.4.0 | joints (fixed, hinge, spherical, spring); snapshot/restore/checksum |
| 0.5.0 | 2D world (circle, rectangle, capsule, polygon) on the same engine |
| 0.6.0 | `@fourjs/physics-physjs` adapter in fourJS; conformance + benchmark report |
| 0.7.0+ | later-column items (convex hull/mesh/heightfield, shapeCast, slider/rope/motors, CCD, WASM tier); split `functions/` subdirectories into packages when warranted |

Each release goes through changesets and CI publish; each MathTS gap must be released in MathTS before the PhysJS milestone that needs it.

**0.1.0 and gap 4.** Bodies, the catalogs, `createWorld`, semi-implicit Euler and density-based `addCollider` are built. Collider mass properties come from MathTS `massProperties` (#378, mathts-functions 0.69.0); a dynamic body takes its mass and inertia from its colliders or from explicit values. 0.1 colliders are centred on the body origin.

## 10. Decisions (Daniel, 2026-10-15)

1. GJK/EPA, support mapping and ray-vs-shape tests live in PhysJS `collision`.
2. 0.x ships only `core` and `functions`; split later.
3. fourJS uses a `@fourjs/physics-physjs` adapter behind `SolverRegistry`.
4. 2D runs on the same engine with `dims: 2`.
5. The private bridge packages and the Modelica plan are deleted with the Lean proofs, for a clean start.
6. Tests use both vitest and `bun test`, like MathTS.