# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- `PhysJS.QuantumCritical.thermal_scaling`, a complete proof of the catalog
  scaling `ξ(T) = ξ₀ (T/T₀)^{−1/z}`. At `z = 1`, for `T > 0` and `T₀ > 0`,
  this is `ξ₀ (T/T₀)^{−1} = ξ₀ T₀/T`. `xi_product` remains `ξ T = ξ₀ T₀`.
  It covers that equation of `be-33`, not Hertz–Millis theory.
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
- `PhysJS.Mond.tendsto_nu_limits`, a complete proof that `ν(z) → 1` as
  `z → ∞` and `ν(z) √z → 1` as `z → 0⁺`, and that the force ratio
  `F_N ν(z) / √(m F_N a₀)` tends to `1`. The claim `ν √z → √2` fails. The
  nested `inversion` theorem inverts `μ(x) = x / √(1 + x²)`. It covers those
  two parts of `be-38`, not the SPARC confrontation.
- `PhysJS.Einstein.trace_eq`, a complete proof that contracting
  `G_μν + Λ g_μν = κ T_μν` in four dimensions gives `R = 4Λ − κ T`. Under
  `−,+,+,+`, dust has trace `−ρ c²`. The nested `vacuum` theorem is the
  BE-20 density `ρ = c² Λ / (8π G)`. The opposite vacuum sign fails. It
  covers those two parts of `be-13`, not Jacobson's thermodynamic derivation.
- `PhysJS.KibbleZurek.exponent`, a complete proof of the freeze-out value
  `ε̂ = (τ₀/τ_Q)^(1/(1+zν))` and of the defect power without the Boltzmann
  factor. `ε̂` is the unique positive solution. The exponent with the `1`
  omitted fails. It covers that derivation step of `be-34`, not the
  reheating factor and not a repair of the missing `1/a^d` prefactor.
- `PhysJS.HawkingUnruh.dictionary`, a complete cross-check that
  `T_H(2GM/c²) = T_H(M)` and `T_U(c⁴/(4GM)) = T_H(M)`. The covers line
  names BE-57 and `be-42-via-rs`. `T_U(c⁴/(2GM))` is not `T_H(M)`. It
  covers that dictionary of `be-42`, not the Hawking effect, and it is
  not a formalRef.
- `PhysJS.Fret.dictionary`, a complete cross-check that the Förster
  efficiency is `R₀⁶/(R₀⁶+R⁶)`, `1/(1+(R/R₀)⁶)`, and
  `k_FRET/(k_FRET+1/τ_D)`, and that it decreases. At `R = 2 R₀` the
  exponent 4 is not the exponent 6. It covers that dictionary of `be-24`,
  not the dipole–dipole law, and it is not a formalRef.
- `PhysJS.QuantumBounce.dictionary`, a complete cross-check that
  `H²_LQC` equals `H²_RS` at `σ = −ρ_c/2`, that both tend to
  `(8πG/3)ρ + Λ/3`, and that `H²_LQC = 0` at `ρ = ρ_c` and `Λ = 0`.
  The covers line names BE-54. `σ = +ρ_c/2` is not that polynomial, and
  `σ < 0` is not a physical Randall–Sundrum brane. It covers that
  dictionary of `be-19`, and it is not a formalRef.
- `PhysJS.Landauer.equal_levels`, a complete proof that equal levels of
  Physlib's two-state ensemble have thermodynamic entropy `k_B log 2`.
  At `T ≠ 0`, levels `E` and `E + δ` are not that value. At `T = 0` the
  closed form does not separate the levels. It covers that property of
  `be-16`, not `E ≥ T ΔS` and not the Bérut confrontation, and it is not
  a formalRef.
- `PhysJS.Jarzynski.jensen_work`, a complete proof that a finite
  probability and `β > 0` give `⟨W⟩ ≥ ΔF`, where `ΔF` is
  `−(1/β) log(∑ p_i exp(−β W_i))`. The reversed inequality fails on two
  unequal work values. It covers that property of `be-29`, not
  Jarzynski's theorem and not the Gaussian identity, and it is not a
  formalRef.
- `PhysJS.Lindblad.preserve`, a complete proof that one channel of the
  displayed GKSL generator has trace zero, and that it is Hermitian when
  `H` and `ρ` are. `L` need not be Hermitian. Dropping the anticommutator
  makes the trace nonzero. It covers that property of `be-11`, not
  Born–Markov coarse-graining, and it is not a formalRef.
