---
'@danielsimonjr/physjs-core': minor
'@danielsimonjr/physjs': minor
---

Joints and snapshots (0.4): `JOINT_TYPES` (fixed, hinge, spherical, spring) as linear/angular mode rows with parameter schemas, joint types, `World.joints` and `SOLVER_DEFAULTS.jointBaumgarte` (core). `addJoint`, `removeJoint`, `getJoint`, with joint rows solved alongside contacts, spring loads, and no collision between jointed bodies unless `collideConnected`; `snapshot`, `restore` and `checksum` for bit-exact replay (physjs).
