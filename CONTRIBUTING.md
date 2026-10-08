# Contributing to PhysJS

PhysJS holds the Lean 4 proofs behind Universal Physics Tensor `formalRef` records. The proofs stay out of the UPT repository.

## Prerequisites

- [elan](https://github.com/leanprover/elan), so the pin in `lean-toolchain` is the compiler you use
- Git
- [Bun](https://bun.sh) `1.4.2`, for the TypeScript workspace

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
- A kind line in the module docstring of the Lean file, one per key: `` `be-80`. Bridge. `` when the theorem states the catalog equation, otherwise `Reduction`, `Limit`, `Derivation step`, `Property`, or `Cross-check`. Run `bun scripts/manifest-kind.ts --write` to copy it into the entry's `kind`. Do not write the kind at the head of the covers line.
- If the proof is partial, the manifest entry says it covers its statement only. Do not describe it as a proof of the whole bridge.
- No `sorry`, no `admit`, and no `native_decide`. CI audits the `lean` module and allows only `propext`, `Classical.choice`, and `Quot.sound`.
- Lean sources live in `lean/`, flat. `lakefile.toml` sets `roots = ["lean"]` and `globs = ["lean.*"]`, so `lake build` builds `lean.lean` and every `lean/<Name>.lean`. A new file is `lean/<Name>.lean`. Its module is `lean.<Name>`. Import it from `lean.lean` as `import lean.<Name>`, and add `lean/<Name>.lean` to `manifest/lean-files.json`. The namespace stays `namespace PhysJS.<Name>`, so the theorem name does not change.

## Local axiom check

CI runs the audit. The same check is `leanprover-community/axiom-audit` over the `lean` module, which is what the workflow calls after `lake build`.

## The TypeScript workspace

Tier 0 is the private Bun workspace under `packages/`. Tier 1 is `@danielsimonjr/physjs-core` (constants, quantities, and the `e` / `E` / `exp` binding). The design is `docs/design/library-architecture.md`. Packages stay `"private": true`. Do not publish `@danielsimonjr/physjs` by hand. The Lean sources are not an npm package.

```bash
bun install --frozen-lockfile
bun test
bun run build
```

## Secrets

Do not commit credentials, tokens, private notes, or local environment files. The repository is expected to be readable by anyone once it is public.

## Conduct

`CODE_OF_CONDUCT.md` applies to issues, pull requests, and reviews.

## Reporting a vulnerability

See `SECURITY.md`. Do not file a public issue for a security report.
