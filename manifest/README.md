# Manifest

`bridges.json` is the file UPT consumes. One entry is one manifest key. It stores theorem names, not source paths.

`lean-files.json` is the proof-file listing UPT vendors as `formal/physjs/lean-files.json`. Each entry is a repository path `lean/<File>.lean`. The aggregator `lean.lean` is not an entry. A path `lean/PhysJS/<File>.lean` is not an entry.

| Field | Meaning |
|---|---|
| `key`, `bridgeId` | The UPT bridge id. A `formalRef` names this key. |
| `theorem` | The Lean name the key resolves to. |
| `covers` | What that theorem certifies. It does not certify the rest of the bridge. |
| `coverage` | `covers its statement only`. A partial proof is marked the same way. |
| `leanProof` | `complete` when the Lean proof of that statement has no `sorry`. `partial` when it does not. |
| `axioms` | The axioms `#print axioms` reported for the theorem. |
| `imports` | Present when the proof is an import of a Physlib theorem rather than a new argument. |
| `planeWave` | Present on a rank-1 entry that also has a rank-1a theorem. Same inner fields as an entry, without a second key. |

The five rank-1 keys cover `bound.delta` at the dispersion relation. That top-level `theorem` is the reviewed reference. `ab-pendulum-linear` covers the transformation and imports Physlib.

Rank 1a proves a different statement about the same five bridges: a plane wave solves the PDE iff `ω(k)` obeys the dispersion relation. Each of those entries keeps its reviewed theorem and records the new one under `planeWave`. A second top-level key would not equal the bridge id, and replacing `theorem` would change the covers line the reviewed reference already names. UPT still has one `formalRef` per bridge id. Pointing that reference at `planeWave.theorem` is a UPT change; this file does not make it.

Forty-nine keys are checked UPT `formalRef`s. Ten atlas keys are kind `bridge`. Sixteen catalog keys are counted (`reduction`, `limit`, or `derivation-step`) and do not light `formally-proved`: `be-64`, `be-53`, `be-58`, `be-38`, `be-13`, `be-34`, `be-65`, `be-51`, `be-61`, `be-14`, `be-17`, `be-22`, `be-15`, `be-32`, `be-35`, and `be-30`. Seventeen catalog keys are kind `bridge` while the covers line still begins with `derivation-step`: `be-12`, `be-16`, `be-21`, `be-27`, `be-33`, `be-37`, `be-40`, `be-43`, `be-50`, `be-54`, `be-55`, `be-59`, `be-60`, `be-63`, `be-66`, `be-67`, and `be-68`. Kind `cross-check` is `be-19`, `be-24`, and `be-42`. Kind `property` is `be-11`, `be-29`, and `be-28`. The `be-28` covers line still begins with `derivation-step`. Nested objects are not second references. `be-20` has no key.

Five further keys, `be-69` through `be-73`, are the candidates in the 2026-10-03 applied-physicist dogfood report. They are not catalog entries yet. UPT vendors this manifest and adds the catalog entries and `formalRef`s. The intended kind is `bridge`, because each theorem states the relation. Each covers line still begins with `derivation-step`.

Three further keys, `be-74` through `be-76`, are the candidates in the 2026-10-04 applied-physicist dogfood report (r3). The UPT catalog on `master` runs through `73`, so these numbers are free. They are not catalog entries yet. UPT vendors this manifest and adds the catalog entries and `formalRef`s. The intended kind is `bridge`. Each covers line still begins with `derivation-step`. The Lean files are `lean/MagneticPressure.lean`, `lean/LondonPenetration.lean`, and `lean/PlasmaBeta.lean`.

`ab-kg-oscillator` covers the uniform-mode restriction in Physlib's own terms.

`ab-spring-lc` and `ab-damped-rlc` cover the oscillator dictionary: time rescaling between Physlib oscillators, with the circuit names read off the parameters.

`ab-wave-dalembert` covers the missing direction of d'Alembert's formula: a jointly `C²` solution of Physlib's one-dimensional `WaveEquation`, at nonzero speed, is a sum of two profiles.

`be-64` covers the derivation step that cancels `r²` in the Eddington force balance. It does not certify a hard cap. The key is the catalog id.

`be-53` covers the sign of the one-loop coefficient: for SU(3), `b₀ > 0` if and only if `N_f ≤ 16`. The closed form of the running is the nested `oneLoop` object. The formalRef names the sign theorem only. The row is recorded when both are present. Each covers line claims its own part.

`be-58` covers the low-frequency limit of the quantum Johnson–Nyquist parent. The `+ 1` denominator is the negative control. It does not derive the fluctuation–dissipation theorem.

`be-38` covers the Newtonian and deep-MOND limits of `ν(z)`. The mass stays in the deep-MOND force scale. The claim `ν √z → √2` is the negative control. The inversion of `μ(x) = x / √(1 + x²)` is the nested `inversion` object. The formalRef names the limit theorem only. The row is recorded when both are present. Each covers line claims its own part. The SPARC confrontation is not this row.

`be-13` covers the four-dimensional contraction of the Einstein equation, `R = 4Λ − κ T`. The contraction does not choose a signature. Under `−,+,+,+`, dust with `u_μ u^μ = −c²` has trace `−ρ c²`. The BE-20 density is the nested `vacuum` object. The Friedmann corollary is the nested `corollary` object: `(8πG/3) ρ = Λ c² / 3`, and a fluid of that density added to matter, with the explicit `Λ` set to zero, is `FirstOrderFriedmann` at `k = 0`. The Einstein-static density `Λ c² / (4π G)` is twice that term. Dropping `c²` fails when `c² ≠ 1`. The density is not reproved. The formalRef names the contraction only. The opposite sign for the vacuum tensor is the negative control of the density. This does not certify Jacobson's thermodynamic derivation. BE-20 does not get its own reference.

`be-34` covers the Kibble–Zurek freeze-out power. `ε̂` is the unique positive solution of `τ₀ ε^{−zν} = ε τ_Q`, and the defect power is `ξ₀^{−d} (τ_Q/τ₀)^{−dν/(1+zν)}`. The exponent with the `1` omitted is the negative control. The Boltzmann factor and the missing `1/a^d` prefactor are not this row.

`be-42` is a cross-check `formalRef` on `PhysJS.HawkingUnruh.dictionary`. The covers line names BE-57 and the edge `be-42-via-rs`. `T_H` at the Schwarzschild radius equals `T_H(M)`, and the Unruh temperature at `c⁴/(4GM)` equals `T_H(M)`. `T_U(c⁴/(2GM))` is the negative control. It does not certify the Hawking effect.

`be-24` is a cross-check `formalRef` on `PhysJS.Fret.dictionary`. The efficiency has the three readings `R₀⁶/(R₀⁶+R⁶)`, `1/(1+(R/R₀)⁶)`, and `k_FRET/(k_FRET+1/τ_D)`, and it decreases on `(0, ∞)`. `η(R₀, R₀) = 1/2` holds for any positive power, so it is not the control. At `R = 2 R₀` the exponent 4 is not the exponent 6. The dipole–dipole law is a premise.

`be-19` is a cross-check `formalRef` on `PhysJS.QuantumBounce.dictionary`. The covers line names BE-54. `H²_LQC` equals `H²_RS` at `σ = −ρ_c/2`. As `ρ_c → ∞` and as `σ → ∞`, both tend to `(8πG/3)ρ + Λ/3`. At `ρ = ρ_c` and `Λ = 0`, `H²_LQC = 0`. `σ = +ρ_c/2` is the negative control. `σ < 0` is not a physical Randall–Sundrum brane.

