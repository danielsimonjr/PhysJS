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

| Rank | Bridge                   | What the lemma covers                                                        |
| ---- | ------------------------ | ---------------------------------------------------------------------------- |
| 1    | `ab-kg-schrodinger`      | `bound.delta` at the dispersion relation                                     |
| 1    | `ab-klein-gordon-wave`   | `bound.delta` at the dispersion relation                                     |
| 1    | `ab-stiff-string`        | `bound.delta` at the dispersion relation                                     |
| 1    | `ab-telegraph-diffusion` | `bound.delta` at the dispersion relation                                     |
| 1    | `ab-telegraph-wave`      | `bound.delta` at the dispersion relation                                     |
| —    | `ab-pendulum-linear`     | the transformation, not `bound.delta`. A PhysJS theorem that imports Physlib |

Later, still in §4.3 order:

| Rank | Bridge                                    | What a later lemma would cover              |
| ---- | ----------------------------------------- | ------------------------------------------- |
| —    | `ab-stokes-einstein`, `ab-heat-diffusion` | not counted. The physics is in the premises |

A reference covers its statement only. A partial proof is marked that way in `manifest/bridges.json` and is not a proof of the rest of the bridge. `formally-proved` in UPT is derived, never hand-set.

## Layout

```
lakefile.toml          Lean 4 package. Requires Mathlib and Physlib directly.
lean-toolchain         pinned toolchain
lean.lean              aggregator. Module `lean`.
lean/                  Lean sources, flat. `lean/<File>.lean` is module `lean.<File>`.
manifest/              theorem name → UPT bridge id → covers line
packages/              private Bun workspace. Tier 1 core; other packages are markers.
.github/               issue and pull-request templates, CI
```

The TypeScript workspace is specified in [docs/design/library-architecture.md](docs/design/library-architecture.md). Tier 0 is the ten private packages under `packages/` (`core`, `mechanics`, `em`, `thermo`, `fluids`, `plasma`, `optics`, `gr`, `bridges`, `proofs`). Tier 1 fills `core` with the SI constants, a quantity that carries a MathTS unit, and the binding where bare `e` is the elementary charge. The other nine packages still export only their package name. Nothing under `packages/` is published. Later tiers still wait for approval.

Lean sources are flat under `lean/`. `lakefile.toml` sets `srcDir = "."`, `roots = ["lean"]`, and `globs = ["lean.*"]`, so `lean/Clapeyron.lean` is the module `lean.Clapeyron` and `lake build` builds every file from the repository root. `lean.lean` is the module `lean` and imports the others. Namespaces stay `namespace PhysJS...`, so theorem names stay `PhysJS.*`. `manifest/bridges.json` stores those theorem names and does not store source paths. `manifest/lean-files.json` lists each proof file as `lean/<File>.lean`.

## Milestone 1

The rank-1 lemmas and the pendulum reference are proved. Each Lean proof is complete: no `sorry`. Each one covers its statement only, which is the covers line in `manifest/bridges.json`.

| Bridge                   | Theorem                                          | Lean proof                |
| ------------------------ | ------------------------------------------------ | ------------------------- |
| `ab-kg-schrodinger`      | `PhysJS.KgSchrodinger.covers_bound_delta`        | complete                  |
| `ab-klein-gordon-wave`   | `PhysJS.KleinGordonWave.covers_bound_delta`      | complete                  |
| `ab-stiff-string`        | `PhysJS.StiffString.covers_bound_delta`          | complete                  |
| `ab-telegraph-diffusion` | `PhysJS.TelegraphDiffusion.covers_bound_delta`   | complete                  |
| `ab-telegraph-wave`      | `PhysJS.TelegraphWave.covers_bound_delta`        | complete                  |
| `ab-pendulum-linear`     | `PhysJS.Pendulum.linearizedEquationOfMotion_iff` | complete, imports Physlib |

A wrong-dictionary lemma sits next to each one. It is false for the neighbouring bridge's closed form, so a swapped dictionary does not satisfy the statement.

## Milestone 2, rank 1a

A non-trivial plane wave solves the PDE if and only if `ω(k)` obeys that PDE's dispersion relation. The zero wave is excluded. Each proof is complete. Each one covers that statement only, and none of them proves `covers_bound_delta`.

