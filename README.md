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

## Milestone 2, rank 4

`PhysJS.WaveDalembert.solution_eq_profiles` is a complete proof of the missing direction of d'Alembert's formula. A jointly `C²` solution of Physlib's `WaveEquation` in dimension one, at a nonzero speed `c`, equals `F(x − c t) + G(x + c t)`. The profiles take values in `EuclideanSpace ℝ (Fin 1)`, and the profile argument is the coordinate `Space.oneEquiv`. The speed is nonzero because that is what the identity requires. The theorem covers that statement only.

## Milestone 2b, counted

Catalog rows, keyed by `be-` id. A counted proof is a reduction, a limit, or a derivation step. It covers its statement only.

| Catalog id | Theorem | What the statement says |
|---|---|---|
| `be-64` | `PhysJS.Eddington.balance_iff` | Thomson force equals gravitational force iff `L = 4 π G M m_p c / σ_T`. The `r²` cancels. Not a hard cap. |
| `be-53` | `PhysJS.YangMills.b0_pos_iff_nf_le` | For SU(3), `b₀ > 0` iff `N_f ≤ 16`. At 16 the value is `1/3`. `N_f = 17` fails. Not a running procedure past one loop. |
| `be-58` | `PhysJS.JohnsonNyquist.tendsto_classical` | `S_V^q(ω) → 4 k_B T R` as `ω → 0⁺`, for `k_B T > 0` and `ℏ ≠ 0`. A `+ 1` in the denominator does not. Not the fluctuation–dissipation theorem. |
| `be-38` | `PhysJS.Mond.tendsto_nu_limits` | `ν → 1` as `z → ∞`, and `ν √z → 1` as `z → 0⁺`. Then `F_N ν(z) / √(m F_N a₀) → 1`. The claim `ν √z → √2` fails. Not the SPARC confrontation. |
| `be-13` | `PhysJS.Einstein.trace_eq` | Contracting `G_μν + Λ g_μν = κ T_μν` in four dimensions gives `R = 4Λ − κ T`. Not Jacobson's thermodynamic derivation. |
| `be-34` | `PhysJS.KibbleZurek.exponent` | Freeze-out gives `ε̂ = (τ₀/τ_Q)^(1/(1+zν))` and the defect power without the Boltzmann factor. Omitting the `1` in the exponent fails. Not a repair of the missing `1/a^d` prefactor. |

The running solution is the nested `oneLoop` object, `PhysJS.YangMills.alphaRun_hasDerivAt`: `α(t) = α₀ / (1 + b₀ α₀ t / (2π))` solves `dα/dt = −(b₀/(2π)) α²` wherever the denominator is positive. `PhysJS.YangMills.beta_alpha_iff` is the same truncation read as `β(g) = −b₀ g³/(16π²)` if and only if `dα/d ln μ = −b₀ α²/(2π)`, with `α = g²/(4π)` and `g ≠ 0`. The reference names the sign theorem only.

The inversion is the nested `inversion` object, `PhysJS.Mond.mu_inversion`: for `z > 0`, `y = z ν(z)` satisfies `y² / √(1 + y²) = z`. That is Milgrom's `μ(x) = x / √(1 + x²)` inverted. The reference names the limit theorem only.

The vacuum density is the nested `vacuum` object, `PhysJS.Einstein.vacuum_density`: with `κ = 8π G / c⁴` and `T_μν = −ρ c² g_μν`, `Λ g = −κ T` rearranges to `ρ = c² Λ / (8π G)`. That is the BE-20 density, recorded on `be-13`. The Friedmann corollary is the nested `corollary` object, `PhysJS.Einstein.friedmann_corollary`: `(8πG/3) ρ = Λ c² / 3`, and a fluid of that density added to matter, with the explicit `Λ` set to zero, is `FirstOrderFriedmann` at `k = 0`. The Einstein-static density is twice that term. Dropping `c²` fails when `c² ≠ 1`. BE-20 does not get its own reference. `PhysJS.Einstein.dust_trace` is the mostly-plus dust reading, `R = 4Λ + κ ρ c²`. A plus sign on the vacuum tensor gives the opposite density when `Λ > 0`. The reference names the contraction only.

