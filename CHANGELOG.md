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
- Rank 1a for the same five bridges. `planeWave_iff_dispersion` is a complete
  proof that a non-trivial plane wave solves the PDE if and only if `ω(k)`
  obeys that PDE's dispersion relation. The reviewed rank-1 theorem is
  unchanged. The new theorem is the entry's `planeWave` object.
- `PhysJS.KgOscillator.uniform_solves_equationOfMotion`, a complete proof that a
  smooth spatially uniform solution of the Klein–Gordon equation solves
  Physlib's `HarmonicOscillator.EquationOfMotion` with `ω = ω₀`. It covers
  the uniform-mode restriction in Physlib's own terms.
- `PhysJS.SpringLc.time_rescale_equationOfMotion` and
  `PhysJS.DampedRlc.time_rescale_equationOfMotion`, complete proofs that time
  rescaling is an equivalence of smooth solutions between a spring and the
  oscillator Physlib obtains by `m ↦ L`, `k ↦ 1/C`, and, on the damped side,
  `γ ↦ R` with equal damping ratios. Each covers the oscillator dictionary.
- `PhysJS.WaveDalembert.solution_eq_profiles`, a complete proof that a jointly
  `C²` solution of Physlib's one-dimensional wave equation, at nonzero speed,
  is a sum of a right-going profile and a left-going profile. It covers the
  missing direction of d'Alembert's formula.
- `PhysJS.Eddington.balance_iff`, a complete proof that the Eddington force
  balance holds if and only if `L = 4 π G M m_p c / σ_T`. The radius cancels.
  A factor of two on that luminosity fails the balance. It covers that
  derivation step of `be-64`, not a hard cap.
- `PhysJS.YangMills.b0_pos_iff_nf_le`, a complete proof that the SU(3)
  one-loop coefficient is positive if and only if `N_f ≤ 16`. At 16 the value
  is `1/3`. Seventeen flavors fail the positive claim. The nested `oneLoop`
  theorem is the closed form of the running equation. It covers those two
  parts of `be-53`, not a running procedure past one loop.
- `PhysJS.JohnsonNyquist.tendsto_classical`, a complete proof that the quantum
  Johnson–Nyquist spectrum tends to `4 k_B T R` as `ω → 0⁺`. The same
  expression with `+ 1` in the denominator tends to `0` instead. It covers
  that limit of `be-58`, not the fluctuation–dissipation theorem.

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