| Bridge                   | Theorem                                              | What the equivalence says                                                           |
| ------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `ab-kg-schrodinger`      | `PhysJS.KgSchrodinger.planeWave_iff_dispersion`      | Klein–Gordon `ω² = c²k² + ω₀²`, and Schrödinger `ω = c²k² / (2ω₀)`                  |
| `ab-klein-gordon-wave`   | `PhysJS.KleinGordonWave.planeWave_iff_dispersion`    | Klein–Gordon as above, and the wave equation `ω² = c²k²`                            |
| `ab-stiff-string`        | `PhysJS.StiffString.planeWave_iff_dispersion`        | stiff `ω² = (F/μ)k² + (EI/μ)k⁴`, and flexible `ω² = (F/μ)k²`                        |
| `ab-telegraph-diffusion` | `PhysJS.TelegraphDiffusion.planeWave_iff_dispersion` | telegraph `τσ² + σ + Dq² = 0`, and Fick `σ = −Dq²`                                  |
| `ab-telegraph-wave`      | `PhysJS.TelegraphWave.planeWave_iff_dispersion`      | underdamped telegraph `ω² = (D/τ)q² − 1/(4τ²)`, and the wave equation at `c² = D/τ` |

The manifest keeps the rank-1 theorem as the entry's `theorem`. The rank-1a theorem is the entry's `planeWave` object. One `formalRef` per bridge id already names `covers_bound_delta`.

## Milestone 2, rank 2

`PhysJS.KgOscillator.uniform_solves_equationOfMotion` is a complete proof of the uniform-mode restriction. A field that does not depend on `x` and solves `u_tt = c² u_xx − ω₀² u`, and whose time profile is `ContDiff ℝ ∞`, embeds as a solution of Physlib's `HarmonicOscillator.EquationOfMotion` with `ω = ω₀`. The speed `c` drops out because the second space derivative of a uniform field is zero. The smoothness hypothesis is the one Physlib's Newton-law equivalence asks for. The theorem covers that statement only.

## Milestone 2, rank 3

`PhysJS.SpringLc.time_rescale_equationOfMotion` and `PhysJS.DampedRlc.time_rescale_equationOfMotion` are complete proofs of the oscillator dictionary. Physlib states both sides. An LC circuit is `HarmonicOscillator` with `m ↦ L` and `k ↦ 1/C`. An RLC circuit is `DampedHarmonicOscillator` with the same replacement and `γ ↦ R`. Those names are the dictionary's reading; Physlib has no circuit.

Time rescaling by the ratio of the two angular frequencies, together with a nonzero amplitude factor, is an equivalence of `ContDiff ℝ ∞` solutions. On the damped side the damping ratios `γ / (2 √(m k))` must agree, which is `b / (2 √(m k)) = (R / 2) √(C / L)` in the dictionary's names. Each theorem covers that statement only.

## Milestone 2, rank 4

`PhysJS.WaveDalembert.solution_eq_profiles` is a complete proof of the missing direction of d'Alembert's formula. A jointly `C²` solution of Physlib's `WaveEquation` in dimension one, at a nonzero speed `c`, equals `F(x − c t) + G(x + c t)`. The profiles take values in `EuclideanSpace ℝ (Fin 1)`, and the profile argument is the coordinate `Space.oneEquiv`. The speed is nonzero because that is what the identity requires. The theorem covers that statement only.

## Milestone 2b, counted

Catalog rows, keyed by `be-` id. A counted proof is a reduction, a limit, or a derivation step. It covers its statement only. UPT stores a `formalRef` for each of these rows and does not light `formally-proved` from a counted reference. Sixteen catalog references are counted. The six in this table are the first. The other ten are `be-65`, `be-51`, `be-61`, `be-14`, `be-17`, `be-22`, `be-15`, `be-32`, `be-35`, and `be-30`.

| Catalog id | Theorem                                   | What the statement says                                                                                                                                                              |
| ---------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `be-64`    | `PhysJS.Eddington.balance_iff`            | Thomson force equals gravitational force iff `L = 4 π G M m_p c / σ_T`. The `r²` cancels. Not a hard cap.                                                                            |
| `be-53`    | `PhysJS.YangMills.b0_pos_iff_nf_le`       | For SU(3), `b₀ > 0` iff `N_f ≤ 16`. At 16 the value is `1/3`. `N_f = 17` fails. Not a running procedure past one loop.                                                               |
| `be-58`    | `PhysJS.JohnsonNyquist.tendsto_classical` | `S_V^q(ω) → 4 k_B T R` as `ω → 0⁺`, for `k_B T > 0` and `ℏ ≠ 0`. A `+ 1` in the denominator does not. Not the fluctuation–dissipation theorem.                                       |
| `be-38`    | `PhysJS.Mond.tendsto_nu_limits`           | `ν → 1` as `z → ∞`, and `ν √z → 1` as `z → 0⁺`. Then `F_N ν(z) / √(m F_N a₀) → 1`. The claim `ν √z → √2` fails. Not the SPARC confrontation.                                         |
| `be-13`    | `PhysJS.Einstein.trace_eq`                | Contracting `G_μν + Λ g_μν = κ T_μν` in four dimensions gives `R = 4Λ − κ T`. Not Jacobson's thermodynamic derivation.                                                               |
| `be-34`    | `PhysJS.KibbleZurek.exponent`             | Freeze-out gives `ε̂ = (τ₀/τ_Q)^(1/(1+zν))` and the defect power without the Boltzmann factor. Omitting the `1` in the exponent fails. Not a repair of the missing `1/a^d` prefactor. |

