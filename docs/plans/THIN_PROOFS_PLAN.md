# Strengthening the thin proofs

**Status:** plan only. This change adds no proof, and it does not merge, tag, or release.

**Where the proofs are.** PhysJS no longer holds the Lean sources. They live in [Universal-Physics-Tensor `lean/`](https://github.com/danielsimonjr/Universal-Physics-Tensor/tree/master/lean), which the PhysJS README treats as canonical. This plan was read off that tree at `328db370` (2026-11-01). Theorem names are the stable pointers if a file moves. Catalog numeric anchors are the evaluator `reference` objects in Universal-Physics-Tensor `data/bridge-catalog.json`.

**What "thin" means here.** The repair of `be-147` is the bar. `PhysJS.Arrhenius.arrhenius_eq` used to take `k = A exp(−Ea/(R T))` as a hypothesis and conclude the same formula multiplied out. It now takes a positive differentiable rate whose activation energy `R T² d(ln k)/dT` is one constant, and it derives the exponential, with the Boltzmann tail as an integral. A proof is thin when the catalog equation is a hypothesis, or a short cancellation of definitions, and the file never checks that equation by a second route, a limit, a dimension, or a number. A hypothesis that the module docstring already owns (transmission coefficient `1`, two polarizations, unit statistical weights) stays a hypothesis. The work below derives what that hypothesis is used for, and adds a theorem that a different numerical factor is a different statement.

**How to check, in the four ways this plan uses.**

- **Independent derivation.** A second chain in the same file, from premises the current proof does not assume. Replaying `field_simp` on the same hypotheses does not count.
- **Limiting case.** A named theorem for a limit, a sign, or a counterexample that shows a hypothesis is load-bearing. The pattern already in these files is `GibbsIsotherm.sign_needed`, `Saha.spin_not_included`, and `OnsagerReciprocity.not_without_balance`.
- **Dimensional check.** `PhysJS.Dimensional` (`lean/Dimensional.lean`) is a Buckingham–Pi fragment. It proves a homogeneous function is a monomial times a dimensionless value, or a function of a ratio. It does not choose the pure number. For each dimensionless group below, the check is that the catalog monomial is invariant under a change of units, and that dimensional homogeneity leaves an arbitrary function of that monomial. The mode decay or the wall profile is what fixes the function to the identity. Do not cite `monomial_form` as a derivation of `Pr = μ c_p / k` or of any other factor.
- **Numeric cross-check.** Exact rational or symbolic points, proved in Lean. The catalog `reference` floats stay in the catalog. They are the external anchors. They are not pasted in as axioms. A float that is really a short rational is stated as that rational.

**Shared lemma, before the six transport numbers.** `PhysJS.DiffusionMode.mode_solves_iff` already shows that `exp(−r t) sin(q (x − U t))` solves `∂u/∂t + U ∂u/∂x = D ∂²u/∂x²` everywhere if and only if `r = D q²`, for every advection speed `U`. Prandtl, Reynolds, and Schmidt call it only at one speed (`U = 0`, or `U = v` for Reynolds) and then cancel by hand. Add one corollary in `lean/DiffusionMode.lean`: two solutions at the same `(q, U)` have decay-rate ratio equal to the diffusivity ratio, and the ratio does not depend on `q` or `U`. The three files call that corollary. They stop carrying their own `field_simp` cancellation.

**Out of this plan.** `be-147`, `be-150`, `be-152`, `be-153`, `be-160` through `be-162`, `be-165` through `be-167`, and `be-169`. Also out: heat-transfer correlations, the Reynolds analogy (`be-86`), the pipe factor (`be-77`), the ideal diode (`be-82`), `L12(B) = L21(−B)`, a measured Joule–Thomson inversion curve, and a radiometer value for the Planck density. No new catalog id. No new bridge file. A citation edit in `data/bridge-catalog.json` belongs with the later proof change in Universal-Physics-Tensor, not with this plan.

## be-148 Eyring

**File.** `lean/Eyring.lean`, namespace `PhysJS.Eyring`. Catalog label `k = (k_B T/h) exp(−ΔG‡/(k_B T))`. Theorems `classical_limit`, `eyring_eq`, `molar_matches_molecular`, `effective_arrhenius`.

**Why it is thin.** `classical_limit` is a real derivative: `ν / (1 − exp(−a ν)) → 1/a` as `ν → 0`. Everything around it is given. `eyring_eq` assumes the rate `k(ν) = ν q(ν) K‡` with the oscillator partition function `q(ν) = 1 / (1 − exp(−h ν / (k_B T)))` already in `hk`, and it assumes the isotherm `ΔG‡ = −k_B T ln K‡` in `hG`. The limit is then multiplication by `K‡`. `molar_matches_molecular` assumes `k = A exp(−ΔG_molar / (R T))` and rewrites it with `PhysJS.Arrhenius.molar_exponent`. That is the pattern `be-147` was repaired to remove. `effective_arrhenius` differentiates the already-limited formula `k(t) = (k_B t / h) exp(ΔS‡/R) exp(−ΔH‡/(R t))`. The module docstring says that feeding `Ea = ΔH‡ + R T` and `A = (k_B T / h) exp(ΔS‡/R)` back into `A exp(−Ea/(R T))` differs from the Eyring rate by `exp(−1)`. No theorem states that.

**Independent derivation.** Derive `q(ν)` as the geometric series of harmonic levels `n h ν`, `n = 0, 1, 2, …`, the same series `PhysJS.PlanckSpectrum.bose_factor` sums for `1 / (e^x − 1)`. The classical limit then applies to that sum, not to a formula in `hk`. Keep `ΔG‡ = −k_B T ln K‡` as the molecular isotherm (it is `be-150`'s shape per molecule). Do not take the Eyring formula itself as a hypothesis anywhere in the file.

**Limiting cases.**

- Barrier zero: `ΔG‡ = 0` gives limiting rate `k_B T / h`.
- Stiff coordinate: as `h ν / (k_B T) → ∞`, `ν q(ν) → ν`, so the universal prefactor is only the loose-coordinate limit.
- The `exp(−1)` gap, as a theorem. With `A(T) = (k_B T / h) exp(ΔS‡/R)` and `Ea(T) = ΔH‡ + R T`, `A exp(−Ea/(R T)) = exp(−1)` times the Eyring rate. State that `Ea` from `effective_arrhenius` is therefore not a temperature-independent Arrhenius energy at that `A`.
- The logarithmic derivative is taken on the limited rate. Add the statement that this file does not interchange `d/dT` with `ν → 0`. Computing `Ea` at finite `ν` and then taking `ν → 0` is a further theorem, not a corollary of the two existing ones.

**Dimensional check.** `[k_B T / h] = T⁻¹` and `[ΔG‡ / (k_B T)] = 1`, so the product is a rate. `[ΔH‡] = [R T]`, so `Ea = ΔH‡ + R T` is a sum of energies. Homogeneity leaves the function of `ΔG‡ / (k_B T)` free. The geometric series and the limit fix it as the exponential. Dimensions do not.

**Numeric cross-check.** The factor `exp(−1)` and the zero-barrier value `k_B T / h` are exact. The catalog anchor is barrier `1e-19` J, `T = 300` K, rate about `204.491`. Leave that float in the catalog. If the proof specialises it, `k_B` and `h` enter as hypotheses and the proved statement is the exact expression, not the printed digits.

## be-149 van 't Hoff (borderline)

**File.** `lean/VanTHoff.lean`, namespace `PhysJS.VanTHoff`. Catalog label `d ln K/dT = ΔH°/(R T²)`. Theorems `equilibrium_log`, `enthalpy_log`, `slope_of_log`, `vant_hoff`.

**Why it is borderline.** The slope is derived, which is why this one is not in the same class as the transport numbers. `equilibrium_log` is `PhysJS.GibbsIsotherm.gibbs_eq` at each temperature. `enthalpy_log` uses `ΔG°(t) = ΔH° − t ΔS°` with `ΔH°` and `ΔS°` constant. `slope_of_log` differentiates `ln K = −ΔH°/(R t) + ΔS°/R`. `vant_hoff` composes the three. The chain from ideal chemical potentials to the slope is real. It is thin at the ends. Constant `ΔH°` and `ΔS°` are assumed at every `t`, so the file never proves the slope when `ΔH°` depends on `T`. The docstring says the integrated form is derived. What is derived is that logarithm. There is no theorem for `ln(K(T₂)/K(T₁))`. There is no sign theorem. `equilibrium_log` is only the second conjunct of `gibbs_eq`.

**Independent derivation.** Gibbs–Helmholtz, `(∂(ΔG°/T)/∂T)_P = −ΔH°(T)/T²`, together with `ΔG° = −R T ln K` from `be-150`. Differentiating gives `d ln K/dT = ΔH°(T)/(R T²)` with `ΔH°` a function of `T`. Constant `ΔH°` is then the special case, not the hypothesis that makes the slope true. Keep calling `gibbs_eq` for the isotherm. Do not re-prove `be-150`.

**Limiting cases.**

- Sign: `ΔH° < 0` and `R > 0` give a negative slope at `T ≠ 0`. Exothermic `K` falls with `T`.
- Two temperatures, only for constant `ΔH°`: `ln(K(T₂)/K(T₁)) = −(ΔH°/R) (1/T₂ − 1/T₁)`, by subtracting `enthalpy_log` at the two temperatures.
- Load-bearing counterexample: if `ΔH°(T) = ΔH₀ + ΔC_p (T − T₀)` with `ΔC_p ≠ 0` and `T ≠ T₀`, the slope is not `ΔH₀/(R T²)`, so `ln K(T) = −ΔH₀/(R T) + ΔS°/R` cannot hold at every `T`. Constant heat capacity stays a counterexample, not a new catalog row.

**Dimensional check.** `[ΔH° / (R T²)] = Θ⁻¹`. A unit change that rescales temperature rescales the slope by the inverse factor. Homogeneity does not fix the placement of `ΔH°` in the numerator. The Gibbs–Helmholtz derivative does.

**Numeric cross-check.** Exact point: `ΔH° = R` and `T = 1` give slope `1`. Exact point: `ΔH° = −R` gives slope `−1/T²`. The catalog anchor is `ΔH° = 1000` J mol⁻¹, `T = 300` K, slope about `0.001336`, with `R = N_A k_B` as in the evaluator expression. Leave the float in the catalog.

## be-151 Nernst

**File.** `lean/NernstGibbs.lean`, namespace `PhysJS.NernstGibbs`. Catalog label `E = E° − (R T/(n F)) ln Q`, with `F = N_A e`. Theorems `reaction_gibbs`, `nernst_eq`, `standard_from_gibbs`, `equilibrium_voltage`. `e` is the elementary charge.

**Why it is thin.** `reaction_gibbs` is a real sum: ideal activities give `ΔG = ΔG° + R T ln Q`. `nernst_eq` then assumes both `ΔG = −n F E` and `ΔG° = −n F E°` and clears a linear equation. Those two work hypotheses are one physical law used twice. `standard_from_gibbs` is `gibbs_eq` plus the standard-state work hypothesis. `equilibrium_voltage` assumes the finished Nernst formula and the finished `E°`, then rings them to `0`. The identity `R / F = k_B / e` is buried in `nernst_eq`.

**Independent derivation.** Keep the activity sum. Take one work law: at constant `T` and `P`, `ΔG` equals the electrical work of moving charge `n F` across the cell potential, with the sign `ΔG = −n F E` (work done by the cell). Define `E°` as the `Q = 1` case of that same law, where `reaction_gibbs` says `ΔG = ΔG°`. One hypothesis then yields `E = E° − (R T/(n F)) ln Q`. Derive `E° = (R T/(n F)) ln K` by calling `gibbs_eq`, as `standard_from_gibbs` does, and make `equilibrium_voltage` the `Q = K` case of that chain rather than a ring of two assumed formulas. Split `R / F = k_B / e`, from `R = N_A k_B` and `F = N_A e`, into its own lemma.

**Limiting cases.**

- `Q = 1` gives `E = E°`.
- `Q = K` gives `E = 0`.
- A decade of the reaction quotient, at fixed `E°` and `T`: `E(Q) − E(10 Q) = (R T/(n F)) ln 10`.
- Large `n` at fixed `Q`, `R`, `T`, `F`: the correction term is `1/n` times the `n = 1` correction.

**Dimensional check.** `ln Q` is dimensionless. `R T / F` has the dimension of electric potential (energy per charge), and so does `E`. Homogeneity leaves the pure number in front of `ln Q` free. The work law fixes it at `1/n`.

**Numeric cross-check.** The decade identity is exact. The catalog anchor is `E° = 0.34` V, `n = 2`, `Q = 10`, `T = 298.15` K, potential about `0.310420`. That point is `E°` minus half of `(R T / F) ln 10` at `298.15` K, because `n = 2` and `ln Q = ln 10`. Prove that relation. Leave the float in the catalog. This file stays off the ideal diode of `be-82`.

## be-154 Prandtl

**File.** `lean/Prandtl.lean`, namespace `PhysJS.Prandtl`. Catalog label `Pr k = μ c_p`. Theorem `prandtl_eq`.

**Why it is thin.** `Pr` enters as `hPr : Pr = r_u / r_θ`. The kinematic viscosity and the thermal diffusivity enter as `ν = μ / ρ` and `α = k / (ρ c_p)`. `mode_solves_iff` supplies `r_u = ν q²` and `r_θ = α q²`. The rest is cancellation of `q²` and `ρ`. The catalog product is those two definitions composed. The file never states that the same `Pr` holds at every wavenumber and at a nonzero advection speed, which is the content of the shared lemma.

**Independent derivation.** Call the new `DiffusionMode` ratio corollary at `U = 0` and again at a general `U`. Both give `Pr = ν / α`. Separately, write the time ratio `τ_θ / τ_u = (1/r_θ) / (1/r_u)` and show it equals `ν / α` once the corollary has fixed the rates. That time ratio is the reading in the module docstring, and it is currently not its own step.

**Limiting cases.**

- `ν = α` gives `Pr = 1`, and `μ c_p = k`.
- `k → ∞` at fixed `μ`, `c_p`, `ρ` gives `Pr → 0`.
- Replacing `q` by `2 q` leaves `Pr` fixed. Replacing `ρ` by `2 ρ`, with `μ` and `k` fixed, leaves `Pr` fixed because `ν` and `α` scale together.

**Dimensional check.** Base dimensions mass, length, time, temperature. Then `[μ c_p / k] = 1`, and `[ν / α] = 1`. Unit changes leave `Pr` fixed. Homogeneity says `Pr` is some function of `μ c_p / k`. The mode ratio fixes that function to the identity. The Reynolds analogy of `be-86` stays out.

**Numeric cross-check.** Catalog inputs `μ = 0.001`, `c_p = 4180`, `k = 0.6` give `Pr = 209/30` exactly (the printed value `6.9666…`). Prove `209/30` from those inputs, and prove the rate-ratio route equals the same rational. A second exact point: `μ = c_p = k = 1` gives `Pr = 1`.

## be-155 Reynolds

**File.** `lean/ReynoldsNumber.lean`, namespace `PhysJS.ReynoldsNumber`. Catalog label `Re μ = ρ v L`. Theorem `reynolds_eq`.

**Why it is thin.** `Re` enters as `τ_visc / τ_adv` with `τ_visc = 1/r` and `τ_adv = L / v`. The mode of wavenumber `1/L` fixes `r = ν / L²`. Then `Re = v L / ν`, and `ν = μ / ρ` turns that into `ρ v L / μ`. The catalog product is the substitution. The file does not separate the time-ratio arithmetic from the PDE, and it does not show that the length in the wavenumber is the length in the answer.

**Independent derivation.** One lemma with no PDE: if `τ_visc = L² / ν` and `τ_adv = L / v`, then `τ_visc / τ_adv = v L / ν`. A second step, the shared corollary at wavenumber `1/L` and speed `v`, shows the viscous decay time is `L² / ν`. The product `Re μ = ρ v L` is `ν = μ / ρ` applied to that quotient. A change of units that fixes `ρ v L / μ` is the dimensional route, and it leaves an arbitrary function of the quotient. The mode fixes the function.

**Limiting cases.**

- `v → 0` gives `Re → 0`. `ν → 0` at fixed `v`, `L` gives `Re → ∞`.
- Length is load-bearing: the same `ρ`, `v`, `μ` at length `2 L` give twice the Reynolds number. Wavenumber `2/L` is a different number. This is the analogue of `Saha.spin_not_included`.
- The pipe identity `f Re = 64` uses a diameter and a friction factor that are not hypotheses here. This file does not produce it (`be-77` stays a different row).

**Dimensional check.** `[ρ v L / μ] = 1` and `[v L / ν] = 1`. State the exponents of mass, length, and time. Homogeneity does not choose the factor `1`.

**Numeric cross-check.** Catalog inputs `ρ = 1000`, `v = 2`, `L = 0.05`, `μ = 0.001` give `Re = 100000` exactly. Prove that integer, and prove the doubled-length point `Re = 200000`.

## be-156 Biot

**File.** `lean/Biot.lean`, namespace `PhysJS.Biot`. Catalog label `Bi k = h L_c`. Theorem `biot_eq`. The coefficient in the file is `hcoeff`.

**Why it is thin.** `Bi` enters already defined as the drop ratio `(T(0) − T(L)) / (T(L) − T∞)`. `PhysJS.SteadyProfile.linear_profile` makes `T` linear, the Robin condition `−k T'(L) = h (T(L) − T∞)` converts the ratio into `h L / k`, and `L = V / A` is a substitution. One `linear_combination` does the work. The second writing `h V / (k A)` is that substitution. The file says it is not a lumped-capacitance criterion, and it never proves the comparison with `1` that the sentence is about.

**Independent derivation.** Second chain, through `PhysJS.FourierConduction.fourier_eq` rather than through `linear_profile`. Constant flux gives `q L = −k (T(L) − T(0))`. The same `q` at the cooled face is `h (T(L) − T∞)`, which is the Robin condition rewritten with the Fourier sign (`q = −k dT/dx`). Divide, for `q ≠ 0`. The result is `Bi = h L / k` where `Bi` is introduced as that quotient, not as a hypothesis. The `V/A` form is the plane wall only. Substituting `L = V/A` does not derive a sphere or a cylinder. Those profiles stay out of this row.

**Limiting cases.**

- Sign, for `h > 0`, `k > 0`, `L > 0`, and `T(L) > T∞`: the steady wall is hotter inside, `T(0) > T(L)`, so `Bi > 0`.
- Comparison with `1`: `Bi < 1` if and only if the internal drop is smaller than the external drop. That is the content of the lumped remark. It is not a time-dependent lumped model, and this file still does not grow one.
- `h L = k` gives `Bi = 1`. `k → ∞` at fixed `h`, `L` gives `Bi → 0`.

**Dimensional check.** `[h L / k] = 1`, and `[V / A] = L`, so `[h V / (k A)] = 1`. The common dimension of the two drops cancels. Homogeneity leaves an arbitrary function of `h L / k`. The wall problem fixes the identity.

**Numeric cross-check.** Exact profile: `k = h = L = 1`, `T∞ = 0`, `T(L) = 1`, `T(0) = 2`, slope `−1`. The Robin condition holds and `Bi = 1`. Catalog inputs `h = 25`, `L = 0.02`, `k = 16` give `Bi = 1/32` exactly (the printed value `0.03125`).

## be-157 Nusselt

**File.** `lean/Nusselt.lean`, namespace `PhysJS.Nusselt`. Catalog label `Nu k = h L`. Theorem `nusselt_eq`.

**Why it is thin.** `hNu` assumes the catalog product `Nu = h L / k`. The film condition `h (T_w − T∞) = −k T'(0)` rewrites it as the dimensionless wall gradient. The conjunct `Nu k = h L` is `hNu` cleared. The one real check is the last conjunct: a steady layer `T'' = 0` with `T(L) = T∞` has `Nu = 1`, from `PhysJS.SteadyProfile.slab_slope`. The number is assumed, then recognised.

**Independent derivation.** Define `Nu` as the wall gradient `L (−T'(0)) / (T_w − T∞)`, with `T(0) = T_w`. Derive `Nu = h L / k` from the film condition. Keep the conduction layer as a second theorem, not a nested implication: `T'' = 0` and `T(L) = T∞` give `Nu = 1` and `h = k / L`. A third statement, the heat/mass transport, is the Sherwood proof below. It should be this theorem with renamed fields, not a second algebra.

**Limiting cases.**

- Conduction: `Nu = 1` for the linear layer.
- Load-bearing: if `T(L) ≠ T∞`, the same linear profile does not give `Nu = 1`.
- Doubling `h` and doubling the wall gradient, at fixed `k`, `L`, and temperature drop, doubles `Nu`.

**Dimensional check.** `[h L / k] = 1`. The length here is the fluid-side length. The Biot length is the solid-side thickness, and the two conductivities are different materials. A unit-free `Nu` equal to a unit-free `Bi` is not an identity. State that `Nu = 1` does not give `Bi = 1`.

**Numeric cross-check.** Exact conduction profile: `T(x) = T_w + (T∞ − T_w) (x / L)` gives `Nu = 1`. Catalog inputs `h = 40`, `L = 0.2`, `k = 0.026` give `Nu = 4000/13` exactly (the printed value `307.692…`). No correlation for `Nu` is added.

## be-158 Schmidt

**File.** `lean/Schmidt.lean`, namespace `PhysJS.Schmidt`. Catalog label `Sc ρ D = μ`. Theorem `schmidt_eq`.

**Why it is thin.** `Sc`, `Le`, and `Pr` enter as the three rate ratios `r_u / r_c`, `r_θ / r_c`, and `r_u / r_θ`. The shared mode lemma at `U = 0` turns them into `ν / D`, `α / D`, and `ν / α`. Then `ν = μ / ρ` is a substitution, and `Le = Sc / Pr` is algebra of the three definitions. The catalog citation says "Lewis number is not this row." The theorem's third conjunct is `Le = Sc / Pr`. The row's target is only `Sc ρ D = μ`. The citation and the conjunct talk past each other.

**Independent derivation.** Call the shared ratio corollary three times, at a general advection speed as well as at `U = 0`. Split `Le = Sc / Pr` into its own lemma, `lewis_ratio`, whose statement is the ratio of the three diffusivities. The catalog product stays `schmidt_eq`. When the proof changes, the catalog citation should say that the evaluator target is `Sc ρ D = μ` and that `Le = Sc / Pr` is a corollary in the same file, not a second target. That edit is in Universal-Physics-Tensor, with the proof. This plan does not change the catalog.

**Limiting cases.**

- `D = ν` gives `Sc = 1`. `D = α` gives `Le = 1`. `Pr = Sc` gives `Le = 1`.
- Replacing `q` by `2 q` leaves `Sc` and `Le` fixed.
- A mass-transfer correlation `Sh(Sc)` is not a consequence. No such formula is added.

**Dimensional check.** `[μ / (ρ D)] = 1` and `[α / D] = 1`. Homogeneity leaves an arbitrary function of `μ / (ρ D)`. The mode ratio fixes the identity. The same remark as Prandtl: dimensions do not choose the factor.

**Numeric cross-check.** Catalog inputs `μ = 0.00089`, `ρ = 997`, `D = 2.3e-9` give `Sc = 8900000 / 22931` exactly (the printed value `388.120…`). Prove that rational from both `μ / (ρ D)` and `ν / D`. Exact point: `ν = α = D` gives `Sc = Le = Pr = 1`.

## be-159 Sherwood

**File.** `lean/Sherwood.lean`, namespace `PhysJS.Sherwood`. Catalog label `Sh D = k_m L`. Theorem `sherwood_eq`.

**Why it is thin.** The file is the Nusselt proof with `(T, h, k, T_w, T∞)` renamed to `(c, k_m, D, c_w, c∞)`. `hSh` assumes `Sh = k_m L / D`. The film condition rewrites it as a wall gradient. A linear layer with `c(L) = c∞` gives `Sh = 1`. Nothing in the file says it is the Nusselt theorem.

**Independent derivation.** After Nusselt defines `Nu` from the wall gradient, prove Sherwood by transporting that theorem along the renaming. The film condition `k_m (c_w − c∞) = −D c'(0)` is the image of the thermal film condition. A hand-copied `field_simp` is the current proof, and it should not remain the second copy. Keep `Sh = 1` for the linear diffusion layer as the image of `Nu = 1`.

**Limiting cases.** The images of the Nusselt limits: `Sh = 1` on the linear layer, `Sh ≠ 1` when `c(L) ≠ c∞`, and doubling `k_m` doubles `Sh` when the gradient doubles with it. `D → ∞` at fixed `k_m` and fixed drop gives `Sh → 0`.

**Dimensional check.** `[k_m L / D] = 1`. Same homogeneity remark as Nusselt. `Sh = Nu` is not an identity of the two fluids.

**Numeric cross-check.** Catalog inputs `k_m = 0.01`, `L = 0.2`, `D = 2e-5` give `Sh = 100` exactly. The conduction-style profile `c(x) = c_w + (c∞ − c_w) (x / L)` gives `Sh = 1`. No correlation for `Sh` is added.

## be-163 Joule–Thomson

**File.** `lean/JouleThomson.lean`, namespace `PhysJS.JouleThomson`. Catalog label `μ_JT c_p = T (∂v/∂T)_p − v`. Theorems `volume_eq`, `enthalpy_eq`, `joule_thomson_eq`, `virial_inversion`.

**Why it is thin.** For the specific molar Gibbs energy `φ(T) + R T ln P + B(T) P`, the file does derive `v = R T / P + B` and `(∂h/∂P)_T = B − T B'`, and it does prove the ideal gas `B = 0` has `μ_JT = 0`. The general identity `(∂h/∂P)_T = v − T (∂v/∂T)_P` is proved by differentiating this `g`, not from the Maxwell relation. `virial_inversion` specialises to `B = b − a / (R T)` and stops at `μ_JT c_p = 2 a / (R T) − b`. It never states the inversion temperature `T = 2 a / (R b)`, nor the sign on either side of it. The catalog evaluator is per mass (`v` in m³ kg⁻¹, `c_p` in J kg⁻¹ K⁻¹). The Lean development is per mole and uses a molar `R`. Those are the same shape of identity and not the same quantities. The docstring already excludes a measured inversion curve. The algebraic root of this virial is part of this row.

**Independent derivation.** For a general molar `g(T, P)`, with `v = (∂g/∂P)_T` and `s = −(∂g/∂T)_P`, set `h = g + T s`. The Maxwell relation `(∂s/∂P)_T = −(∂v/∂T)_P` gives `(∂h/∂P)_T = v − T (∂v/∂T)_P`, with no virial form. Define `μ_JT = −(∂h/∂P)_T / c_p` with `c_p = (∂h/∂T)_P`. The virial `g` is then a special case, and `virial_inversion` stays the low-density van der Waals special case. One lemma states that the per-mass identity has the same algebra and different dimensions: `R` appears only in the molar virial branch.

**Limiting cases.**

- Ideal gas, already proved: `B = 0` gives `μ_JT = 0`. Leave it, and cite it from the Maxwell route so it does not depend on `φ`.
- No attraction: `a = 0` and `b > 0` give `μ_JT c_p = −b < 0`.
- Inversion: for `a > 0`, `b > 0`, `R > 0`, `c_p > 0`, `μ_JT = 0` at `T = 2 a / (R b)`, `μ_JT > 0` below that temperature, and `μ_JT < 0` above it. Positive `μ_JT` is cooling on an isenthalpic pressure drop.

**Dimensional check.** Molar: `[v] = L³ N⁻¹`, `[c_p] = energy N⁻¹ Θ⁻¹`, so `[μ_JT] = Θ / pressure`. Per mass: `[v] = L³ M⁻¹` and `[c_p]` per mass, same quotient for `μ_JT`. The minus sign is not a consequence of dimensions. The Maxwell relation fixes it. `R` in `B = b − a / (R T)` is molar. Do not substitute the catalog's per-mass numbers into `virial_inversion`.

**Numeric cross-check.** Virial point, exact: `a = R`, `b = 1`, `T = 1` gives `μ_JT c_p = 1`. At `T = 2`, `μ_JT = 0`. The catalog point `T = 300`, `(∂v/∂T) = 0.002`, `v = 0.2`, `c_p = 1000` gives `μ_JT = 4/10000` from the quotient alone. It does not exercise `B(T)`. Prove it as a check of the quotient, and label it per mass.

## be-164 Planck

**File.** `lean/PlanckSpectrum.lean`, namespace `PhysJS.PlanckSpectrum`. Catalog label `u (exp(h ν / (k_B T)) − 1) c³ = 8 π h ν³`. Theorems `bose_factor`, `mean_energy`, `planck_eq`.

**Why it is thin.** `bose_factor` and `mean_energy` are real: the geometric series gives `⟨E⟩ = h ν / (e^x − 1)` for levels `n h ν`, `n = 0, 1, 2, …`. `planck_eq` multiplies that mean by `hmode`, the assumption `mode = 8 π ν² / c³`. The factor `8 π`, the two polarizations, and the absence of a zero-point energy are not checked. The frequency integral is `be-165` and stays there. The catalog citation says one polarization is not this density. No theorem says so.

**Independent derivation.** Count modes in a cube of side `L` with periodic boundaries. Wavevector components are `2 π n / L`. The number of wavevectors with wavenumber in `[k, k+dk]` is `(L / 2π)³ 4 π k² dk`, times two polarizations, with `k = 2 π ν / c`. That is `V · 8 π ν² / c³ dν`. The continuum density is the conclusion. The periodic cube is the hypothesis that replaces `hmode`. `mean_energy` stays the energy per mode. Their product is `u`.

**Limiting cases.**

- Rayleigh–Jeans: as `x = h ν / (k_B T) → 0`, `(e^x − 1) / x → 1`, so `u → (8 π ν² / c³) k_B T`. The limit does not contain `h`.
- Wien: as `x → ∞`, `u` divided by `(8 π h ν³ / c³) exp(−x)` tends to `1`.
- One polarization: mode density `4 π ν² / c³` fails the catalog equation with `8 π`.
- Zero point: levels `(n + 1/2) h ν` add `h ν / 2` to the mean, and add `4 π h ν³ / c³` to `u`. That density is not the catalog right-hand side. The premise that the levels start at `n = 0` with energy `n h ν` is load-bearing.

**Dimensional check.** `[ν² / c³]` times an energy is energy per volume per frequency. `[h ν / (k_B T)] = 1`, so the Bose factor is dimensionless. Homogeneity leaves both the pure number `8 π` and the function of `x` free. The mode count fixes `8 π`. The geometric series fixes the function. Neither is a dimensional result.

**Numeric cross-check.** Exact: at `x → 0` the ratio of `u` to the Rayleigh–Jeans density tends to `1`, and the one-polarization density is half. The catalog anchor is `ν = 1e14` Hz, `T = 2273.15` K, `u` about `8.515e-17`. Leave the float in the catalog. A Lean specialisation of that point takes `h`, `c`, and `k_B` as hypotheses and proves the exact expression.

## be-168 Saha

**File.** `lean/Saha.lean`, namespace `PhysJS.Saha`. Catalog label `K = (2 π m k_B T / h²)^{3/2} exp(−I/(k_B T))`, unit statistical weights. Theorems `thermal_concentration` (a lemma), `saha_eq`, `spin_not_included`.

**Why it is thin.** `thermal_concentration` is a real rewriting of `PhysJS.ThermalDeBroglie.wavelength_eq` to the power `−3`. `saha_eq` assumes the whole equilibrium `μ_A = μ₊ + μ_e` as one equation, with each chemical potential already in the form `E + k_B T ln(n λ³ / g)`, the atom and the ion already sharing one heavy wavelength, and `I = E₊ + E_e − E_A`. The proof rearranges that equation and multiplies by the thermal factor. `spin_not_included` shows that a typed factor `2` changes `K`, and it does not say for which weights the catalog formula holds. The electron weight `g_e = 2` is discussed in the docstring and is not a positive theorem.

**Independent derivation.** Derive the chemical potential from the single-particle partition function `Z_1 = g V λ⁻³ exp(−E / (k_B T))`, so `μ = E + k_B T ln(n λ³ / g)`, instead of packing that form into `hequil`. Equilibrium is then `μ_A = μ₊ + μ_e` as its own hypothesis, the way `be-150` separates the ideal law from the sum. Keep calling `wavelength_eq` for `λ_e`. Do not re-prove `be-12`. Name the cancellation of the shared heavy wavelength: `K` does not depend on `lam`.

**Limiting cases.**

- `I = 0` gives `K = (g₊ g_e / g_A)` times the electron thermal concentration.
- `g₊ g_e = g_A` is the catalog formula, already the second conjunct of `saha_eq`. Make the complementary case a positive statement: `g₊ g_e = 2 g_A` gives twice the catalog `K`. That replaces the purely negative `spin_not_included`.
- `I > 0` and `T → 0⁺` give `K → 0`. As `T → ∞`, `K / T^{3/2}` tends to `(g₊ g_e / g_A) (2 π m k_B / h²)^{3/2}`.
- Load-bearing wavelength: if the ion wavelength is `2` times the atom wavelength, the concentration ratio gains a factor `1/8`. The shared-`lam` hypothesis is what removes it.
- Ionization balance, as a corollary rather than a new row: `n₊ / n_A = K / n_e`.

**Dimensional check.** `[K] = L⁻³`, because `K = n₊ n_e / n_A` and because `λ⁻³` is a number density. The exponential is dimensionless, so `[I] = [k_B T]`. The power `3/2` is the thermal-wavelength lemma, not a conclusion of `Dimensional.monomial_form`. Dimensions confirm the result is a density. They do not choose `3/2`.

**Numeric cross-check.** Exact points: equal weights give the catalog monomial; weights in the ratio `2` give twice that monomial; `I = 0` drops the exponential; unequal heavy wavelengths contribute `(lam_A / lam_I)³`. The catalog anchor is the electron mass `9.1093837015e-31` kg, `T = 10000` K, `I = 1.0550558526199999e-17` J, `K` about `1.568e-6`. Leave the float in the catalog.

## be-170 Onsager

**File.** `lean/OnsagerReciprocity.lean`, namespace `PhysJS.OnsagerReciprocity`. Catalog label `L12 = L21` at `B = 0`. Theorems `onsager_eq`, `not_without_balance`, `potential_symmetric`, `entropy_blind`, `thermoelectric_instance`.

**Why it is thin.** `onsager_eq` is a genuine reindexing: detailed balance `π_i W_ij = π_j W_ji` swaps the sum that defines `kinetic`. The docstring equates that sum with `d/dt ⟨A_a(t) A_b(0)⟩` at `t = 0`. Nothing derives the derivative. The sum equals that derivative for a continuous-time Markov generator, whose rows sum to `0`. The witness in `not_without_balance` has `W_ij = 1` when `j = i + 1` and `0` otherwise, so each row sums to `1`. It is outside the class the docstring is about. The proof shows the two sums differ and does not record their values. `potential_symmetric` defines the dissipation with a single cross coefficient `L12` and then finds that both mixed partials equal `L12`. The macroscopic equality is the way the quadratic form was written. `entropy_blind` proves `(A X₂) X₁ + (−A X₁) X₂ = 0` and `A ≠ −A`. It does not define the two fluxes, so the docstring's claim that the antisymmetric piece splits the fluxes is not the theorem. `thermoelectric_instance` reads `R.onsager` off the record from `be-73`. It is not a derivation of `L12 = L21`, and the file already says it is not a second proof of `Π = S T`.

**Independent derivation.** Start from the master equation with generator `W`, each row summing to `0`. The observables evolve by `(L† f)(i) = ∑_j W_ij (f(j) − f(i))`. Prove that the initial slope of `⟨A_a(t) A_b(0)⟩` equals `∑_{i,j} π_i A_b(i) W_ij A_a(j)`. Detailed balance then gives `L_ab = L_ba`, which is `onsager_eq` applied to a sum that is now a derivative. Replace `potential_symmetric` with a potential that has two cross coefficients. The mixed partials agree if and only if `L12 = L21`. The symmetric combination `(L12 + L21) / 2` is what a single quadratic term can see. State `entropy_blind` with the fluxes `J₁ = L11 X₁ + L12 X₂ + A X₂` and `J₂ = L21 X₁ + L22 X₂ − A X₁`: entropy production `J · X` is independent of `A`, and `A ≠ 0` gives `J₁` and `J₂` different from the symmetric law. The magnetic statement `L12(B) = L21(−B)` stays out.

**Limiting cases.**

- Zero rates: `W = 0` gives every coefficient `0`.
- Retarget `not_without_balance` onto a generator. Forward cycle `W_ij = 1` for `j = i + 1`, diagonal `W_ii = −1`, and `π_i = 1/3`, on `Fin 3`. Detailed balance fails.
- Reversing that cycle negates `L_ab − L_ba`.

**Dimensional check.** If `π` is dimensionless and `W` is a rate, `[L_ab] = [A_a A_b] / time`, and `[L_ba]` is the same monomial. Equal dimension does not need detailed balance. Equal value does. Say so, so the dimensional check is not mistaken for `onsager_eq`.

**Numeric cross-check.** On that three-state generator, with `A_a` equal to `1` only at state `0` and `A_b` equal to `1` only at state `1`, the coefficients are `0` and `1/3`. Record the values. The current proof records only inequality, and its matrix has row sums `1`, so it is not this witness. Positive witness: `Fin 2`, `π = 1/2`, off-diagonal rates `1`, diagonals `−1`. Both coefficients equal `1/2`. The catalog anchor sets the output equal to the input `L12 = 3` whenever `B` is numerically zero. That point checks the evaluator's guard. It does not check this proof. Do not treat it as the numeric check.

## Order of the later proof change

The six transport files (`be-154` through `be-159`) follow the shared `DiffusionMode` corollary, and Sherwood follows the rewritten Nusselt theorem. The other seven files do not depend on each other. Each later change stays inside the file named above, plus `lean/DiffusionMode.lean` for the one corollary. Catalog citation text for `be-158` changes only together with `lewis_ratio`. No catalog equation changes.