`be-66` is kind `bridge` on `PhysJS.RadiationPressure.pressure_eq`. The covers line still begins with `derivation-step`. It covers `P_n = (I/c)(1+R) cos²θ` from foreshortening, normal momentum per energy `(cos θ)/c`, and an opaque split that deposits the absorbed fraction once and the reflected fraction twice. `absorber_endpoint` and `reflector_endpoint` are `I/c` and `2I/c`. `pressure_monomial` is `P = C I/c` with `C = f(1, 1)` unfixed. `coefficient_unfixed` separates any other factor from `1`. `reflector_not_absorber` separates the reflector value from the absorber value. `oblique_endpoints` rejects a single cosine when `cos θ` is neither `0` nor `1`. The Maxwell stress tensor and the Eddington luminosity are not this row.

`be-67` is kind `bridge` on `PhysJS.AlfvenSpeed.speed_eq`. The covers line still begins with `derivation-step`. A transverse monochromatic wave along a uniform field satisfies `∂b/∂t = B ∂v/∂z` and `ρ ∂v/∂t = (B/μ0) ∂b/∂z`, and for `B > 0`, `μ0 > 0`, `ρ > 0`, and `k ≠ 0` the phase speed is `|ω/k| = B/√(μ0 ρ)`. `solves_wave_equation` is that wave on `∂²v/∂t² = (B²/(μ0 ρ)) ∂²v/∂z²`. `ρ` is the density in the momentum premise, read as the total mass density. `proton_only_not_total` separates `n m_p + n m_e` from `n m_p`. `proton_only_differs` separates the speeds at `ρ` and `r ρ` when `r ≠ 1`. `coefficient_not_fixed` separates `C ≠ 1` from the catalog speed. `gaussian_dictionary` is the conversion through gauss, grams per cubic centimetre, and centimetres per second back to the stand-in `4π×10^{-7}`. `gaussian_needs_dictionary` inserts tesla and the SI density into `B/√(4πρ)`. That stand-in is not a measured `μ0`. A kinetic dispersion relation is not this row. Dimensional homogeneity of `{v, B, μ0, ρ}` is not formalized in the file.

`be-68` is kind `bridge` on `PhysJS.TolmanEhrenfest.hydrostatic_constant`. The covers line still begins with `derivation-step`. On a static interval, hydrostatic balance `dp = -(ρ+p) d ln √(-g_00)` and the equilibrium Gibbs relation `dp = (ρ+p) d ln T`, with `ρ+p ≠ 0`, give `T √(-g_00)` equal at the endpoints. `redshift_equilibrium` is the same product from `ν √(-g_00) = 1/Δt` and equal `T/ν`. `signature_translation` is `T √g_44 = T √(-g_00)` when `g_44 = -g_00`. `mostly_plus_needs_the_minus` is `Real.sqrt g_00 = 0` for `g_00 < 0`. `units_do_not_entail` separates `d ln T = 0` from `g dr/c²`. A horizon temperature, `PhysJS.HawkingUnruh.dictionary`, and `T ‖ξ‖ = const` are not this row. The hydrostatic equation is not derived from `∇_μ T^{μν} = 0`, and the Gibbs relation is not derived from an equation of state.

`be-69` is the perpendicular fast magnetosonic speed, on `PhysJS.FastMagnetosonic.speed_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. A compressional monochromatic wave perpendicular to a uniform field satisfies `∂b/∂t = −B ∂v/∂x`, `∂δρ/∂t = −ρ ∂v/∂x`, `δp = c_s² δρ`, and `ρ ∂v/∂t = −∂δp/∂x − (B/μ0) ∂b/∂x`. For `μ0 > 0`, `ρ > 0`, and `k ≠ 0`, the phase speed is `√(c_s² + B²/(μ0 ρ))`. `solves_wave_equation` puts that velocity on the wave equation at the same speed squared. `phaseSpeed_quadrature` is `√(c_s² + v_A²)` with `v_A = B/√(μ0 ρ)`. `gamma_closure` reads `c_s² = γ p / ρ`. The nested `perpendicularQuartic` object is `perpendicular_of_dispersion`: the textbook quartic at `k_∥ = 0` has roots `ω² = 0` and `ω² = (c_s² + v_A²) k²`. The quartic is a hypothesis. `zero_frequency_not_compressional` says the zero root does not solve compressional induction. `not_sound_speed`, `not_alfven_speed`, and `not_linear_sum` separate the quadrature from `c_s`, from `v_A`, and from `c_s + v_A`. `reduces_to_alfven` is the gas-free value `B/√(μ0 ρ)`, which is not the shear wave of `be-67`. `coefficient_not_fixed` separates `C ≠ 1` from the catalog speed. A kinetic dispersion and the oblique fast mode are not this row. The reference names `speed_eq` only.

`be-70` is the electrical Einstein relation, on `PhysJS.EinsteinRelation.diffusion_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. For `n = n_ref exp(−q V/(k_B T))` with `n_ref > 0`, a nonzero field `E = −dV/dx` at which `μ n E = D dn/dx` gives `D = μ k_B T / q`. `force_mobility_form` is `D = μ_force k_B T` when `μ_force = μ/q`. `charge_factor_needed` drops `q`. `fermi_not_classical` is `μ E_F / q`. `not_stokes` is `k_B T / (6 π η a)` unless `μ/q` is that denominator. `coefficient_not_fixed` separates `C ≠ 1`. A master equation and a Fermi liquid are not this row.

`be-71` is the Clapeyron slope, on `PhysJS.Clapeyron.slope_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. Along coexistence, `g1 = g2`, and each phase contributes `dg = −s dT + v dP`. `entropy_slope` is `dP/dT = Δs/Δv`. `slope_eq` uses `L = T Δs` and gives `dP/dT = L/(T Δv)`. `latent_matches_entropy` is the equality of those two writings. `temperature_factor_needed` drops `T`. `liquid_volume_needed` replaces `Δv` by the gas volume. `coefficient_not_fixed` separates `C ≠ 1`. The ideal-gas vapor-pressure integral is not this row. The Gibbs differential is not derived from a Legendre transform.

`be-72` is the static gravitational frequency shift, on `PhysJS.GravitationalRedshift.frequency_ratio`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. Two static observers of one coordinate period, with `ν √(−g_00) = 1/Δt` and `g_00 < 0`, have `ν1/ν2 = √(−g2)/√(−g1) = √(g2/g1)`. The nested `tolmanRatio` object is `tolman_same_ratio`: if the Tolman products agree as well, then `T1/T2 = ν1/ν2`. `frequency_not_tolman` keeps the frequency ratio `2` on `g_00 = −1` and `g_00 = −4` while equal temperatures are not a Tolman equilibrium. `weak_field_not_exact` is `g_00 = −(1 + 2Φ/c²)` at `c = 1`, `Φ = 0` and `Φ = 4`: the exact ratio is neither `(Φ2−Φ1)/c²` nor `1 + (Φ2−Φ1)/c²`. `units_do_not_entail` separates `z = 0` from `Φ/c²`. `PhysJS.TolmanEhrenfest.hydrostatic_constant`, a horizon temperature, and `PhysJS.HawkingUnruh.dictionary` are not this row. The reference names `frequency_ratio` only.

`be-73` is the Kelvin relation, on `PhysJS.KelvinRelation.peltier_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. The linear fluxes are `J_e = L11 E/T + L12 (−∇T)/T²` and `J_q = L21 E/T + L22 (−∇T)/T²`. `open_circuit_seebeck` reads `S` from `J_e = 0`. `isothermal_peltier` reads `Π` from `∇T = 0`. `ThermoelectricOnsager.onsager` is `L12 = L21`, a structure field, and it gives `Π = S T`. `onsager_needed` drops that field and the coefficients disagree. The first Thomson relation and a measured thermopower are not this row.