The running solution is the nested `oneLoop` object, `PhysJS.YangMills.alphaRun_hasDerivAt`: `α(t) = α₀ / (1 + b₀ α₀ t / (2π))` solves `dα/dt = −(b₀/(2π)) α²` wherever the denominator is positive. `PhysJS.YangMills.beta_alpha_iff` is the same truncation read as `β(g) = −b₀ g³/(16π²)` if and only if `dα/d ln μ = −b₀ α²/(2π)`, with `α = g²/(4π)` and `g ≠ 0`. The reference names the sign theorem only.

The inversion is the nested `inversion` object, `PhysJS.Mond.mu_inversion`: for `z > 0`, `y = z ν(z)` satisfies `y² / √(1 + y²) = z`. That is Milgrom's `μ(x) = x / √(1 + x²)` inverted. The reference names the limit theorem only.

The vacuum density is the nested `vacuum` object, `PhysJS.Einstein.vacuum_density`: with `κ = 8π G / c⁴` and `T_μν = −ρ c² g_μν`, `Λ g = −κ T` rearranges to `ρ = c² Λ / (8π G)`. That is the BE-20 density, recorded on `be-13`. The Friedmann corollary is the nested `corollary` object, `PhysJS.Einstein.friedmann_corollary`: `(8πG/3) ρ = Λ c² / 3`, and a fluid of that density added to matter, with the explicit `Λ` set to zero, is `FirstOrderFriedmann` at `k = 0`. The Einstein-static density is twice that term. Dropping `c²` fails when `c² ≠ 1`. BE-20 does not get its own reference. `PhysJS.Einstein.dust_trace` is the mostly-plus dust reading, `R = 4Λ + κ ρ c²`. A plus sign on the vacuum tensor gives the opposite density when `Λ > 0`. The reference names the contraction only.

## Milestone 2b, cross-checks

These rows are UPT `formalRef`s of kind `cross-check`, on `PhysJS.HawkingUnruh.dictionary`, `PhysJS.Fret.dictionary`, and `PhysJS.QuantumBounce.dictionary`. Each carries a negative control. Passing one to `deriveEvidence` lights `formally-proved-cross-check`. That label is not the proved-bridge count.

| Catalog id | Theorem                           | What the statement says                                                                                                                                                                                             |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `be-42`    | `PhysJS.HawkingUnruh.dictionary`  | `T_H(2GM/c²) = T_H(M)` and `T_U(c⁴/(4GM)) = T_H(M)`, naming BE-57 and `be-42-via-rs`. `T_U(c⁴/(2GM))` is not `T_H(M)`. Not the Hawking effect.                                                                      |
| `be-24`    | `PhysJS.Fret.dictionary`          | `η = R₀⁶/(R₀⁶+R⁶)` equals both `1/(1+(R/R₀)⁶)` and `k_FRET/(k_FRET+1/τ_D)`, and `η` decreases. At `R = 2 R₀` the exponent 4 is not 6. Not the dipole–dipole law.                                                    |
| `be-19`    | `PhysJS.QuantumBounce.dictionary` | `H²_LQC` equals `H²_RS` at `σ = −ρ_c/2`, both tend to `(8πG/3)ρ + Λ/3`, and `H²_LQC = 0` at `ρ = ρ_c`, `Λ = 0`, naming BE-54. `σ = +ρ_c/2` is not that polynomial. `σ < 0` is not a physical Randall–Sundrum brane. |

## Milestone 2b, properties

These rows are UPT `formalRef`s of kind `property`, on `PhysJS.Jarzynski.jensen_work` and `PhysJS.Lindblad.preserve`. The owner admitted property-level references on 2026-10-01. Each carries a negative control. Passing one to `deriveEvidence` lights `formally-proved-property`. That label is not the proved-bridge count. `be-28` is the same kind, on `PhysJS.EntropyProduction.nonneg`, and its covers line still begins with `derivation-step`.

| Catalog id | Theorem                        | What the statement says                                                                                                                                                                     |
| ---------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `be-29`    | `PhysJS.Jarzynski.jensen_work` | For a finite probability and `β > 0`, `⟨W⟩ ≥ ΔF` with `ΔF = −(1/β) log(∑ p_i exp(−β W_i))`. The reversed inequality fails on two unequal work values. Not Jarzynski's theorem.              |
| `be-11`    | `PhysJS.Lindblad.preserve`     | One channel of the displayed GKSL generator has trace zero, and it is Hermitian when `H` and `ρ` are. Dropping the anticommutator makes the trace nonzero. Not Born–Markov coarse-graining. |