## Milestone 2b, cross-checks

These rows are manifest entries only. They are not UPT `formalRef`s. Each carries a negative control.

| Catalog id | Theorem | What the statement says |
|---|---|---|
| `be-42` | `PhysJS.HawkingUnruh.dictionary` | `T_H(2GM/c²) = T_H(M)` and `T_U(c⁴/(4GM)) = T_H(M)`, naming BE-57 and `be-42-via-rs`. `T_U(c⁴/(2GM))` is not `T_H(M)`. Not the Hawking effect. |
| `be-24` | `PhysJS.Fret.dictionary` | `η = R₀⁶/(R₀⁶+R⁶)` equals both `1/(1+(R/R₀)⁶)` and `k_FRET/(k_FRET+1/τ_D)`, and `η` decreases. At `R = 2 R₀` the exponent 4 is not 6. Not the dipole–dipole law. |
| `be-19` | `PhysJS.QuantumBounce.dictionary` | `H²_LQC` equals `H²_RS` at `σ = −ρ_c/2`, both tend to `(8πG/3)ρ + Λ/3`, and `H²_LQC = 0` at `ρ = ρ_c`, `Λ = 0`, naming BE-54. `σ = +ρ_c/2` is not that polynomial. `σ < 0` is not a physical Randall–Sundrum brane. |

## Milestone 2b, properties

These rows are manifest entries only. They are not UPT `formalRef`s until the owner rules on property-level references. Each carries a negative control.

| Catalog id | Theorem | What the statement says |
|---|---|---|
| `be-16` | `PhysJS.Landauer.equal_levels` | Equal two-state levels have thermodynamic entropy `k_B log 2`. At `T ≠ 0`, levels `E` and `E + δ` are not that value. Not `E ≥ T ΔS`, and not the Bérut confrontation. |
| `be-29` | `PhysJS.Jarzynski.jensen_work` | For a finite probability and `β > 0`, `⟨W⟩ ≥ ΔF` with `ΔF = −(1/β) log(∑ p_i exp(−β W_i))`. The reversed inequality fails on two unequal work values. Not Jarzynski's theorem. |
| `be-11` | `PhysJS.Lindblad.preserve` | One channel of the displayed GKSL generator has trace zero, and it is Hermitian when `H` and `ρ` are. Dropping the anticommutator makes the trace nonzero. Not Born–Markov coarse-graining. |

## Milestone 2b, stretch

These derivation steps come after the counted rows. Each covers its statement only.

| Catalog id | Theorem | What the statement says |
|---|---|---|
| `be-65` | `PhysJS.Jeans.mass_eq` | The encoded Jeans mass follows from the virial convention with factor `5` and `M = 4 π R³ ρ / 3`. Replacing `5` by `3` fails. Not the virial theorem. |
| `be-51` | `PhysJS.Deflection.line_integral` | `(1+γ)/c²` times the weak-field line integral equals `2(1+γ) G M / (b c²)`. At `γ = 1` that is the encoded angle `4 G M / (b c²)`. `γ = 0` is half. Not a geodesic. |
| `be-61` | `PhysJS.Sommerfeld.integral_eq` | `∫_ℝ x² e^x / (1+e^x)² dx = π²/3`, the factor in the encoded Lorenz number. The integrand is even, so the half-line is half of `π²/3`. Claiming the half-line equals `π²/3` fails. Not the transport law. |

## Milestone 2b, bucket A

Owner-approved bucket A rows, easiest first. Each covers its statement only.