- `PhysJS.Jeans.mass_eq`, a complete proof that the encoded Jeans mass
  `(5 k T / (G μ m_u))^(3/2) (3 / (4 π ρ))^(1/2)` follows from the virial
  convention with factor `5` and `M = 4 π R³ ρ / 3`. Replacing `5` by `3`
  fails. It covers that derivation step of `be-65`, not the virial
  theorem.
- `PhysJS.Deflection.line_integral`, a complete proof that
  `(1+γ)/c² ∫_ℝ G M b / (b² + z²)^{3/2} dz = 2(1+γ) G M / (b c²)`.
  At `γ = 1` this is the encoded angle `4 G M / (b c²)`. `γ = 0` is
  half of that angle. It covers that derivation step of `be-51`, not a
  geodesic.
- `PhysJS.Sommerfeld.integral_eq`, a complete proof that
  `∫_ℝ x² e^x / (1+e^x)² dx = π²/3`. That factor is the `π²/3` in the
  encoded Lorenz number. The integrand is even, so the half-line is half
  of `π²/3`, and claiming the half-line equals `π²/3` fails. It covers
  that derivation step of `be-61`, not the transport law.
- `PhysJS.ThermalDeBroglie.wavelength_eq`, a complete proof that
  `√(2π ℏ² / (m k_B T)) = h / √(2π m k_B T)` for `h = 2π ℏ` and
  `ℏ > 0`. The square root is non-negative, so `ℏ > 0` is the hypothesis
  that makes the two writings agree. The Wave Q form `ℏ / √(m k_B T)`,
  with `ℏ` in the numerator and no `√(2π)`, fails, as does
  `ℏ / √(2 m k_B T)`. It covers that derivation step of `be-12`, not
  Caldeira–Leggett dephasing.
- `PhysJS.Josephson.frequency_eq`, a complete proof that
  `f = (2e/h) V`, `K_J = 2e/h`, and `f = K_J V`. Clearing the denominator
  recovers `2e`. The factor `2` is the Cooper-pair charge, taken as a
  premise. Replacing it by `e` fails. It covers that derivation step of
  `be-59`, not the tunneling Hamiltonian.
- `PhysJS.QuantumHall.reciprocal`, a complete proof that
  `σ_xy = C e² / h`, `R_H = h / (C e²)`, and `R_K = h / e²` satisfy
  `σ_xy R_H = 1` and `R_H = R_K / C` for a nonzero integer `C`. The
  shifted index `C + 1` is a different conductance. Replacing `e²` by `e`
  makes the product fail to be `1` when `e ≠ 1`. It covers that
  derivation step of `be-55`, not the TKNN theorem.
- `PhysJS.Laughlin.fraction`, a complete proof that at `ν = 1/3`,
  `σ_xy = ν e² / h` and `R_xy = 3 h / e² = 3 R_K`, using the BE-55
  reciprocal. At `ν = 1` the formula is the integer plateau `C = 1`.
  `R_K / 3` is that lemma at `C = 3`, the fraction inverted, and it
  fails. It covers that derivation step of `be-60`, not the Laughlin
  wavefunction and not the anyon charge `e/3`.
- `PhysJS.Kss.saturating`, a complete proof that the encoded saturating
  value `η/s = ℏ / (4 π k_B)` is the equality `4 π k_B (η/s) = ℏ` for
  `k_B ≠ 0`. The Hawking factor `8π` in place of `4π` is twice `ℏ`, not
  `ℏ`, once `ℏ ≠ 0`. It covers that derivation step of `be-21`, not the
  inequality `η/s ≥ ℏ / (4 π k_B)`.
- `PhysJS.PlanckArea.area_law`, a complete proof that
  `k_B c³ A / (4 G ℏ) = k_B A / (4 ℓ_P²)` for `ℓ_P² = ℏ G / c³`. The
  area is an input. BE-43 is that equality on a wormhole area, not a
  second lemma. `ℓ_P² = ℏ G / c²` fails when `c ≠ 1`, and the factor `2`
  in place of `4` fails. It covers that derivation step of `be-14` and
  `be-43`, not a minimal surface and not ER=EPR.
- `PhysJS.Shapiro.radial_integral`, a complete proof that
  `∫_{R_near}^{R_far} (2 G M / c³) (dr / r) = (2 G M / c³) ln(R_far / R_near)`
  for `0 < R_near < R_far` and `c ≠ 0`. The factor `1` in place of `2` is
  half that delay, once `G ≠ 0` and `M ≠ 0`. `log₁₀` of the radius ratio
  is not `ln`. It covers that derivation step of `be-37`, not the
  impact-parameter formula and not the Cassini measurement.