## Milestone 2b, stretch

These derivation steps are counted references, three of the sixteen. Each covers its statement only.

| Catalog id | Theorem                           | What the statement says                                                                                                                                                                                   |
| ---------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `be-65`    | `PhysJS.Jeans.mass_eq`            | The encoded Jeans mass follows from the virial convention with factor `5` and `M = 4 π R³ ρ / 3`. Replacing `5` by `3` fails. Not the virial theorem.                                                     |
| `be-51`    | `PhysJS.Deflection.line_integral` | `(1+γ)/c²` times the weak-field line integral equals `2(1+γ) G M / (b c²)`. At `γ = 1` that is the encoded angle `4 G M / (b c²)`. `γ = 0` is half. Not a geodesic.                                       |
| `be-61`    | `PhysJS.Sommerfeld.integral_eq`   | `∫_ℝ x² e^x / (1+e^x)² dx = π²/3`, the factor in the encoded Lorenz number. The integrand is even, so the half-line is half of `π²/3`. Claiming the half-line equals `π²/3` fails. Not the transport law. |

## Milestone 2b, bucket A

Owner-approved bucket A rows, easiest first, followed by `be-66`, `be-67`, and `be-68`. Each covers its statement only. Seventeen of these keys are UPT kind `bridge` because the theorem states the catalogued equation. The covers line still begins with `derivation-step`. They are `be-12`, `be-16`, `be-21`, `be-27`, `be-33`, `be-37`, `be-40`, `be-43`, `be-50`, `be-54`, `be-55`, `be-59`, `be-60`, `be-63`, `be-66`, `be-67`, and `be-68`. Passing one of those references to `deriveEvidence` lights `formally-proved`. `be-14` stays a derivation step on the same lemma as `be-43`. `be-28` is kind `property`. The remaining bucket A keys in this table are counted derivation steps. `be-20` is nested on `be-13` and has no key.

