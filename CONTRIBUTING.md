# Contributing to PhysJS

PhysJS holds the Lean 4 proofs behind Universal Physics Tensor `formalRef` records. The proofs stay out of the UPT repository.

## Prerequisites

- [elan](https://github.com/leanprover/elan), so the pin in `lean-toolchain` is the compiler you use
- Git

`lake` comes with the toolchain. Do not install a second Lean beside elan.

## Setup

```bash
git clone https://github.com/danielsimonjr/PhysJS.git
cd PhysJS
lake exe cache get
lake build
```

`lake exe cache get` downloads the Mathlib build cache. Physlib modules that this package imports are built from the pinned commit.

## What a pull request should contain

- A theorem whose statement matches a covers line. Rank 1 of the UPT scoping report §4.3 comes before the later ranks.
- An update to `manifest/bridges.json`: theorem name, UPT bridge id, covers line. UPT resolves a `formalRef` by that key.
- If the proof is partial, the manifest entry says it covers its statement only. Do not describe it as a proof of the whole bridge.
- No `sorry`, no `admit`, and no `native_decide`. CI audits the `PhysJS` namespace and allows only `propext`, `Classical.choice`, and `Quot.sound`.

## Local axiom check

CI runs the audit. The same check is `leanprover-community/axiom-audit` over the `PhysJS` namespace, which is what the workflow calls after `lake build`.

## The TypeScript package

`packages/engineering-physics/` is reserved. The design proposal is `docs/design/library-architecture.md`. Do not scaffold packages, and do not publish `@danielsimonjr/physjs`, until Daniel approves the tier that would do it. The Lean sources are not an npm package.

## Secrets

Do not commit credentials, tokens, private notes, or local environment files. The repository is expected to be readable by anyone once it is public.

## Conduct

`CODE_OF_CONDUCT.md` applies to issues, pull requests, and reviews.

## Reporting a vulnerability

See `SECURITY.md`. Do not file a public issue for a security report.