- `PhysJS.RandallSundrum.positive_tension`, a complete proof that for
  `σ > 0`, `ρ > 0`, and `G > 0`,
  `H²_RS − H²_FRW = (8πG/3) ρ² / (2σ) > 0`. The correction `1 + ρ/σ`
  fails, and `σ < 0` lies below the Friedmann value. The nested
  `flat_friedmann` theorem is the `c²` dictionary onto Physlib's
  `FirstOrderFriedmann` at `k = 0`. Dropping `c²` fails when `c² ≠ 1`
  and `Λ ≠ 0`. The limit `σ → ∞` is already the `be-19` reference. It
  covers that derivation step of `be-54`, not a derivation from the
  five-dimensional Einstein equation.
- `PhysJS.EinsteinCartan.inversion`, a complete proof that if
  `κ = 8πG/c⁴ ≠ 0` and every component satisfies `T = κ S`, then
  `S·S = T·T / κ² = (c⁴/(8πG))² T·T`. `κ²` in the numerator is the
  inversion run backwards, and it fails when `T·T ≠ 0` and `κ⁴ ≠ 1`.
  It covers that derivation step of `be-17`, not the Einstein–Cartan
  field equation and not a Newtonian limit.
- `PhysJS.EffectiveTemperature.sum_eq`, a complete proof that for
  `T ≠ 0` and `k_B ≠ 0`, the encoded product
  `T (1 + Σ_active / (k_B T))` equals `T + Σ_active / k_B`, and that
  sum equals `T` if and only if `Σ_active = 0`. The product
  `T · Σ_active / (k_B T)`, with the `1` omitted, fails. It covers that
  derivation step of `be-27`, not the frequency-dependent
  Cugliandolo–Kurchan `T_eff(ω)`.
- `PhysJS.ToricCode.toric`, a complete proof that four anyons of
  quantum dimension `1` have total quantum dimension `D = √4 = 2` and
  topological term `γ = ln 2` in nats. The encoded decomposition is
  `S = α L − γ`, with the `O(L⁻¹)` term dropped. `log₂ 2 = 1` is the
  bit convention, not nats, and `D = √2` is one anyon pair, not the
  toric code. It covers that derivation step of `be-22`, not the
  Kitaev–Preskill theorem and not a quantum-gravity boundary.
- `PhysJS.Einstein.friedmann_corollary`, a complete proof that the
  vacuum density `ρ = c² Λ / (8π G)` gives `(8πG/3) ρ = Λ c² / 3`, the
  cosmological term of `FirstOrderFriedmann`. A fluid of that density
  added to matter, with the explicit `Λ` set to zero, is that equation
  at `k = 0`. The Einstein-static density `Λ c² / (4π G)` is twice that
  term, and dropping `c²` fails when `c² ≠ 1`. The density is
  `vacuum_density` and is not reproved. It   covers that corollary of
  `be-20`. There is no `be-20` reference.
- `PhysJS.Coarsening.exponent_iff`, a complete proof that for
  `Γ = L₀² / t₀ > 0`, `t > 0`, `t ≠ t₀`, and `z > 0`, the scaling
  `L(t) = L₀ (t / t₀)^{1/z}` obeys `L(t)² = Γ t` if and only if
  `z = 2`. At `t = t₀` the ratio holds for every `z`. Model B's
  `z = 3` gives `L³ ∝ t` and fails `L² = Γ t`. It covers that
  derivation step of `be-15`, not the Model A Langevin equation. The
  Langevin kinetic coefficient is a different `Γ`.
- `PhysJS.QuantumCritical.xi_product`, a complete proof that for
  `T > 0` and `T₀ > 0`, the encoded scaling
  `ξ(T) = ξ₀ (T / T₀)^{−1/z}` gives `ξ T = ξ₀ T₀` at `z = 1`. The
  retired exponent `−ν/z` fails `−1/z` at `z = 1` when `ν ≠ 1`. The
  old pin `−0.71 = −71/100` is that failure. At `T = T₀` every exponent
  agrees, so the comparison assumes `T ≠ T₀`. It covers that derivation
  step of `be-33`, not Hertz–Millis theory and not a universality class.