`be-74` is the isotropic magnetic pressure, on `PhysJS.MagneticPressure.pressure_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. A linear inductor with `dU/dI = L I` and `U(0) = 0` stores `U = (L/2) I²`. A long solenoid with `B = μ0 n I` and `Λ = (n ℓ) B A` has `L = μ0 n² V`. At fixed current the battery supplies `I ΔΛ`, the stored energy rises by half of that, and the mechanical work `p ΔV` is the difference, so `p = B²/(2 μ0)`. `pressure_monomial` is `p = C B²/μ0` with `C` unfixed. `full_monomial_not_pressure` is the prefactor `1`. `battery_not_mechanical` keeps `I² ΔL`. A kinetic pressure and a Lagrangian derivation of the Maxwell stress tensor are not this row. The reference names `pressure_eq` only.

`be-75` is the London penetration depth, on `PhysJS.LondonPenetration.depth_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `e` is the elementary charge. On `B = B0 exp(−x/λ)`, Ampere's law `j = −(1/μ0) dB/dx` and `dj/dx = −(n e²/m) B` give `λ = √(m/(μ0 n e²))`. `not_unique_monomial` is the pair of length monomials `√(m/(μ0 n e²))` and `μ0 e²/m`. `kernel_length_not_depth` separates them when `n (μ0 e²/m)³ ≠ 1`. `growing_not_screened` is `exp(+x/λ)`. `pair_charge_not_depth` replaces `e` by `2e` at the same `n` and `m`. `charge_squared_needed` drops the square. `coefficient_not_fixed` separates `C ≠ 1`. The classical skin depth is not this row. The reference names `depth_eq` only.

`be-76` is the plasma beta, on `PhysJS.PlasmaBeta.beta_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `β = p_gas / p_B` with `p_B` from `PhysJS.MagneticPressure.pressure_eq`, so `β = p_gas / (B²/(2 μ0))`. The closure `p_gas = n k_B T` gives `β = 2 μ0 n k_B T / B²`. `half_pressure_not_beta` uses `B²/μ0`. `units_do_not_entail` separates the constant `1` from the ratio. `gas_law_needed` drops `n k_B T`. `coefficient_not_fixed` separates `C ≠ 1`. A plasma-β inequality is not this row. The reference names `beta_eq` only.

`be-77` is Hagen–Poiseuille flow, on `PhysJS.HagenPoiseuille.flow_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. The axial balance, a zero centerline slope, and no-slip integrate to `Q = π R⁴ ΔP/(8 μ L)`, and the Darcy definitions on that profile give `f_D Re = 64`. `fanning_not_darcy` is `16`. `coefficient_not_fixed` separates any factor from `8`. A square duct is not this row.

`be-78` is Euler buckling, on `PhysJS.EulerBuckling.critical_load`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. Pinned ends select `P_cr = π² E I/L²`, and every nontrivial pinned solution is at least that load. `cantilever_load` is `π² E I/(4 L²)`. `cantilever_not_pinned` separates the two. Units do not choose `π²`.

`be-79` is parallel-plate pull-in, on `PhysJS.PullIn.pull_in_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `capacitance_slope` is `dC/dg = −ε0 A/g²`. The fold of `(g0 − g) g²` is `g = 2 g0/3`, and both writings of `V_pi²` are the equilibrium voltage there. `half_gap_not_fold` is `g0/2`. A fringing field is not this row.

`be-80` is the Mott–Gurney law, on `PhysJS.MottGurney.current_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. Drift times Poisson is `E dE/dx = J/(ε μ)`. `E(0) = 0` and the nonnegative root integrate to `J = (9/8) ε μ V²/d³`. `coefficient_not_fixed` separates any factor from `9/8`. Child–Langmuir is not this row.

`be-81` is the Child–Langmuir law, on `PhysJS.ChildLangmuir.current_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `e` is the elementary charge. `power_counting` forces the exponent `4/3`. The profile `V (x/d)^{4/3}` has cathode field zero, and `J = ε0 φ'' v` equals `(4 ε0/9) sqrt(2 e/m) V^{3/2}/d²` for `x > 0`. `mott_power_not_vacuum` rejects `3/2`. Poisson is not claimed at the cathode. Mott–Gurney is not this row.

`be-82` is the Shockley ideal diode, on `PhysJS.ShockleyDiode.shockley_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. The Boltzmann factor, ideality 1, and detailed balance at zero bias give `I = I_s (exp(e V/(k_B T)) − 1)`. `zero_bias` is the equilibrium point. `ideality_not_two` is a generation-recombination exponent. A diffusion-length ODE is not this row.

`be-83` is the first Thomson relation, on `PhysJS.Thomson.thomson_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `Π(t) = S(t) t` is the Kelvin relation as a function of temperature, and `μ = dΠ/dT − S` differentiates to `μ = T dS/dT`. `slope_not_thomson` keeps `dΠ/dT`. This is not `be-73`.

`be-84` is collinear four-point sheet resistance, on `PhysJS.FourPoint.sheet_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. The radial integral of `(I R_s)/(2 π r)` on probes at `0`, `s`, `2 s`, and `3 s` is `R_s = (π/ln 2)(V/I)`. `unequal_not_equal` moves the sink to `4 s` and gets `2 π/ln 3`. `PhysJS.Crossing` is not this row.

`be-85` is full shot noise, on `PhysJS.ShotNoise.shot_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `e` is the elementary charge. A Poisson count in a window of length `T`, with one-sided bandwidth `Δf = 1/(2 T)`, has `S_I = 2 e I`. `two_sided_not_schottky` uses `Δf = 1/T`. This is not a Fourier theorem and not Johnson–Nyquist.

`be-86` is the Reynolds analogy at Prandtl number 1, on `PhysJS.ReynoldsAnalogy.reynolds_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. Equal normalized wall gradients give `St Pr = C_f/2`. `Pr = 1` drops the Prandtl factor. `prandtl_needed` keeps `Pr ≠ 1`. A Nusselt correlation is not this row.