| Catalog id | Theorem | What the statement says |
|---|---|---|
| `be-12` | `PhysJS.ThermalDeBroglie.wavelength_eq` | `√(2π ℏ² / (m k_B T)) = h / √(2π m k_B T)` for `h = 2π ℏ` and `ℏ > 0`. The Wave Q form `ℏ / √(m k_B T)` fails, as does `ℏ / √(2 m k_B T)`. Not Caldeira–Leggett dephasing. |
| `be-59` | `PhysJS.Josephson.frequency_eq` | `f = (2e/h) V`, `K_J = 2e/h`, and `f = K_J V`. The factor `2` is the Cooper-pair charge. Replacing it by `e` fails. Not the tunneling Hamiltonian. |
| `be-55` | `PhysJS.QuantumHall.reciprocal` | `σ_xy = C e²/h`, `R_H = h/(C e²)`, `R_K = h/e²`, so `σ_xy R_H = 1` and `R_H = R_K/C`. The index `C+1` is a different plateau. Replacing `e²` by `e` fails the product when `e ≠ 1`. Not TKNN. |
| `be-60` | `PhysJS.Laughlin.filling_fraction` | For integers `p ≠ 0` and `q ≠ 0`, with `ν = p/q`, `σ_xy = ν e²/h` and `R_xy = R_K/ν = (q/p) h/e²`. `fraction` remains the case `ν = 1/3`. Odd `q` is the selection rule, not this identity. Not the Laughlin wavefunction. |
| `be-21` | `PhysJS.Kss.saturating` | `η/s = ℏ/(4π k_B)` is the equality `4π k_B (η/s) = ℏ`. The Hawking factor `8π` fails when `ℏ ≠ 0`. Not the inequality `η/s ≥ ℏ/(4π k_B)`. |
| `be-14`, `be-43` | `PhysJS.PlanckArea.area_law` | `k_B c³ A/(4 G ℏ) = k_B A/(4 ℓ_P²)` for `ℓ_P² = ℏ G/c³`. BE-43 is the same equality on a wormhole area. `ℏ G/c²` fails when `c ≠ 1`, and the factor `2` fails. Not a minimal surface, and not ER=EPR. |
| `be-37` | `PhysJS.Shapiro.radial_integral` | `∫_{R_near}^{R_far} (2GM/c³) dr/r = (2GM/c³) ln(R_far/R_near)` for `0 < R_near < R_far` and `c ≠ 0`. The factor `1` is half, once `G ≠ 0` and `M ≠ 0`. `log₁₀` is not `ln`. Not the impact-parameter formula, and not Cassini. |
| `be-54` | `PhysJS.RandallSundrum.positive_tension` | For `σ > 0`, `ρ > 0`, and `G > 0`, `H²_RS − H²_FRW = (8πG/3) ρ²/(2σ) > 0`. The correction `1+ρ/σ` fails. `σ < 0` lies below the Friedmann value. The limit is already `be-19`. Not the five-dimensional Einstein equation. |
| `be-17` | `PhysJS.EinsteinCartan.inversion` | If `κ = 8πG/c⁴ ≠ 0` and every component satisfies `T = κ S`, then `S·S = T·T / κ² = (c⁴/(8πG))² T·T`. `κ²` in the numerator fails when `T·T ≠ 0` and `κ⁴ ≠ 1`. Not the Einstein–Cartan field equation, and not a Newtonian limit. |
| `be-27` | `PhysJS.EffectiveTemperature.sum_eq` | For `T ≠ 0` and `k_B ≠ 0`, `T (1 + Σ_active/(k_B T)) = T + Σ_active/k_B`, and this equals `T` iff `Σ_active = 0`. Omitting the `1` fails. Not the frequency-dependent Cugliandolo–Kurchan `T_eff(ω)`. |
| `be-22` | `PhysJS.ToricCode.toric` | Four anyons of quantum dimension `1` have `D = √4 = 2` and `γ = ln 2`. The encoded decomposition is `S = α L − γ`, with the `O(L⁻¹)` term dropped. `log₂ 2 = 1` is not `ln 2`. `D = √2` is one anyon pair. Not the Kitaev–Preskill theorem. |
| `be-20`, nested on `be-13` | `PhysJS.Einstein.friedmann_corollary` | `(8πG/3) ρ = Λ c² / 3` from the vacuum density, and a fluid of that density added to matter, with the explicit `Λ` set to zero, is `FirstOrderFriedmann` at `k = 0`. The Einstein-static density is twice that term. Dropping `c²` fails when `c² ≠ 1`. No separate key. |
| `be-15` | `PhysJS.Coarsening.exponent_iff` | For `Γ = L₀²/t₀ > 0`, `t > 0`, `t ≠ t₀`, and `z > 0`, `L(t) = L₀ (t/t₀)^{1/z}` obeys `L² = Γ t` iff `z = 2`. At `t = t₀` every `z` agrees. `z = 3` gives `L³ ∝ t` and fails. Not the Model A Langevin equation. |
| `be-33` | `PhysJS.QuantumCritical.xi_product` | For `T > 0` and `T₀ > 0`, `ξ(T) = ξ₀ (T/T₀)^{−1/z}` gives `ξ T = ξ₀ T₀` at `z = 1`. The retired exponent `−ν/z` fails when `ν ≠ 1`. The old pin `−0.71` is that failure, once `T ≠ T₀`. Not Hertz–Millis theory. |
| `be-50` | `PhysJS.TimeSymmetric.residual_iff` | When `A_ret + A_adv ≠ 0`, `(A_ret − A_adv)/(A_ret + A_adv) = 0` iff `A_ret = A_adv`. The encoded field is the half-sum. A fully retarded field gives residual `1`, not `0`. The id is contested. Not the absorber theory of radiation reaction. |
| `be-32` | `PhysJS.BornOverlap.modulus_sq` | `|c + s i|² = c² + s²`, the modulus of one matrix element. A sum of squares above `1` is not a probability in `[0, 1]`. `c² − s²` fails when `s ≠ 0`. Not a quantum-reference-frame transformation. The catalog records this id as not-a-bridge. |
| `be-28` | `PhysJS.EntropyProduction.nonneg` | `σ = Σ_i J_i X_i` is the definition of `σ`. If every product is `≥ 0` then `σ ≥ 0`. One flipped sign is not `σ`, and that sum is negative. Not the variational maximum-entropy-production principle. The catalog records this id as not-a-bridge. |
| `be-40` | `PhysJS.CompositeHiggs.scale_free` | For `f ≠ 0` and `θ = h/f`, `V/f⁴ = −α sin²θ + β [sin⁴θ − sin²θ cos²θ]`. Both terms carry `f⁴`, so the ratio depends on `h` only through `θ`. The old first term `−α f² sin²θ` still depends on `f`. Not SILH matching. The catalog records this id as not-a-bridge. |
| `be-35` | `PhysJS.Crossing.antisymmetry` | `g(u,v) − g(v,u) = −(g(v,u) − g(u,v))`. The residual is `0` for every `g` when `u = v`, including `1/4`, so that point is not a control. A non-symmetric block does not vanish at `u = 1/2`, `v = 1/4`. Not the bootstrap sum. The catalog records this id as not-a-bridge. |
| `be-63` | `PhysJS.Chandrasekhar.prefactor` | For `n = 3`, ultra-relativistic degeneracy pressure and the Lane–Emden scale give `M = (ω₃⁰ √(3π)/2) (ℏ c/G)^{3/2} (μ_e m_u)^{−2}`. `ω₃⁰` stays symbolic; `2.01824` is not in the theorem. `ρ_c` cancels. `√π/2` and dropping `ω₃⁰` fail. Not rotation or magnetic support. |
| `be-30` | `PhysJS.Entanglement.first_variation` | For a full-rank diagonal curve of trace `1`, `d/dt S(ρ) = −Tr(ρ̇ log ρ)`. With `K = −log ρ` frozen, that derivative is `d/dt ⟨K⟩`. The jump from `diag(1/2, 1/2)` to `diag(3/4, 1/4)` leaves `⟨K⟩` fixed and changes `S`. Not an area variation. |

The `c²` dictionary is the nested `friedmann` object, `PhysJS.RandallSundrum.flat_friedmann`: `H²_FRW` with the module `Λ` equal to Physlib's `Λ c²` is `FirstOrderFriedmann` at `k = 0`. Dropping `c²` fails when `c² ≠ 1` and `Λ ≠ 0`. The reference names the tension theorem only.

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