- `PhysJS.TimeSymmetric.residual_iff`, a complete proof that when
  `A_ret + A_adv ≠ 0`, the residual
  `(A_ret − A_adv) / (A_ret + A_adv)` is `0` if and only if
  `A_ret = A_adv`. The encoded field is the half-sum
  `(A_ret + A_adv) / 2`, and twice that field is the residual's
  denominator. A fully retarded field, `A_adv = 0` with `A_ret ≠ 0`,
  gives residual `1`, not `0`. The id is contested, and this lemma
  does not decide the contest. It covers that derivation step of
  `be-50`, not the absorber boundary condition as a theory of
  radiation reaction.
- `PhysJS.BornOverlap.modulus_sq`, a complete proof that
  `|c + s i|² = c² + s²`, which is `Complex.normSq` of one matrix
  element. A sum of squares above `1` is not a probability in
  `[0, 1]`, the module's rejection of `c² + s² > 1`. The difference
  `c² − s²` is not that square when `s ≠ 0`. It covers that derivation
  step of `be-32`, not the Giacomini–Castro-Ruiz–Brukner
  transformation and not a Haar integral. The catalog records this id
  as not-a-bridge, and this lemma does not decide that.
- `PhysJS.EntropyProduction.nonneg`, a complete proof that
  `σ = Σ_i J_i X_i` is the definition of `σ`, and that if every
  product is `≥ 0` then `σ ≥ 0`. One flipped sign, with the other
  products zero and the flipped product strictly positive, is not
  `σ`, and that flipped sum is negative. It covers that derivation
  step of `be-28`, not the variational maximum-entropy-production
  principle. The catalog records this id as not-a-bridge, and this
  lemma does not decide that.
- `PhysJS.CompositeHiggs.scale_free`, a complete proof that for
  `f ≠ 0` and `θ = h/f`, `V(h) / f⁴ = −α sin²θ + β [sin⁴θ − sin²θ
  cos²θ]`. Both terms carry `f⁴`, so the ratio depends on `h` only
  through `θ`. The pre-correction first term `−α f² sin²θ`, divided
  by `f⁴`, is `−α sin²θ / f²`. It depends on `f`, and it agrees with
  `−α sin²θ` only when `f² = 1`. It covers that derivation step of
  `be-40`, not SILH matching onto a confining theory. The catalog
  records this id as not-a-bridge, and this lemma does not decide
  that.
- `PhysJS.Crossing.antisymmetry`, a complete proof that for a real
  function `g`, `g(u,v) − g(v,u) = −(g(v,u) − g(u,v))`. The swap is
  the negation of a difference. The residual is `0` for every `g`
  when `u = v`, including `u = v = 1/4`, so that point is not a
  control. A block that is not symmetric does not vanish at
  `u = 1/2`, `v = 1/4`. It covers that derivation step of `be-35`,
  not the infinite sum over `(Δ, ℓ)` and not positivity or unitarity.
  The catalog records this id as not-a-bridge, and this lemma does
  not decide that.
- `PhysJS.Chandrasekhar.prefactor`, a complete proof that with
  `n = ρ/(μ_e m_u)`, `p_F = ℏ (3π² n)^{1/3}`, and
  `P = (1/4) n p_F c`, the pressure is `K_ρ ρ^{4/3}`, and for the
  `n = 3` Lane–Emden scale the central density cancels, leaving
  `M = (ω₃⁰ √(3π)/2) (ℏ c/G)^{3/2} (μ_e m_u)^{−2}`. `ω₃⁰` stays
  symbolic; the decimal `2.01824` is not in the theorem. With
  `ℏ = c = μ_e = m_u = 1` both routes give the same `K`.
  `√π/2` in place of `√(3π)/2` fails when `ω₃⁰ ≠ 0`, and dropping
  `ω₃⁰` fails when `ω₃⁰ ≠ 1`. It covers that derivation step of
  `be-63`, not stellar rotation or magnetic support.
- `PhysJS.Entanglement.first_variation`, a complete proof that for a
  smooth curve of full-rank density matrices that stay diagonal in a
  fixed basis and have trace `1`, `d/dt S(ρ(t)) = −⟪ρ̇(t), log ρ(t)⟫`,
  the trace inner product. The modular Hamiltonian `K = −log ρ` is
  frozen at the base point, and that derivative equals `d/dt ⟨K⟩`.
  A finite jump from `diag(1/2, 1/2)` to `diag(3/4, 1/4)` leaves
  `⟨K⟩` unchanged and changes `S`. It covers that derivation step of
  `be-30`, not the holographic first law that identifies `K` with an
  area variation.

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