`be-87` is capacitor equilibrium noise, on `PhysJS.CapacitorNoise.noise_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `dU/dV = C V` integrates to `(C/2) V²`, and the Boltzmann weight of that energy is the Gaussian of variance `k_B T/C`. `three_halves_not_quadratic` is the kinetic `(3/2) k_B T`. `half_needed` drops the energy half. Three kinetic degrees of freedom are not this row.

`be-88` is the parabolic Fermi sea, on `PhysJS.FermiSea.fermi_sea`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. Two spins times the sphere give `k_F = (3 π² n)^{1/3}`. The isotropic parabola gives `E_F` and, by differentiation, `v_F` and `1/m*`. `one_spin_not_two` is `k_F³ = 6 π² n`. A lattice potential is not this row.

`be-89` is the Debye cutoff, on `PhysJS.DebyeCutoff.debye_cutoff`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. Three branches equal to `3n` give `ω_D = v_s (6 π² n)^{1/3}`. `atom_count_not_mode_count` equates that sum to `n` and gets `k_D³ = 2 π² n`.

`be-90` is the Debye `T³` law, on `PhysJS.DebyeHeat.debye_heat`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `I = π⁴/15` is a hypothesis. The energy `U = 9 N k_B T (T/θ_D)³ I` is `A T⁴`, and `dU/dT` supplies the `4` that turns `3 π⁴/5` into `12 π⁴/5`. `energy_not_heat` keeps the energy prefactor. This row does not evaluate the Bose integral.

`be-91` is the Einstein solid, on `PhysJS.EinsteinSolid.einstein_heat`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. Differentiating three Planck oscillators gives the Einstein heat capacity. `dulong_petit` is the limit `3 N k_B`. `one_oscillator_not_three` tends to `N k_B`. `zero_point_drops` is the constant `k_B θ_E/2`.

`be-92` is the Sommerfeld electronic heat capacity, on `PhysJS.SommerfeldHeat.electronic_heat`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. The energy correction `(π²/6) (k_B T)² g(E_F)` is a hypothesis. Its temperature derivative and `g(E_F) = (3/2) n/E_F` give `c_V = (π²/2) n k_B² T/E_F`. `flat_not_parabolic` leaves `π²/3`. This is not `be-61` and not the Wiedemann–Franz law.

`be-93` is the Curie–Weiss law, on `PhysJS.CurieWeiss.curie_weiss`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `⟨S_z²⟩ = S(S+1)/3` and `B_eff = B + λ M` give `χ = C/(T−θ)` with `C = μ₀ n g² μ_B² S(S+1)/(3 k_B)`. `spin_half_moment` is the equal mixture of `m = ±1/2`. `curie_not_weiss` is `θ = 0`. The second moment is a hypothesis.

`be-94` is Pauli paramagnetism, on `PhysJS.PauliParamagnetism.pauli`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `M = μ_B² g(E_F) B` and the parabolic density give `χ_P = μ₀ μ_B² (3 n)/(2 E_F)`. `flat_not_sqrt` drops the `3/2`. Landau diamagnetism is not this row.

`be-95` is the Ginzburg–Landau type boundary, on `PhysJS.GinzburgLandau.type_boundary`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `density_squares` is the Bogomolnyi identity at `κ² = 1/2`. `wall_integral_zero` integrates it. The sign theorem is for a trial wall whose critical integral vanishes: negative for `κ > 1/√2`, zero on the boundary, positive for `κ < 1/√2`. The positive side is this trial, not every minimizer.

`be-96` is the upper critical field, on `PhysJS.UpperCritical.critical_field`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. The Landau-level ground energy of charge `2e` is a hypothesis. With `Φ₀ = h/(2e)` and `h = 2 π ℏ`, the instability is `B_c2 = Φ₀/(2 π ξ²)`. `single_charge_not_pair` uses charge `e`.

`be-97` is the Ambegaokar–Baratoff product at zero temperature, on `PhysJS.AmbegaokarBaratoff.ambegaokar_baratoff`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `integrand_matches_sech` is the substitution `E = Δ cosh t`. `tendsto_integral_sech` is `π/2`. The tunnel Hamiltonian is the hypothesis that `e I_c R_n` equals `Δ` times that limit. `coefficient_not_fixed` is any other factor. The finite-temperature `tanh` is not this row.

`be-98` is the BCS specific-heat jump, on `PhysJS.BcsJump.heat_jump`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. The weak-coupling free energy is a hypothesis, and `ζ` is its quartic coefficient. The both-spin Sommerfeld value `C_n = (2 π²/3) N(0) T_c` is a hypothesis. The ratio is `12/(7 ζ)`. `both_spins_needed` drops one spin. This is not `2π exp(−γ)`, and `ζ` is not evaluated as a series.

`be-99` is the law of mass action, on `PhysJS.MassAction.mass_action`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. Boltzmann tails cancel `μ` and give `n p = n_i²` with `n_i = √(N_c N_v) exp(−E_g/(2 k_B T))`. `half_gap_needed` drops the `2`. A Fermi–Dirac integral is not this row.

`be-100` is the Lyddane–Sachs–Teller relation, on `PhysJS.LyddaneSachsTeller.lst`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. An undamped zero of `ε(ω) = ε(∞) + S/(ω_TO² − ω²)` gives `ω_LO²/ω_TO² = ε(0)/ε(∞)`. `squares_needed` is the unsquared ratio. A damped pole is not this row.

`be-101` is the BKT jump, on `PhysJS.BktJump.bkt_jump`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `vortex_energy` integrates a `θ = φ` vortex to `π J ln(R/a)`. Area entropy `k_B ln((R/a)²)` makes `F = 0` only at `k_B T = π J/2`. `length_not_area` counts the circumference and gets `π J`. This is the vortex heuristic, not the renormalization-group flow.

`be-102` is the Landauer conductance, on `PhysJS.LandauerConductance.conductance_eq`. It is not a catalog entry yet. The intended kind is `bridge`. The covers line still begins with `derivation-step`. `channel_rate` cancels `L` and `v` to `1/h`. Spin `2` and `Δμ = e V` give `G = (2 e²/h) Σ T_n`. `spin_resolved_not_two` is one spin. The Hall conductance and Landauer erasure are not this row.

`be-103` through `be-125` are the candidates in the 2026-10-04 plasma and space dogfood report. The UPT catalog on `master` runs through `102`, so these numbers are free. They are not catalog entries yet. The intended kind is `bridge`. Each covers line still begins with `derivation-step`. None restates `be-67`, `be-69`, `be-74`, or `be-76`.

`be-103` is the cold Bohm sheath, on `PhysJS.BohmSheath.cold_bohm_threshold`. Cold ions and Boltzmann electrons require `u0² ≥ k_B T_e/m_i`. The nested `warmSound` object is `warm_sound_eq`: `γ_i = 3` from `p ∝ n³` gives `c_s² = (k_B T_e + 3 k_B T_i)/m_i`. `γ_i = 5/3` is not that closure. A kinetic sheath is not this row. The reference names `cold_bohm_threshold` only.

`be-104` is the cold ion-acoustic dispersion, on `PhysJS.IonAcoustic.dispersion_eq`. Continuity, ion momentum, and Poisson with Boltzmann electrons give `ω² = k² c_s²/(1 + k² λ_De²)`, with `c_s² = k_B T_e/m_i` and `λ_De² = ε0 k_B T_e/(n0 e²)`. A kinetic dispersion is not this row.

`be-105` is the upper hybrid, on `PhysJS.UpperHybrid.upper_hybrid_eq`. Cold electrons, `B` along `z`, and the perpendicular ansatz give `ω² = n e²/(ε0 m) + (e B/m)²`. This is not `ω_pe` alone.

`be-106` is the R cutoff, on `PhysJS.ColdPlasmaCutoff.cutoff_R`. The Stix index is a hypothesis. For `ω_c ≥ 0`, `ω_R = (ω_c + sqrt(ω_c² + 4 ω_p²))/2`. The nested `cutoffL` object is the L root. The nested `whistlerLimit` object drops the leading `1` and replaces `ω_c − ω` by `ω_c`, and with `n = c k/ω` and `d_e = c/ω_p` gives `ω = ω_c (k d_e)²`. The reference names `cutoff_R` only.

`be-107` is the lower hybrid, on `PhysJS.LowerHybrid.lower_hybrid_eq`. The mass identity `ω_pe²/ω_ce² = ω_pi²/(ω_ci ω_ce)` and the ordered balance `1 + ω_pi²/(ω_ci ω_ce) = ω_pi²/ω²` give `ω² = 1/(1/ω_pi² + 1/(ω_ci ω_ce))`. `dense_limit` drops the leading `1` and is a separate hypothesis. Not a cyclotron monomial.

`be-108` is the oblique fast and slow magnetosonic pair, on `PhysJS.ObliqueMagnetosonic.phase_speed_eq`. The `be-69` quartic with `k_∥ = k cos θ` is a hypothesis. At `θ = π/2` the fast root is `c_s² + v_A²` and the slow root is `0`. That is the perpendicular value and not a second proof of `be-69`. At `θ = 0` the roots are the larger and smaller of `c_s²` and `v_A²`.

`be-109` is the Bennett pinch, on `PhysJS.BennettPinch.bennett_eq`. Off-axis force balance and differentiability through the axis give `μ0 I(R)²/(8 π) = ∫₀^R 2 π r p dr`. The nested `equalTemperature` object is the hydrogenic reading `∫ p dA = 2 N k_B T`, so `I = sqrt(16 π N k_B T/μ0)`. The single-population factor `8` is `∫ p dA = N k_B T` and is not that current. The reference names `bennett_eq` only.

`be-110` is the magnetic-mirror loss cone, on `PhysJS.LossCone.loss_cone_eq`. Conserved `μ` and energy, with vanishing parallel speed at the mirror, give `sin² θ_lc = B0/Bm = 1/R_m`. Pitch-angle scattering is not this row.

`be-111` is grad-B plus vacuum curvature drift, on `PhysJS.GradBDrift.drift_magnitude`. The speeds are `m v_⊥² |∇B|/(2 q B²)` and `m v_∥² |∇B|/(q B²)`, and their sum is `m (v_∥² + v_⊥²/2) |∇B|/(q B²)`. High-β curvature, where `κ ≠ |∇B|/B`, is a different vector. This is the scalar speed, not a coefficient with `B³` in the denominator.

`be-112` is the `E×B` drift, on `PhysJS.ExBDrift.drift_eq`. Steady balance with `B` along `z` gives `v_x = E_y/B` and `v_y = −E_x/B`. The charge sign cancels.

`be-113` is Landau damping, on `PhysJS.LandauDamping.damping_eq`. The Maxwellian slope is proved. The residue formula is a hypothesis, not a contour integral, and gives `γ = −sqrt(π/8) ω (ω/(k v_t))³ exp(−ω²/(2 k² v_t²))`. The nested `bohmGross` object fixes the exponent under Bohm–Gross and does not set `ω = ω_p`. The reference names `damping_eq` only.

`be-114` is the Debye sphere and the Coulomb argument, on `PhysJS.DebyeSphere.coulomb_argument`. At `(1/2) μ v_rel² = (3/2) k_B T`, `b_90 = e²/(12 π ε0 k_B T)` and `Λ = λ_D/b_90 = 9 N_D`. The angular integral and `ln Λ` are not evaluated. The one-species Debye length is an input.

`be-115` is the two-species Debye length, on `PhysJS.MultiDebye.debye_two`. Linearized Boltzmann responses add: `1/λ_D² = 1/λ₁² + 1/λ₂²`. The one-species length is not restated.

`be-116` is the Lorentz resistivity, on `PhysJS.LorentzResistivity.resistivity_eq`. The Rutherford transport cross section and the conductivity moment `σ = (8/√π) n_e e²/(m ν(v_T))` are hypotheses. The Gaussian integral is not evaluated. The kinetic prefactor is `π √(2π)/8`. The nested `referenceResistivity` object is the typed closure `4 √(2π)/3` from `1/τ_e = (4/(3 √π)) ν(v_T)`, and `η_ref = (32/(3π)) η`. The Spitzer–Härm factor `0.51` is not this row. The reference names `resistivity_eq` only.

`be-117` is resistive slab decay, on `PhysJS.ResistiveSlab.decay_time`. `∂B/∂t = η_m ∂²B/∂x²` with `η_m = 1/(μ0 σ)` is a hypothesis. The fundamental mode decays at `τ = μ0 σ L²/π²`. A denominator `4π` is not `π²`. The nested `lundquist` object is `S/Rm = v_A/v`. This is not the Reynolds analogy. The reference names `decay_time` only.

`be-118` is the Parker critical radius, on `PhysJS.ParkerCritical.critical_radius`. The isothermal spherical wind factors, and the critical point is both factors vanishing: `v² = c_s²` and `r_c = GM/(2 c_s²)`. The `2` is spherical divergence.

`be-119` is the Parker spiral, on `PhysJS.ParkerSpiral.spiral_ratio`. `B_φ/B_r = −Ω r sinθ/v_r`. `sinθ` is a real parameter. Dropping the sign is a different spiral.

`be-120` is the Chapman–Ferraro standoff, on `PhysJS.ChapmanFerraro.standoff_eq`. A doubled dipole is a hypothesis. Ram balance at `K = 1` gives `(R/R_E)⁶ = 2 B_E²/(μ0 ρ v²)`. Specular `2 ρ v²` replaces the numerator `2` by `1`. Magnetic pressure is an input. This is not a proof of `be-74`.

`be-121` is Lawson breakeven, on `PhysJS.LawsonBreakeven.breakeven_eq`. A 50–50 Maxwellian mix with bremsstrahlung neglected gives `n τ = 12 k_B T/(⟨σv⟩ E)`. The `12` is `4 × 3`. The Maxwellian average is not computed. This is not an evaluated triple product.

`be-122` is the Langmuir floating potential, on `PhysJS.LangmuirProbe.floating_potential`. The nested `bohmFlux` object is the ion flux after `e Δφ = k_B T_e/2`. Equating it to the electron flux gives `e Φ/k_B T = (1/2) ln(2 π m_e/m_i) − 1/2`. This is not Child–Langmuir. The reference names `floating_potential` only.

`be-123` is classical cross-field diffusion, on `PhysJS.CrossFieldDiffusion.diffusion_ratio`. The steady drift balance and Einstein's relation on each mobility, the same relation as `be-70` and not re-proved here, give `D_⊥/D_∥ = 1/(1 + ω_c² τ²)`. The ratio is even in the sign of `ω_c`. Bohm's `1/16` agrees only when `α² = 15`.

`be-124` is the firehose threshold, on `PhysJS.Firehose.firehose_threshold`. The CGL root is a hypothesis. It is negative iff `p_∥ − p_⊥ > B²/μ0`, and with `β = 2 μ0 p/B²` iff `β_∥ − β_⊥ > 2`. That beta is the `be-76` definition. `beta_eq` is not reproved, and `be-76` does not prove this inequality.

`be-125` is the mirror threshold, on `PhysJS.MirrorInstability.mirror_threshold`. The hypothesis `β_⊥ (T_⊥/T_∥ − 1) > 1` is `T_⊥/T_∥ − 1 > 1/β_⊥`. Omitting the `2` in beta replaces `1/β` by `2/β`. The kinetic integral is not evaluated. This is not the loss cone and not a proof of `be-76`.

`be-126` through `be-133` are the candidates in the 2026-10-05 engineering-physicist dogfood report. The UPT catalog on `master` runs through `125`, so these numbers are free. They are not catalog entries yet. The intended kind is `bridge`. Each covers line still begins with `derivation-step`.

`be-126` is the comb-drive force, on `PhysJS.CombDrive.force_eq`. Both sidewalls give `C = 2 n ε h x / g`. The lateral coenergy force is `(1/2) V² dC/dx`, so `F = n ε h V² / g`. One sidewall leaves the coenergy `1/2`. This is not `be-79`.

`be-127` is the subthreshold swing, on `PhysJS.SubthresholdSwing.swing_eq`. Boltzmann weak inversion and the gate–depletion divider, over one decade of current, give `S = ln(10) (k_B T/e) (1 + C_d/C_ox)`. Dropping `C_d` is not the swing. This is not `be-82`.

`be-128` is the ideal boost ratio, on `PhysJS.BoostConverter.boost_ratio`. Volt-second balance `V_in D + (V_in − V_out)(1 − D) = 0` gives `V_out/V_in = 1/(1 − D)`. No real duty is also the buck ratio `D`.

`be-129` is the adiabatic-tip fin, on `PhysJS.FinEfficiency.efficiency_eq`. The fin equation with `θ'(L) = 0` gives `η = tanh(m L)/(m L)`. A rectangle with both faces, `P/A = 2/t`, gives `m = √(2 h/(k t))`. One face is not that `m`, and `tanh` is not `1`.

