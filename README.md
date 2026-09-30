# PhysJS

**Out-of-tree Lean 4 proofs of the [Universal Physics Tensor](https://github.com/danielsimonjr/Universal-Physics-Tensor) bridge dictionaries.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Why this repository exists

UPT's Phase 4 exit criterion asks for **≥ 5 bridges with a reviewed `formalRef`**. On 2026-09-22 that criterion was measured rather than assumed, and it came back at **1**.

The measurement is worth stating, because it is the reason this repository is honest:

- Every candidate file in [Physlib](https://github.com/leanprover-community/physlib) at `5ad56e2` was searched and read.
- Lean was **built locally** and the axioms were measured with `#print axioms` — not inferred from documentation.
- A **positive control** was run first: a deliberate `sorry` correctly printed `sorryAx`, confirming the checker could detect the thing it was looking for.

Result: exactly **one** bridge has a real checked counterpart — `ab-pendulum-linear → linearizedEquationOfMotion_iff`. d'Alembert exists only in the **converse** direction. Nothing else has a counterpart at all.

The count moved from 5 to 1 because the honesty rule held. **An exit criterion honestly open is worth more than one nominally met.**

## What goes in here

Proofs of the bridge dictionaries, in the order of
[UPT's formalRef scoping report](https://github.com/danielsimonjr/Universal-Physics-Tensor/blob/master/docs/research/phase-4-formalref-scoping.md) §4.3.
The schedule is the [Lean-proved bridges roadmap](https://github.com/danielsimonjr/Universal-Physics-Tensor/blob/master/docs/design/roadmap-lean-proven-bridges.md).
Milestone 1 is route A: the rank-1 row.

| Rank | Bridge | What the lemma covers |
|---|---|---|
| 1 | `ab-kg-schrodinger` | `bound.delta` at the dispersion relation |
| 1 | `ab-klein-gordon-wave` | `bound.delta` at the dispersion relation |
| 1 | `ab-stiff-string` | `bound.delta` at the dispersion relation |
| 1 | `ab-telegraph-diffusion` | `bound.delta` at the dispersion relation |
| 1 | `ab-telegraph-wave` | `bound.delta` at the dispersion relation |
| — | `ab-pendulum-linear` | the transformation, not `bound.delta`. A PhysJS theorem that imports Physlib |

Later, still in §4.3 order:

| Rank | Bridge | What a later lemma would cover |
|---|---|---|
| 4 | `ab-wave-dalembert` | the missing direction of d'Alembert's formula |
| — | `ab-stokes-einstein`, `ab-heat-diffusion` | not counted. The physics is in the premises |

A reference covers its statement only. A partial proof is marked that way in `manifest/bridges.json` and is not a proof of the rest of the bridge. `formally-proved` in UPT is derived, never hand-set.

## Layout

```
lakefile.toml          Lean 4 package. Requires Mathlib and Physlib directly.
lean-toolchain         pinned toolchain
PhysJS/                Lean sources
manifest/              theorem name → UPT bridge id → covers line
packages/              reserved for a later TypeScript package
.github/               issue and pull-request templates, CI
```

`packages/engineering-physics/` is the slot for a future engineering-physics npm package, on the same kind of packages layout as [MathTS](https://github.com/danielsimonjr/MathTS). That package is not published from this repository yet.

## Milestone 1

The rank-1 lemmas and the pendulum reference are proved. Each Lean proof is complete: no `sorry`. Each one covers its statement only, which is the covers line in `manifest/bridges.json`.

| Bridge | Theorem | Lean proof |
|---|---|---|
| `ab-kg-schrodinger` | `PhysJS.KgSchrodinger.covers_bound_delta` | complete |
| `ab-klein-gordon-wave` | `PhysJS.KleinGordonWave.covers_bound_delta` | complete |
| `ab-stiff-string` | `PhysJS.StiffString.covers_bound_delta` | complete |
| `ab-telegraph-diffusion` | `PhysJS.TelegraphDiffusion.covers_bound_delta` | complete |
| `ab-telegraph-wave` | `PhysJS.TelegraphWave.covers_bound_delta` | complete |
| `ab-pendulum-linear` | `PhysJS.Pendulum.linearizedEquationOfMotion_iff` | complete, imports Physlib |

A wrong-dictionary lemma sits next to each one. It is false for the neighbouring bridge's closed form, so a swapped dictionary does not satisfy the statement.

## Milestone 2, rank 1a

A non-trivial plane wave solves the PDE if and only if `ω(k)` obeys that PDE's dispersion relation. The zero wave is excluded. Each proof is complete. Each one covers that statement only, and none of them proves `covers_bound_delta`.

| Bridge | Theorem | What the equivalence says |
|---|---|---|
| `ab-kg-schrodinger` | `PhysJS.KgSchrodinger.planeWave_iff_dispersion` | Klein–Gordon `ω² = c²k² + ω₀²`, and Schrödinger `ω = c²k² / (2ω₀)` |
| `ab-klein-gordon-wave` | `PhysJS.KleinGordonWave.planeWave_iff_dispersion` | Klein–Gordon as above, and the wave equation `ω² = c²k²` |
| `ab-stiff-string` | `PhysJS.StiffString.planeWave_iff_dispersion` | stiff `ω² = (F/μ)k² + (EI/μ)k⁴`, and flexible `ω² = (F/μ)k²` |
| `ab-telegraph-diffusion` | `PhysJS.TelegraphDiffusion.planeWave_iff_dispersion` | telegraph `τσ² + σ + Dq² = 0`, and Fick `σ = −Dq²` |
| `ab-telegraph-wave` | `PhysJS.TelegraphWave.planeWave_iff_dispersion` | underdamped telegraph `ω² = (D/τ)q² − 1/(4τ²)`, and the wave equation at `c² = D/τ` |

The manifest keeps the rank-1 theorem as the entry's `theorem`. The rank-1a theorem is the entry's `planeWave` object. One `formalRef` per bridge id already names `covers_bound_delta`.

## Milestone 2, rank 2

`PhysJS.KgOscillator.uniform_solves_equationOfMotion` is a complete proof of the uniform-mode restriction. A field that does not depend on `x` and solves `u_tt = c² u_xx − ω₀² u`, and whose time profile is `ContDiff ℝ ∞`, embeds as a solution of Physlib's `HarmonicOscillator.EquationOfMotion` with `ω = ω₀`. The speed `c` drops out because the second space derivative of a uniform field is zero. The smoothness hypothesis is the one Physlib's Newton-law equivalence asks for. The theorem covers that statement only.

## Milestone 2, rank 3

`PhysJS.SpringLc.time_rescale_equationOfMotion` and `PhysJS.DampedRlc.time_rescale_equationOfMotion` are complete proofs of the oscillator dictionary. Physlib states both sides. An LC circuit is `HarmonicOscillator` with `m ↦ L` and `k ↦ 1/C`. An RLC circuit is `DampedHarmonicOscillator` with the same replacement and `γ ↦ R`. Those names are the dictionary's reading; Physlib has no circuit.

Time rescaling by the ratio of the two angular frequencies, together with a nonzero amplitude factor, is an equivalence of `ContDiff ℝ ∞` solutions. On the damped side the damping ratios `γ / (2 √(m k))` must agree, which is `b / (2 √(m k)) = (R / 2) √(C / L)` in the dictionary's names. Each theorem covers that statement only.

## Build

The toolchain is pinned in `lean-toolchain` (`leanprover/lean4:v4.34.1`). Mathlib is `v4.34.1`. Physlib (PhysLean) is pinned by commit in `lakefile.toml`.

```bash
lake exe cache get
lake build
```

CI runs `lake build` with the Mathlib cache, then an axiom audit of the `PhysJS` namespace. The audit allows `propext`, `Classical.choice`, and `Quot.sound`. It rejects `sorry`, `admit`, `native_decide`, and any other axiom.

## Manifest

UPT consumes `manifest/bridges.json`. A `formalRef` names a manifest key. The entry carries the theorem name, the UPT bridge id, and the covers line. The key is enough: UPT does not vendor the Lean sources.

## What this is not

**These are algebra-level lemmas and the ceiling is modest.** This repository does not claim a deep formalisation of physics. A bridge marked `formally-proved` points at a statement a checker has verified, and that statement is only what the covers line says.

## Why out of tree

UPT's roadmap requires the proof artifacts to live outside the main repository, so that the library under test and the thing testing it cannot drift into each other.

## npm handle

**`@danielsimonjr/physjs`** — verified free on the registry 2026-09-22.

**Lowercase, because npm rejects uppercase in new package names.** `PhysJS` is branding only. The package itself comes later. It is not published from this repository.

## Licence

MIT — matching UPT.
