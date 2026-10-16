---
'@danielsimonjr/physjs-core': minor
'@danielsimonjr/physjs': minor
---

Contact solver and events (0.3): `MATERIAL_FIELDS` (friction, restitution) with combine rules, `EVENT_TYPES`, `SOLVER_DEFAULTS`, the `unitInterval` value rule, sleep columns in `BODY_FIELDS`, and event and solver-state types (core). `step` now runs velocity phase, contacts, a projected Gauss-Seidel solver with friction, restitution, Baumgarte push-out, speculative margin and warm start, then position phase and sleeping; `drainEvents`, `isSleeping`, `wakeBody`, and collider `friction` / `restitution` (physjs). Integrator rows split into `velocity` and `position` phases.