`be-130` is the thermoelectric generator, on `PhysJS.ThermoelectricGenerator.efficiency_eq`. With `ΔT = T_c − T_h`, hot-junction heat `Q = S T_h I − I² R/2 − K ΔT`, and load power `P = I (S (T_h − T_c) − I R)`, stationarity at `m = √(1 + Z T_m)` gives `η = (1 − T_c/T_h) (m − 1)/(m + T_c/T_h)`. Matched load is not that current. The Carnot factor alone is not this efficiency.

`be-131` is the Joukowsky pressure and thin-wall speed, on `PhysJS.Joukowsky.joukowsky_eq`. Momentum across the front is `Δp = ρ c Δv`. Compressibility plus hoop strain is `c = √(K/ρ) / √(1 + (K/E)(D/e_wall))`. `ρ (Δv)²` is not the pressure jump, and the rigid pipe drops the wall term.

`be-132` is coaxial capacitance per length, on `PhysJS.CoaxialCapacitance.capacitance_per_length`. The cylindrical field integrates to `C' = 2 π ε / ln(b/a)`. Dropping `2 π` is not this capacitance. A parallel plate is not this logarithm.

`be-133` is the damping ratio, on `PhysJS.DampingRatio.damping_ratio`. Matching `c/m` to `2 ζ ω` with `ω = √(k/m)` gives `ζ = c / (2 √(k m))`. For `c ≥ 0` the discriminant vanishes iff `ζ = 1`. Dropping the `2` is not this ratio.

