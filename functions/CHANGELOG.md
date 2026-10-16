# @danielsimonjr/physjs

## 0.5.0

### Minor Changes

- 1a0947c: 2-D worlds through `dims: 2` on the same engine: circle, rectangle, capsule2d and convex polygon shapes; `[x, y]` vectors, a rotation angle and scalar angular velocity/torque through each `BODY_FIELDS` row's `planar` view; in-plane contacts; joint rows declare the dims they support.

### Patch Changes

- Updated dependencies [1a0947c]
  - @danielsimonjr/physjs-core@0.5.0

## 0.4.0

### Minor Changes

- cc89fcf: Joints and snapshots (0.4): `JOINT_TYPES` (fixed, hinge, spherical, spring) as linear/angular mode rows with parameter schemas, joint types, `World.joints` and `SOLVER_DEFAULTS.jointBaumgarte` (core). `addJoint`, `removeJoint`, `getJoint`, with joint rows solved alongside contacts, spring loads, and no collision between jointed bodies unless `collideConnected`; `snapshot`, `restore` and `checksum` for bit-exact replay (physjs).

### Patch Changes

- Updated dependencies [cc89fcf]
  - @danielsimonjr/physjs-core@0.4.0

## 0.3.0

### Minor Changes

- a176ef4: Contact solver and events (0.3): `MATERIAL_FIELDS` (friction, restitution) with combine rules, `EVENT_TYPES`, `SOLVER_DEFAULTS`, the `unitInterval` value rule, sleep columns in `BODY_FIELDS`, and event and solver-state types (core). `step` now runs velocity phase, contacts, a projected Gauss-Seidel solver with friction, restitution, Baumgarte push-out, speculative margin and warm start, then position phase and sleeping; `drainEvents`, `isSleeping`, `wakeBody`, and collider `friction` / `restitution` (physjs). Integrator rows split into `velocity` and `position` phases.

### Patch Changes

- Updated dependencies [a176ef4]
  - @danielsimonjr/physjs-core@0.3.0

## 0.2.0

### Minor Changes

- aa2d6f1: Collision (0.2): `COLLISION_CORES` and a `core` per `SHAPES` row, `COLLISION_DEFAULTS`, and the contact, ray-hit and bounding-box types (core). Sweep-and-prune broadphase, an analytic narrowphase for sphere/capsule pairs and GJK/EPA for boxes, clipped contact manifolds of up to four points, and `findContacts`, `raycast`, `overlap`, `pointQuery` and `colliderAabb` (physjs).

### Patch Changes

- Updated dependencies [aa2d6f1]
  - @danielsimonjr/physjs-core@0.2.0

## 0.1.0

### Minor Changes

- df30736: Bodies and integration (0.1 milestone): body-type, body-field, integrator and shape catalogs; `createWorld`, `addBody`/`removeBody` with generation-tagged handles, pose and velocity accessors, `applyForce`/`applyTorque`, and `step` with semi-implicit Euler under MathTS standard gravity. Dynamic bodies take an explicit mass and principal inertia until MathTS ships shape mass properties (MathTS #378).
- 52dd40d: Colliders with density (0.1 milestone): `addCollider(world, body, { shape, density })`, `removeCollider` and `getCollider`. A dynamic body's mass and principal inertia are the sums over its colliders, computed by MathTS `massProperties` (mathts-functions 0.69.0, MathTS #378); explicit `mass`/`inertia` remain available, and a dynamic body no longer requires `mass` at `addBody`. `removeBody` drops the body's colliders. Adds the Publish workflow (NPM secret, `changeset publish`), called by Release when a push bumps a package version.

### Patch Changes

- Updated dependencies [df30736]
- Updated dependencies [52dd40d]
  - @danielsimonjr/physjs-core@0.1.0
