---
'@danielsimonjr/physjs-core': minor
'@danielsimonjr/physjs': minor
---

Colliders with density (0.1 milestone): `addCollider(world, body, { shape, density })`, `removeCollider` and `getCollider`. A dynamic body's mass and principal inertia are the sums over its colliders, computed by MathTS `massProperties` (mathts-functions 0.69.0, MathTS #378); explicit `mass`/`inertia` remain available, and a dynamic body no longer requires `mass` at `addBody`. `removeBody` drops the body's colliders. Adds the Publish workflow (NPM secret, `changeset publish`), called by Release when a push bumps a package version.