`be-134` through `be-146` are the candidates in the 2026-10-05 condensed-matter dogfood report, round 8. The UPT catalog on `master` runs through `133`, so these numbers are free. They are not catalog entries yet. The intended kind is `bridge`. Each covers line still begins with `derivation-step`.

`be-134` is the Bloch `T^{3/2}` law, on `PhysJS.BlochLaw.bloch_law`. The Bose integral `I = ζ(3/2) √π/4` is a hypothesis, the same kind as `π⁴/15` in `be-90`. One Bohr magneton per magnon gives `ΔM = μ_B ζ(3/2) (k_B T/(4 π D))^{3/2}`. `g μ_B` at `g = 2` is not that moment. `heisenberg_fraction` substitutes `D = 2 J S a²` and puts the extra `1/S`. `ζ(3/2)` is not evaluated.

`be-135` is the three-dimensional density of states, on `PhysJS.DensityOfStates3D.dos_3d`. Two spins and `E = ℏ² k²/(2 m)` give `g(E) = (1/(2 π²)) (2 m/ℏ²)^{3/2} √E`. One spin is half of that density.

`be-136` is the two-dimensional density of states, on `PhysJS.DensityOfStates2D.dos_2d`. Two spins in the disk give `g(E) = m/(π ℏ²)`, independent of `E`. A valley factor other than `1` is not this density.

`be-137` is the Thomas–Fermi wavevector, on `PhysJS.ThomasFermi.thomas_fermi`. Poisson plus `δn = g(E_F) e φ` gives `k_TF² = e² g(E_F)/ε0`. `g(E_F) = (3/2) n/E_F` is `PhysJS.FermiSea.dos_factor`, so `k_TF² = (e²/ε0) (3 n)/(2 E_F)`. This is not the prefactor of `be-135` and not a classical Debye length.

`be-138` is the built-in voltage, on `PhysJS.BuiltinVoltage.builtin_voltage`. Boltzmann tails give `V_bi = (k_B T/e) ln(N_A N_D/n_i²)`. `n_p N_A = n_i²` is the conclusion of `be-99` as an input. This is not `be-82`.

`be-139` is the semiconductor Fermi level, on `PhysJS.SemiconductorFermi.fermi_level`. Intrinsic `n = p` and `N_c/N_v = (m_e*/m_h*)^{3/2}` give the midgap offset `(3/4) k_B T ln(m_h*/m_e*)`. Complete ionization gives `E_c − E_F = k_B T ln(N_c/N_D)`.

`be-140` is the Onsager frequency, on `PhysJS.OnsagerFrequency.onsager_frequency`. The step from `n` to `n + 1` cancels `γ`, so `F = ℏ A/(2 π e)` and `Δ(1/B) = 1/F`.

`be-141` is the Josephson inductance at zero phase, on `PhysJS.JosephsonInductance.inductance_eq`. `I = I_c sin φ` and `V = (ℏ/(2 e)) dφ/dt` give `L_J = ℏ/(2 e I_c) = Φ₀/(2 π I_c)` at `φ = 0`. A finite phase is not this inductance. This is not the frequency of `be-59`.

`be-142` is the lower critical field, on `PhysJS.LowerCritical.lower_critical`. The core cutoff is the hypothesis `j(r) = Φ₀/(2 π μ0 λ² r)` on `ξ ≤ r ≤ λ`. The London integral and `B_c1 = μ0 ε/Φ₀` give `B_c1 = (Φ₀/(4 π λ²)) ln(λ/ξ)`, with `Φ₀ = h/(2 e)`. This is not `be-96`.

`be-143` is the AC Drude conductivity, on `PhysJS.AcDrude.ac_drude`. The cosine transform of `exp(−t/τ)` is `σ₀/(1 + ω² τ²)`, with `σ₀ = n e² τ/m` an input. Dropping the DC `1` is not this conductivity. This is not `be-123`.

`be-144` is Matthiessen's rule, on `PhysJS.Matthiessen.matthiessen`. Independent exponential survivals give `1/τ = 1/τ₁ + 1/τ₂`, and one Drude factor makes `ρ = ρ₁ + ρ₂`. This is not a collision integral.

`be-145` is the Stoner enhancement, on `PhysJS.Stoner.stoner`. The geometric series of the contact bubbles is `χ = χ_P/(1 − I g(E_F))` when `|I g(E_F)| < 1`. The pole is the same formula. `χ_P` is `be-94` and is not re-proved.

`be-146` is the Gorter–Casimir fraction, on `PhysJS.GorterCasimir.gorter_casimir`. The exponent `4` is a hypothesis. The London depths of `be-75` then give `λ(T) = λ(0)/√(1 − (T/T_c)^4)`. This is not a BCS gap and not a second proof of `be-75`.

