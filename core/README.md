# @danielsimonjr/physjs-core

Core types, data catalogs and configuration for [PhysJS](https://github.com/danielsimonjr/PhysJS). The engine reads these tables instead of switching on names:

| Export               | Contents                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| `BODY_TYPES`         | `static`, `dynamic`, `kinematic-position`, `kinematic-velocity`: whether each integrates and responds to loads |
| `BODY_FIELDS`        | Every per-body column: components, default, value rule, role                                                   |
| `INTEGRATOR_CATALOG` | Integrator names and properties (`semi-implicit-euler`)                                                        |
| `SHAPES`             | `sphere`, `box`, `capsule` with their parameter schemas (fourJS names)                                         |
| `VALUE_RULES`        | The number rules the tables name                                                                               |
| `WORLD_DEFAULTS`     | Default integrator, up vector and store capacity                                                               |

It also holds the plain-data types (`BodyDescriptor`, `World`, `WorldOptions`, shapes). Units, constants and mathematics come from MathTS. See docs/design/PHYSICS_ENGINE_PLAN.md.