| Catalog id                 | Theorem                                        | What the statement says                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `be-12`                    | `PhysJS.ThermalDeBroglie.wavelength_eq`        | `√(2π ℏ² / (m k_B T)) = h / √(2π m k_B T)` for `h = 2π ℏ` and `ℏ > 0`. The Wave Q form `ℏ / √(m k_B T)` fails, as does `ℏ / √(2 m k_B T)`. Not Caldeira–Leggett dephasing.                                                                                                                                                                                                             |
| `be-59`                    | `PhysJS.Josephson.frequency_eq`                | `f = (2e/h) V`, `K_J = 2e/h`, and `f = K_J V`. The factor `2` is the Cooper-pair charge. Replacing it by `e` fails. Not the tunneling Hamiltonian.                                                                                                                                                                                                                                     |
| `be-55`                    | `PhysJS.QuantumHall.reciprocal`                | `σ_xy = C e²/h`, `R_H = h/(C e²)`, `R_K = h/e²`, so `σ_xy R_H = 1` and `R_H = R_K/C`. The index `C+1` is a different plateau. Replacing `e²` by `e` fails the product when `e ≠ 1`. Not TKNN.                                                                                                                                                                                          |
| `be-60`                    | `PhysJS.Laughlin.filling_fraction`             | For integers `p ≠ 0` and `q ≠ 0`, with `ν = p/q`, `σ_xy = ν e²/h` and `R_xy = R_K/ν = (q/p) h/e²`. `fraction` remains the case `ν = 1/3`. Odd `q` is the selection rule, not this identity. Not the Laughlin wavefunction.                                                                                                                                                             |
| `be-21`                    | `PhysJS.Kss.saturating`                        | `η/s = ℏ/(4π k_B)` is the equality `4π k_B (η/s) = ℏ`. The Hawking factor `8π` fails when `ℏ ≠ 0`. Not the inequality `η/s ≥ ℏ/(4π k_B)`.                                                                                                                                                                                                                                              |
| `be-14`, `be-43`           | `PhysJS.PlanckArea.area_law`                   | `k_B c³ A/(4 G ℏ) = k_B A/(4 ℓ_P²)` for `ℓ_P² = ℏ G/c³`. BE-43 is the same equality on a wormhole area. `ℏ G/c²` fails when `c ≠ 1`, and the factor `2` fails. Not a minimal surface, and not ER=EPR.                                                                                                                                                                                  |
| `be-37`                    | `PhysJS.Shapiro.radial_integral`               | `∫_{R_near}^{R_far} (2GM/c³) dr/r = (2GM/c³) ln(R_far/R_near)` for `0 < R_near < R_far` and `c ≠ 0`. The factor `1` is half, once `G ≠ 0` and `M ≠ 0`. `log₁₀` is not `ln`. Not the impact-parameter formula, and not Cassini.                                                                                                                                                         |
| `be-54`                    | `PhysJS.RandallSundrum.brane_friedmann`        | `H² = (8πG/3) ρ (1 + ρ/(2σ)) + Λ/3` for `σ ≠ 0`, equal to the Friedmann term plus `(8πG/3) ρ²/(2σ)`. `positive_tension` remains the sign of that excess. Not the five-dimensional Einstein equation.                                                                                                                                                                                   |
| `be-17`                    | `PhysJS.EinsteinCartan.inversion`              | If `κ = 8πG/c⁴ ≠ 0` and every component satisfies `T = κ S`, then `S·S = T·T / κ² = (c⁴/(8πG))² T·T`. `κ²` in the numerator fails when `T·T ≠ 0` and `κ⁴ ≠ 1`. Not the Einstein–Cartan field equation. The nested `torsionMonomial` object is `torsion_monomial`: `[κ]` and `[S]` are independent base dimensions, `[T] = [κ][S]`, and homogeneity gives `T = C κ S` with `C` unfixed. |
| `be-27`                    | `PhysJS.EffectiveTemperature.sum_eq`           | For `T ≠ 0` and `k_B ≠ 0`, `T (1 + Σ_active/(k_B T)) = T + Σ_active/k_B`, and this equals `T` iff `Σ_active = 0`. Omitting the `1` fails. Not the frequency-dependent Cugliandolo–Kurchan `T_eff(ω)`.                                                                                                                                                                                  |
| `be-22`                    | `PhysJS.ToricCode.toric`                       | Four anyons of quantum dimension `1` have `D = √4 = 2` and `γ = ln 2`. The encoded decomposition is `S = α L − γ`, with the `O(L⁻¹)` term dropped. `log₂ 2 = 1` is not `ln 2`. `D = √2` is one anyon pair. Not the Kitaev–Preskill theorem.                                                                                                                                            |
| `be-20`, nested on `be-13` | `PhysJS.Einstein.friedmann_corollary`          | `(8πG/3) ρ = Λ c² / 3` from the vacuum density, and a fluid of that density added to matter, with the explicit `Λ` set to zero, is `FirstOrderFriedmann` at `k = 0`. The Einstein-static density is twice that term. Dropping `c²` fails when `c² ≠ 1`. No separate key.                                                                                                               |
| `be-15`                    | `PhysJS.Coarsening.exponent_iff`               | For `Γ = L₀²/t₀ > 0`, `t > 0`, `t ≠ t₀`, and `z > 0`, `L(t) = L₀ (t/t₀)^{1/z}` obeys `L² = Γ t` iff `z = 2`. At `t = t₀` every `z` agrees. `z = 3` gives `L³ ∝ t` and fails. Not the Model A Langevin equation. The nested `lengthMonomial` object is `length_monomial_at`: homogeneity in `Γ` and `t` with `[Γ] = L^z T⁻¹` gives `L = C (Γ t)^{1/z}`, and `C` is unfixed.             |
| `be-33`                    | `PhysJS.QuantumCritical.thermal_scaling`       | `ξ(T) = ξ₀ (T/T₀)^{−1/z}`, and at `z = 1` this is `ξ₀ (T/T₀)^{−1} = ξ₀ T₀/T`. Not Hertz–Millis theory. The nested `scalingShape` object is `scaling_shape`: homogeneity in `ξ₀`, `T`, and `T₀` gives `ξ = ξ₀ φ(T/T₀)`, and `φ` is unfixed.                                                                                                                                             |
| `be-50`                    | `PhysJS.TimeSymmetric.wheeler_feynman`         | `A_μ(x) = (A_μ^ret(x) + A_μ^adv(x))/2`, and twice that component is the sum. `residual_iff` remains the vanishing of the residual. The id is contested. Not the absorber theory of radiation reaction.                                                                                                                                                                                 |
| `be-32`                    | `PhysJS.BornOverlap.modulus_sq`                | `                                                                                                                                                                                                                                                                                                                                                                                      | c + s i | ² = c² + s²`, the modulus of one matrix element. A sum of squares above `1`is not a probability in`[0, 1]`. `c² − s²`fails when`s ≠ 0`. Not a quantum-reference-frame transformation. The catalog records this id as not-a-bridge. |
| `be-28`                    | `PhysJS.EntropyProduction.nonneg`              | `σ = Σ_i J_i X_i` is the definition of `σ`. If every product is `≥ 0` then `σ ≥ 0`. One flipped sign is not `σ`, and that sum is negative. Not the variational maximum-entropy-production principle. The catalog records this id as not-a-bridge.                                                                                                                                      |
| `be-40`                    | `PhysJS.CompositeHiggs.scale_free`             | For `f ≠ 0` and `θ = h/f`, `V/f⁴ = −α sin²θ + β [sin⁴θ − sin²θ cos²θ]`. Both terms carry `f⁴`, so the ratio depends on `h` only through `θ`. The old first term `−α f² sin²θ` still depends on `f`. Not SILH matching. The catalog records this id as not-a-bridge.                                                                                                                    |
| `be-35`                    | `PhysJS.Crossing.antisymmetry`                 | `g(u,v) − g(v,u) = −(g(v,u) − g(u,v))`. The residual is `0` for every `g` when `u = v`, including `1/4`, so that point is not a control. A non-symmetric block does not vanish at `u = 1/2`, `v = 1/4`. Not the bootstrap sum. The catalog records this id as not-a-bridge.                                                                                                            |
| `be-63`                    | `PhysJS.Chandrasekhar.prefactor`               | For `n = 3`, ultra-relativistic degeneracy pressure and the Lane–Emden scale give `M = (ω₃⁰ √(3π)/2) (ℏ c/G)^{3/2} (μ_e m_u)^{−2}`. `ω₃⁰` stays symbolic; `2.01824` is not in the theorem. `ρ_c` cancels. `√π/2` and dropping `ω₃⁰` fail. Not rotation or magnetic support.                                                                                                            |
| `be-30`                    | `PhysJS.Entanglement.first_variation`          | For a full-rank diagonal curve of trace `1`, `d/dt S(ρ) = −Tr(ρ̇ log ρ)`. With `K = −log ρ` frozen, that derivative is `d/dt ⟨K⟩`. The jump from `diag(1/2, 1/2)` to `diag(3/4, 1/4)` leaves `⟨K⟩` fixed and changes `S`. Not an area variation.                                                                                                                                        |
| `be-16`                    | `PhysJS.Landauer.erasure_eq`                   | Kind `bridge`. For `T > 0`, the equal-level two-state ensemble has `⟨E⟩ − F = k_B T log 2`. The covers line still begins with `derivation-step`. `equal_levels` remains the entropy `k_B log 2`. Levels `E` and `E + δ` fail that deficit. Not `E ≥ T ΔS` for an arbitrary protocol, and not the Bérut confrontation.                                                                  |
| `be-66`                    | `PhysJS.RadiationPressure.pressure_eq`         | Kind `bridge`. Foreshortening, normal momentum per energy, and the opaque split give `P_n = (I/c)(1+R) cos²θ`. The absorber and the reflector are the endpoints. The covers line still begins with `derivation-step`. Homogeneity leaves `C` in `P = C I/c` unfixed. Not the Maxwell stress tensor.                                                                                    |
| `be-67`                    | `PhysJS.AlfvenSpeed.speed_eq`                  | Kind `bridge`. The parallel incompressible ideal-MHD linearization gives `                                                                                                                                                                                                                                                                                                             | ω/k     | = B/√(μ0 ρ)`for`B > 0`. The covers line still begins with `derivation-step`. `ρ` is the total mass density. Proton-only is a different speed. The Gaussian writing needs the unit dictionary. Not a kinetic dispersion relation.   |
| `be-68`                    | `PhysJS.TolmanEhrenfest.hydrostatic_constant`  | Kind `bridge`. Hydrostatic balance and the equilibrium Gibbs relation give `T √(-g_00)` equal at the endpoints of a static interval. The covers line still begins with `derivation-step`. The repository signature is `(−,+,+,+)`. Units do not identify `d ln T` with `g dr/c²`. Not a horizon temperature.                                                                           |
| `be-69`                    | `PhysJS.FastMagnetosonic.speed_eq`             | Not a catalog entry yet. Intended kind `bridge`. The perpendicular compressional linearization gives `                                                                                                                                                                                                                                                                                 | ω/k     | = √(c_s² + B²/(μ0 ρ))`. The covers line still begins with `derivation-step`. The quartic at `k_∥ = 0`is the nested`perpendicularQuartic`object.`ω = 0` is not that polarization. Not a kinetic dispersion.                         |
| `be-70`                    | `PhysJS.EinsteinRelation.diffusion_eq`         | Not a catalog entry yet. Intended kind `bridge`. Drift cancels diffusion on a Boltzmann profile, so `D = μ k_B T / q`. The covers line still begins with `derivation-step`. Dropping `q`, the Fermi-liquid form, and Stokes–Einstein fail. Not a master equation.                                                                                                                      |
| `be-71`                    | `PhysJS.Clapeyron.slope_eq`                    | Not a catalog entry yet. Intended kind `bridge`. Equal Gibbs energies and `dg = −s dT + v dP` give `dP/dT = L/(T Δv)`. The covers line still begins with `derivation-step`. Dropping `T` or the second volume fails. Not the integrated vapor-pressure law.                                                                                                                            |
| `be-72`                    | `PhysJS.GravitationalRedshift.frequency_ratio` | Not a catalog entry yet. Intended kind `bridge`. One coordinate period gives `ν1/ν2 = √(g2/g1)` for `g_00 < 0`. The covers line still begins with `derivation-step`. Tolman equilibrium puts `T` in the same ratio and is not this statement. The weak-field `ΔΦ/c²` is not the exact ratio.                                                                                           |
| `be-73`                    | `PhysJS.KelvinRelation.peltier_eq`             | Not a catalog entry yet. Intended kind `bridge`. Onsager reciprocity, as a structure field, gives `Π = S T`. The covers line still begins with `derivation-step`. Without `L12 = L21` the coefficients disagree. Not the first Thomson relation.                                                                                                                                       |
| `be-74`                    | `PhysJS.MagneticPressure.pressure_eq`          | Not a catalog entry yet. Intended kind `bridge`. A linear inductor and a long solenoid give `p_B = B²/(2 μ0)`. The covers line still begins with `derivation-step`. The monomial `p = C B²/μ0` leaves `C` unfixed. The prefactor `1` is the battery work, not this pressure. Not a kinetic pressure.                                                                                   |
| `be-75`                    | `PhysJS.LondonPenetration.depth_eq`            | Not a catalog entry yet. Intended kind `bridge`. London's equation and Ampere's law give `λ_L = √(m/(μ0 n e²))`, with `e` the elementary charge. The covers line still begins with `derivation-step`. `{m, μ0, n, e}` is not a unique monomial. `μ0 e²/m` is another length. Not the classical skin depth.                                                                             |
| `be-76`                    | `PhysJS.PlasmaBeta.beta_eq`                    | Not a catalog entry yet. Intended kind `bridge`. `β = p/(B²/(2 μ0)) = 2 μ0 n k_B T/B²`, using `be-74`. The covers line still begins with `derivation-step`. A dimensionless constant is not this ratio. Not a plasma-β inequality.                                                                                                                                                     |
| `be-77`                    | `PhysJS.HagenPoiseuille.flow_eq`               | Not a catalog entry yet. Intended kind `bridge`. The pipe balance integrates to `Q = π R⁴ ΔP/(8 μ L)` and `f_D Re = 64`. The covers line still begins with `derivation-step`. The Fanning product is `16`. Not a square duct.                                                                                                                                                          |
| `be-78`                    | `PhysJS.EulerBuckling.critical_load`           | Not a catalog entry yet. Intended kind `bridge`. The pinned Euler eigenvalue is `P_cr = π² E I/L²`. The covers line still begins with `derivation-step`. The cantilever is `π²/4` of that load.                                                                                                                                                                                        |
| `be-79`                    | `PhysJS.PullIn.pull_in_eq`                     | Not a catalog entry yet. Intended kind `bridge`. The parallel-plate fold is `g = 2 g0/3` and `V_pi² = 8 k g0³/(27 ε0 A)`. The covers line still begins with `derivation-step`. `g0/2` is not the fold.                                                                                                                                                                                 |
| `be-80`                    | `PhysJS.MottGurney.current_eq`                 | Not a catalog entry yet. Intended kind `bridge`. Drift and Poisson integrate to `J = (9/8) ε μ V²/d³`. The covers line still begins with `derivation-step`. Not Child–Langmuir.                                                                                                                                                                                                        |
| `be-81`                    | `PhysJS.ChildLangmuir.current_eq`              | Not a catalog entry yet. Intended kind `bridge`. The vacuum profile `x^{4/3}` gives `J = (4 ε0/9) sqrt(2 e/m) V^{3/2}/d²`. The covers line still begins with `derivation-step`. `e` is the elementary charge. Not Mott–Gurney.                                                                                                                                                         |
| `be-82`                    | `PhysJS.ShockleyDiode.shockley_eq`             | Not a catalog entry yet. Intended kind `bridge`. Boltzmann quasi-equilibrium, ideality 1, and detailed balance give `I = I_s (exp(e V/(k_B T)) − 1)`. The covers line still begins with `derivation-step`. Ideality 2 is not this current.                                                                                                                                             |
| `be-83`                    | `PhysJS.Thomson.thomson_eq`                    | Not a catalog entry yet. Intended kind `bridge`. Differentiating `Π = S T` gives `μ_T = T dS/dT`. The covers line still begins with `derivation-step`. Not `be-73` itself.                                                                                                                                                                                                             |
| `be-84`                    | `PhysJS.FourPoint.sheet_eq`                    | Not a catalog entry yet. Intended kind `bridge`. Equal collinear probes give `R_s = (π/ln 2)(V/I)`. The covers line still begins with `derivation-step`. Unequal spacing is `2π/ln 3`. Not `be-35`.                                                                                                                                                                                    |
| `be-85`                    | `PhysJS.ShotNoise.shot_eq`                     | Not a catalog entry yet. Intended kind `bridge`. Poisson variance and the one-sided window give `S_I = 2 e I`. The covers line still begins with `derivation-step`. The two-sided spectrum is `e I`. Not Johnson–Nyquist.                                                                                                                                                              |
| `be-86`                    | `PhysJS.ReynoldsAnalogy.reynolds_eq`           | Not a catalog entry yet. Intended kind `bridge`. Equal wall diffusivities at `Pr = 1` give `St = C_f/2`. The covers line still begins with `derivation-step`. `Pr ≠ 1` keeps the product `St Pr`.                                                                                                                                                                                      |
| `be-87`                    | `PhysJS.CapacitorNoise.noise_eq`               | Not a catalog entry yet. Intended kind `bridge`. One quadratic capacitor integrates to `⟨v²⟩ = k_B T/C`. The covers line still begins with `derivation-step`. `(3/2) k_B T` is not this variance.                                                                                                                                                                                      |