`be-16` is kind `bridge` on `PhysJS.Landauer.erasure_eq`, the equal-level two-state case. The covers line still begins with `derivation-step`. It covers the encoded scale `⟨E⟩ − F = k_B T log 2` for the equal-level two-state ensemble at `T > 0`. `equal_levels` remains the entropy `k_B log 2`. At `T > 0`, levels `E` and `E + δ` are the negative control. At `T = 0`, `β = 0`, so the Helmholtz closed form does not separate the levels. The inequality `E ≥ T ΔS` for an arbitrary protocol and the Bérut confrontation are not this row.

`be-29` is a property `formalRef` on `PhysJS.Jarzynski.jensen_work`. `rejected.ts` marks the row not-a-bridge. `ΔF = −(1/β) log(∑ p_i exp(−β W_i))` is the definition used here, and a finite probability with `β > 0` gives `⟨W⟩ ≥ ΔF`. The reversed inequality on two unequal work values is the negative control. Jarzynski's theorem and the Gaussian identity are not this row.

`be-11` is a property `formalRef` on `PhysJS.Lindblad.preserve`. The encoded scalar is the rate `γ(λ) = γ₀ (λ/λ₀)²`. The entry is one channel of the displayed GKSL generator, which the AST does not encode. Its trace is zero, and it is Hermitian when `H` and `ρ` are. `L` need not be Hermitian. Dropping the anticommutator is the negative control. Born–Markov coarse-graining is not this row.

`be-65` covers the derivation of the encoded Jeans mass from the virial convention with factor `5` and `M = 4 π R³ ρ / 3`. Replacing `5` by `3` is the negative control. It does not derive the virial theorem.

`be-51` covers the weak-field line integral `(1+γ)/c² ∫_ℝ G M b / (b² + z²)^{3/2} dz = 2(1+γ) G M / (b c²)`. At `γ = 1` the value is the encoded angle `4 G M / (b c²)`. `γ = 0` is the negative control. It does not integrate a geodesic.

`be-61` covers `∫_ℝ x² e^x / (1+e^x)² dx = π²/3`, the factor in the encoded Lorenz number. The integrand is even, so the half-line integral is half of `π²/3`. Claiming the half-line equals `π²/3` is the negative control. It does not derive the Wiedemann–Franz law.

`be-12` covers the two writings of the encoded thermal wavelength: `√(2π ℏ² / (m k_B T)) = h / √(2π m k_B T)` for `h = 2π ℏ` and `ℏ > 0`. The square root is the non-negative root, so `ℏ > 0` is what makes them agree. The Wave Q form `ℏ / √(m k_B T)`, with `ℏ` in the numerator and no `√(2π)`, is the negative control, as is `ℏ / √(2 m k_B T)`. Caldeira–Leggett dephasing is not this row.

`be-59` covers `f = (2e/h) V`, `K_J = 2e/h`, and `f = K_J V`. Clearing `h` recovers `2e`. The factor `2` is the Cooper-pair charge, taken as a premise. Replacing `2e` by `e` is the negative control. The tunneling Hamiltonian is not this row.

`be-55` covers `σ_xy = C e² / h`, `R_H = h / (C e²)`, and `R_K = h / e²`, so `σ_xy R_H = 1` and `R_H = R_K / C`, for a nonzero integer plateau index. Replacing `C` by `C + 1` is the negative control, as is `e` in place of `e²` (they agree at `e = 1`, so that control assumes `e ≠ 1`). TKNN, and the post-2019 exactness of `R_K`, are not this row.

`be-60` covers the catalog filling fraction. For nonzero integers `p` and `q`, with `ν = p / q`, `σ_xy = ν e² / h` and `R_xy = R_K / ν = (q / p) h / e²`. Oddness of `q` is the Laughlin selection rule and is not this identity. `fraction` remains the case `ν = 1/3`: `R_xy = 3 h / e² = 3 R_K`, from `PhysJS.QuantumHall.reciprocal`. At `ν = 1` that lemma is the integer plateau `C = 1`. `R_K / 3` is the integer plateau `C = 3`, the fraction inverted, and it is the negative control. The Laughlin wavefunction and the anyon charge `e/3` are not this row.

`be-21` covers the saturating value `η/s = ℏ / (4 π k_B)`, written as `4 π k_B (η/s) = ℏ` for `k_B ≠ 0`. The Hawking factor `8π`, the one in `PhysJS.HawkingUnruh.hawking`, is the negative control: it equals `2 ℏ`, not `ℏ`, once `ℏ ≠ 0`. The inequality `η/s ≥ ℏ / (4 π k_B)` is not this row.

`be-14` and `be-43` are one lemma, `PhysJS.PlanckArea.area_law`. `be-14` is kind `derivation-step`. `be-43` is kind `bridge`. Both covers lines still begin with `derivation-step`. It covers `k_B c³ A / (4 G ℏ) = k_B A / (4 ℓ_P²)` for `ℓ_P² = ℏ G / c³`. The area is an input. BE-43 is that equality on a wormhole area, not a second proof. `ℓ_P² = ℏ G / c²` agrees only at `c = 1`, so that control assumes `c ≠ 1`. The factor `2` in place of `4` is the other control. The minimal-surface theorem and ER=EPR are not this row. Both keys name the same theorem.

`be-37` covers `∫_{R_near}^{R_far} (2 G M / c³) (dr / r) = (2 G M / c³) ln(R_far / R_near)` for `0 < R_near < R_far` and `c ≠ 0`. The factor `1` in place of `2` is half that delay, the same half that `γ = 0` catches in the deflection integral, once `G ≠ 0` and `M ≠ 0`. `log₁₀` of the radius ratio is not `ln`. The impact-parameter formula and the Cassini measurement are not this row.

`be-54` covers the catalog Hubble rate `H² = (8πG/3) ρ (1 + ρ/(2σ)) + Λ/3` for `σ ≠ 0`. The same rate is the Friedmann term plus `(8πG/3) ρ² / (2σ)`. `positive_tension` remains the sign of that excess for `σ > 0`, `ρ > 0`, and `G > 0`, and it does not reprove the limit `σ → ∞`. The correction `1 + ρ/σ` is the negative control. `σ < 0` puts `H²` below the Friedmann value, so it is not a physical brane. The `c²` dictionary onto `FirstOrderFriedmann` at `k = 0` is the nested `friedmann` object. Identifying the module's `Λ` with Physlib's `Λ` and dropping `c²` fails when `c² ≠ 1` and `Λ ≠ 0`. The five-dimensional Einstein equation is not this row. The reference names `brane_friedmann`. The row is recorded when the nested Friedmann identification is present too.

`be-17` covers the torsion–spin inversion. `κ` is `PhysJS.Einstein.kappa`, `8πG/c⁴`. If every component satisfies `T = κ S` and `κ ≠ 0`, then `S·S = T·T / κ²`, which is `(c⁴/(8πG))² T·T`. `κ²` in the numerator is the inversion run backwards. It agrees with the true quotient when `κ⁴ = 1`, so that control assumes `κ⁴ ≠ 1` and a nonzero contraction. The Einstein–Cartan field equation and any Newtonian limit are not this row. The reference names `inversion` only. The Buckingham step is the nested `torsionMonomial` object, `PhysJS.EinsteinCartan.torsion_monomial`: `[κ]` and `[S]` are independent base dimensions and `[T] = [κ][S]`. Homogeneity in those dimensions makes every positive pair a unit change of `(1, 1)`, so `T = C κ S` and `C` is not fixed. `coefficientNotFixed` is `coefficient_not_fixed`: a factor other than `1` is not the catalog coefficient. `unitCoefficient` is `inversion_of_unit_coefficient`, which applies `inversion` only after assuming `C = 1`. The Einstein trace stays a hypothesis of `PhysJS.Einstein.trace_eq`. Each covers line claims its own part.

