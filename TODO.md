# TODO

Open work between sessions. The milestones are in `docs/design/PHYSICS_ENGINE_PLAN.md` section 9.

## Blocked on MathTS

- [ ] Mass from shape and density: sphere, box and capsule mass properties come from MathTS [#378](https://github.com/danielsimonjr/MathTS/issues/378). When it ships, add `massProperties` to the `SHAPES` rows, `addCollider` with `density`, and derive body mass and inertia from colliders (0.1.0 release waits for this).
- [ ] Full inertia tensor input (`inertiaTensor`, diagonalized to principal moments and a body frame) needs MathTS [#377](https://github.com/danielsimonjr/MathTS/issues/377).
- [ ] Allocation-free `step`: the orientation update and the torque-to-angular-acceleration rotation call MathTS quaternion functions that return new arrays. Swap to the MathTS [#375](https://github.com/danielsimonjr/MathTS/issues/375) kernels when they ship.
- [ ] Depend on the canonical MathTS quaternion module once [#376](https://github.com/danielsimonjr/MathTS/issues/376) lands (the barrel names stay the same).

## Engine

- [ ] 0.2.0: broadphase (SAP), narrowphase (analytic + GJK/EPA), contact manifolds, overlap/raycast/point queries.
- [ ] Gyroscopic term (`w x I w`) in the angular update, as an integrator option.
- [ ] Typed-function dispatch so vector inputs also accept MathTS `Matrix` values (plan section 4).
- [ ] World units (`lengthUnit` and friends) through `@danielsimonjr/mathts-units` (plan section 4).
- [ ] Pose-target blending for `kinematic-position` bodies (velocity from the target pose).

## Repository

- [ ] `AGENTS.md` (listed in the plan's directory tree, not yet written).
- [ ] The Release workflow opens the "chore: release packages" PR only if the repository setting "Allow GitHub Actions to create and approve pull requests" is on. It is off, so the Version job fails while a changeset is pending.