`be-69` through `be-73` are in the table above and are not catalog entries yet. They are the five candidates from the 2026-10-03 dogfood report. The intended kind is `bridge`. Each covers line still begins with `derivation-step`.

`be-74`, `be-75`, and `be-76` are in the table above and are not catalog entries yet. The UPT catalog on `master` runs through `76`. They are the three candidates from the 2026-10-04 dogfood report. The intended kind is `bridge`. Each covers line still begins with `derivation-step`.

`be-77` through `be-87` are in the table above and are not catalog entries yet. The UPT catalog on `master` runs through `76`. They are the eleven candidates from the 2026-10-04 engineering-physicist dogfood report. The intended kind is `bridge`. Each covers line still begins with `derivation-step`.

The `c²` dictionary is the nested `friedmann` object, `PhysJS.RandallSundrum.flat_friedmann`: `H²_FRW` with the module `Λ` equal to Physlib's `Λ c²` is `FirstOrderFriedmann` at `k = 0`. Dropping `c²` fails when `c² ≠ 1` and `Λ ≠ 0`. The reference names the tension theorem only.

## Build

The toolchain is pinned in `lean-toolchain` (`leanprover/lean4:v4.34.1`). Mathlib is `v4.34.1`. Physlib (PhysLean) is pinned by commit in `lakefile.toml`.