`be-27` covers the rewriting of the encoded product `T (1 + Σ_active / (k_B T))` as the sum `T + Σ_active / k_B`, for `T ≠ 0` and `k_B ≠ 0`. The sum equals `T` if and only if `Σ_active = 0`. The product `T · Σ_active / (k_B T)`, with the `1` omitted, is the negative control. The frequency-dependent Cugliandolo–Kurchan `T_eff(ω)` is not this row.

`be-22` covers the toric-code value. Four anyons of quantum dimension `1` have total quantum dimension `D = √4 = 2` and `γ = ln 2` in nats. The encoded decomposition is `S = α L − γ`, with the `O(L⁻¹)` term dropped. `log₂ 2 = 1` is the bit convention, not nats. `D = √2` is one anyon pair, not the toric code. The Kitaev–Preskill theorem and a quantum-gravity identification of the boundary are not this row.

`be-15` covers the coarsening exponent. For `Γ = L₀² / t₀ > 0`, `t > 0`, `t ≠ t₀`, and `z > 0`, the scaling `L(t) = L₀ (t / t₀)^{1/z}` obeys `L(t)² = Γ t` if and only if `z = 2`. At `t = t₀` the ratio holds for every `z`, so that direction assumes `t ≠ t₀`. Model B's `z = 3` gives `L³ ∝ t` and fails `L² = Γ t`. The Model A Langevin equation is not this row. The Langevin kinetic coefficient is a different `Γ`. The Buckingham step is the nested `lengthMonomial` object, `PhysJS.Coarsening.length_monomial_at`: `L` is a dimensionally homogeneous function of `Γ` and `t` alone, and `[Γ] = L^z T⁻¹`, so `L = C (Γ t)^{1/z}` with `C` unfixed. Every positive rational `z` is allowed, so `z = 2` is not derived. `length_monomial` is that hypothesis at `[Γ] = L² T⁻¹`, rewritten with a square root. The reference names `exponent_iff` only. Each covers line claims its own part.

`be-33` covers the catalog scaling `ξ(T) = ξ₀ (T / T₀)^{−1/z}`. For `T > 0` and `T₀ > 0`, the case `z = 1` is `ξ(T) = ξ₀ (T / T₀)^{−1} = ξ₀ T₀ / T`. The reference names `thermal_scaling` only. `xi_product` and `wrong_exponent` are separate theorems. Hertz–Millis theory and a universality-class label are not this row. The Buckingham step is the nested `scalingShape` object, `PhysJS.QuantumCritical.scaling_shape`: if `ξ` is dimensionally homogeneous in a length `ξ₀` and two temperatures, then `ξ = ξ₀ φ(T/T₀)` and `φ` is not fixed. The nested `everyPower` object, `every_power_homogeneous`, shows that `(T/T₀)^p` has that homogeneity for every real `p`, so `−1/z` is not chosen. Each covers line claims its own part.

`be-50` covers the catalog potential `A_μ(x) = (A_μ^ret(x) + A_μ^adv(x)) / 2`. Twice that component is the sum of the retarded and advanced components. `residual_iff` remains the residual: when `A_ret + A_adv ≠ 0`, `(A_ret − A_adv) / (A_ret + A_adv) = 0` if and only if `A_ret = A_adv`. A fully retarded field, `A_adv = 0` with `A_ret ≠ 0`, gives residual `1`, not `0`. The id is contested. This lemma does not decide the contest. The absorber boundary condition as a theory of radiation reaction is not this row.

`be-32` covers one group element's Born overlap. `|c + s i|² = c² + s²` is `Complex.normSq` of that one matrix element. A sum of squares above `1` is not a probability in `[0, 1]`, which is the module's rejection of `c² + s² > 1`. The difference `c² − s²` agrees only at `s = 0`. The Giacomini–Castro-Ruiz–Brukner transformation and the Haar integral are not this row. The catalog records this id as not-a-bridge. This lemma does not decide that.

`be-28` is kind `property` on `PhysJS.EntropyProduction.nonneg`. The covers line still begins with `derivation-step`. It covers the entropy-production sum. `σ = Σ_i J_i X_i` is the definition of `σ`. If every product is `≥ 0` then `σ ≥ 0`. One flipped sign, with the other products zero and the flipped product strictly positive, is not `σ`, and that flipped sum is negative. The variational maximum-entropy-production principle is not this row. The catalog records this id as not-a-bridge. This lemma does not decide that.

`be-40` covers the scale freedom of the composite-Higgs potential. For `f ≠ 0` and `θ = h/f`, `V(h) / f⁴ = −α sin²θ + β [sin⁴θ − sin²θ cos²θ]`. Both terms carry `f⁴`, so the ratio depends on `h` only through `θ`. The pre-correction first term `−α f² sin²θ`, divided by `f⁴`, is `−α sin²θ / f²`. It depends on `f`, and it agrees with `−α sin²θ` only when `f² = 1`. SILH matching onto a confining theory is not this row. The catalog records this id as not-a-bridge. This lemma does not decide that.

`be-35` covers the crossing residual of one block. For a real function `g`, `g(u,v) − g(v,u) = −(g(v,u) − g(u,v))`. The swap is the negation of a difference, and it holds off the diagonal. The residual is `0` for every `g` when `u = v`, including `u = v = 1/4`, so that point is not a control. A block that is not symmetric does not vanish at `u = 1/2`, `v = 1/4`. The infinite sum over `(Δ, ℓ)`, positivity, and unitarity are not this row. The catalog records this id as not-a-bridge. This lemma does not decide that.

`be-63` covers the polytropic prefactor of the Chandrasekhar mass. With `n = ρ / (μ_e m_u)`, `p_F = ℏ (3π² n)^{1/3}`, and `P = (1/4) n p_F c`, the pressure is `K_ρ ρ^{4/3}`, where `K_ρ = K_n / (μ_e m_u)^{4/3}` and `K_n = (ℏ c / 4) (3π²)^{1/3}`. For the `n = 3` Lane–Emden scale the central density cancels, and `M = (ω₃⁰ √(3π) / 2) (ℏ c / G)^{3/2} (μ_e m_u)^{−2}`. `ω₃⁰` stays a parameter. The decimal `2.01824` is not in the theorem. With `ℏ = c = μ_e = m_u = 1` the pressure route and `K_n` agree. `√π / 2` in place of `√(3π) / 2` fails when `ω₃⁰ ≠ 0`, and dropping `ω₃⁰` fails when `ω₃⁰ ≠ 1`. Stellar rotation and magnetic support are not this row.

`be-30` covers the first variation of von Neumann entropy for a curve that stays diagonal. Each state is full rank and has trace `1`. Then `d/dt S(ρ(t)) = −⟪ρ̇(t), log ρ(t)⟫`, and that bracket is the trace inner product. The modular Hamiltonian `K = − log ρ` is frozen at the base point, so the same derivative is `d/dt ⟨K⟩`. A finite jump is not that derivative: `diag(1/2, 1/2)` has `K = (log 2) I`, so `diag(3/4, 1/4)` has the same expectation and a smaller entropy. The holographic first law that identifies `K` with an area variation is not this row.
