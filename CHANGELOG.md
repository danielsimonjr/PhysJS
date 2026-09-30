# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Lean 4 lake project. Direct requires: Mathlib `v4.34.1` and Physlib
  `af484f78ee0701290595f8bf892b157b10d64940` (the library Daniel calls PhysLean).
  Toolchain pinned at `leanprover/lean4:v4.34.1`.
- GitHub Actions CI: `lake build` with the Mathlib cache, and an axiom audit
  (no `sorry`, no `native_decide`, no axiom beyond `propext`, `Classical.choice`,
  and `Quot.sound`).
- Repository files for a public GitHub project: `CONTRIBUTING`, `CODE_OF_CONDUCT`,
  `SECURITY`, issue and pull-request templates.
- `packages/engineering-physics/` reserved for a later npm package. Nothing is
  published under `@danielsimonjr/physjs` yet.
- README target list reordered to the scoping report §4.3. Rank 1 is first.
  A partial proof is marked so that it covers its statement only.
- Milestone 1 theorems for `ab-kg-schrodinger`, `ab-klein-gordon-wave`,
  `ab-stiff-string`, `ab-telegraph-diffusion`, and `ab-telegraph-wave`.
  Each is a complete Lean proof that the closed-form error is monotone on the
  regime and equals `bound.delta` at the edge. Each covers its statement only.
- `PhysJS.Pendulum.linearizedEquationOfMotion_iff`, a PhysJS theorem that
  imports Physlib's `linearizedEquationOfMotion_iff`. It covers the
  transformation, not `bound.delta`.
- A wrong-dictionary lemma beside each theorem.
- `manifest/bridges.json`: theorem name, UPT bridge id, covers line.
- `PhysJS.KgOscillator.uniform_solves_equationOfMotion`, a complete proof that a
  smooth spatially uniform solution of the Klein–Gordon equation solves
  Physlib's `HarmonicOscillator.EquationOfMotion` with `ω = ω₀`. It covers
  the uniform-mode restriction in Physlib's own terms.

## [0.0.0] - 2026-09-22

### Added

- **Repository created 2026-09-22.** Authorised by the owner after UPT's Phase 4 formalRef criterion
  was measured at 1 of 5 rather than assumed — every candidate file in Physlib at `5ad56e2` read,
  Lean built locally, axioms checked with `#print axioms`, and a positive control (`sorry` →
  `sorryAx`) run first to prove the checker could detect what it was looking for. Exactly one bridge
  has a real checked counterpart; d'Alembert exists only in the converse direction.
- README recording *why* this repository exists, written at creation rather than reconstructed later.
- MIT licence, matching UPT.
- npm handle recorded as `@danielsimonjr/physjs`.