```bash
lake exe cache get
lake build
```

CI runs `lake build` with the Mathlib cache, then an axiom audit of the `lean` module. The audit allows `propext`, `Classical.choice`, and `Quot.sound`. It rejects `sorry`, `admit`, `native_decide`, and any other axiom.

## Manifest

UPT consumes `manifest/bridges.json`. A `formalRef` names a manifest key. Every key in that file is a checked `formalRef`. The entry carries the theorem name, the UPT bridge id, and the covers line. UPT vendors that manifest at a commit and links to the Lean file. It does not vendor the Lean sources. The link target is the path in `manifest/lean-files.json` (`lean/<File>.lean`).

The kind split is forty-nine checked `formalRef`s: ten atlas bridges, sixteen counted catalog references, seventeen catalog bridges whose covers line still begins with `derivation-step`, three cross-checks, and three properties (`be-11`, `be-29`, and `be-28`). The seventeen include `be-66`, `be-67`, and `be-68`. Five further keys, `be-69` through `be-73`, are the 2026-10-03 dogfood candidates. They are not catalog entries yet. The intended kind is `bridge`, and each covers line still begins with `derivation-step`. Three further keys, `be-74` through `be-76`, are the 2026-10-04 dogfood candidates. The UPT catalog on `master` runs through `76`. They are not catalog entries yet. The intended kind is `bridge`, and each covers line still begins with `derivation-step`. Eleven further keys, `be-77` through `be-87`, are the engineering-physicist candidates from that same date. They are not catalog entries yet. The intended kind is `bridge`, and each covers line still begins with `derivation-step`. Nested objects are not second references.

## What this is not

**These are algebra-level lemmas and the ceiling is modest.** This repository does not claim a deep formalisation of physics. A bridge marked `formally-proved` points at a statement a checker has verified, and that statement is only what the covers line says.

## Why out of tree

UPT's roadmap requires the proof artifacts to live outside the main repository, so that the library under test and the thing testing it cannot drift into each other.

## npm handle

**`@danielsimonjr/physjs`** — verified free on the registry 2026-09-22.

**Lowercase, because npm rejects uppercase in new package names.** `PhysJS` is branding only. The package itself comes later. It is not published from this repository.

## Licence

MIT — matching UPT.
