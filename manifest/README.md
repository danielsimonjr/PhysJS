# Manifest

`bridges.json` is the file UPT consumes. One entry is one manifest key:

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

`ab-kg-oscillator` covers the uniform-mode restriction in Physlib's own terms.

`ab-spring-lc` and `ab-damped-rlc` cover the oscillator dictionary: time rescaling between Physlib oscillators, with the circuit names read off the parameters.

`ab-wave-dalembert` covers the missing direction of d'Alembert's formula: a jointly `C²` solution of Physlib's one-dimensional `WaveEquation`, at nonzero speed, is a sum of two profiles.

`be-64` covers the derivation step that cancels `r²` in the Eddington force balance. It does not certify a hard cap. The key is the catalog id.

`be-53` covers the sign of the one-loop coefficient: for SU(3), `b₀ > 0` if and only if `N_f ≤ 16`. The closed form of the running is the nested `oneLoop` object. The reference, when it is attached, names the sign theorem only. The row is recorded when both are present. Each covers line claims its own part.

`be-58` covers the low-frequency limit of the quantum Johnson–Nyquist parent. The `+ 1` denominator is the negative control. It does not derive the fluctuation–dissipation theorem.

`be-38` covers the Newtonian and deep-MOND limits of `ν(z)`. The mass stays in the deep-MOND force scale. The claim `ν √z → √2` is the negative control. The inversion of `μ(x) = x / √(1 + x²)` is the nested `inversion` object. The reference, when it is attached, names the limit theorem only. The row is recorded when both are present. Each covers line claims its own part. The SPARC confrontation is not this row.

`be-13` covers the four-dimensional contraction of the Einstein equation, `R = 4Λ − κ T`. The contraction does not choose a signature. Under `−,+,+,+`, dust with `u_μ u^μ = −c²` has trace `−ρ c²`. The BE-20 density is the nested `vacuum` object. The Friedmann corollary is the nested `corollary` object: `(8πG/3) ρ = Λ c² / 3`, and a fluid of that density added to matter, with the explicit `Λ` set to zero, is `FirstOrderFriedmann` at `k = 0`. The Einstein-static density `Λ c² / (4π G)` is twice that term. Dropping `c²` fails when `c² ≠ 1`. The density is not reproved. The reference, when it is attached, names the contraction only. The opposite sign for the vacuum tensor is the negative control of the density. This does not certify Jacobson's thermodynamic derivation. BE-20 does not get its own reference.

`be-34` covers the Kibble–Zurek freeze-out power. `ε̂` is the unique positive solution of `τ₀ ε^{−zν} = ε τ_Q`, and the defect power is `ξ₀^{−d} (τ_Q/τ₀)^{−dν/(1+zν)}`. The exponent with the `1` omitted is the negative control. The Boltzmann factor and the missing `1/a^d` prefactor are not this row.

`be-42` is a cross-check, not a formalRef. The covers line names BE-57 and the edge `be-42-via-rs`. `T_H` at the Schwarzschild radius equals `T_H(M)`, and the Unruh temperature at `c⁴/(4GM)` equals `T_H(M)`. `T_U(c⁴/(2GM))` is the negative control. It does not certify the Hawking effect.

`be-24` is a cross-check, not a formalRef. The efficiency has the three readings `R₀⁶/(R₀⁶+R⁶)`, `1/(1+(R/R₀)⁶)`, and `k_FRET/(k_FRET+1/τ_D)`, and it decreases on `(0, ∞)`. `η(R₀, R₀) = 1/2` holds for any positive power, so it is not the control. At `R = 2 R₀` the exponent 4 is not the exponent 6. The dipole–dipole law is a premise.

`be-19` is a cross-check, not a formalRef. The covers line names BE-54. `H²_LQC` equals `H²_RS` at `σ = −ρ_c/2`. As `ρ_c → ∞` and as `σ → ∞`, both tend to `(8πG/3)ρ + Λ/3`. At `ρ = ρ_c` and `Λ = 0`, `H²_LQC = 0`. `σ = +ρ_c/2` is the negative control. `σ < 0` is not a physical Randall–Sundrum brane.

`be-16` is a property, not a formalRef. Equal levels of the two-state ensemble have thermodynamic entropy `k_B log 2`. At `T ≠ 0`, levels `E` and `E + δ` are the negative control. At `T = 0`, `β = 0`, so the closed form does not separate the levels. The inequality `E ≥ T ΔS` and the Bérut confrontation are not this row.

`be-29` is a property, not a formalRef. `rejected.ts` marks the row not-a-bridge. `ΔF = −(1/β) log(∑ p_i exp(−β W_i))` is the definition used here, and a finite probability with `β > 0` gives `⟨W⟩ ≥ ΔF`. The reversed inequality on two unequal work values is the negative control. Jarzynski's theorem and the Gaussian identity are not this row.

`be-11` is a property, not a formalRef. The encoded scalar is the rate `γ(λ) = γ₀ (λ/λ₀)²`. The entry is one channel of the displayed GKSL generator, which the AST does not encode. Its trace is zero, and it is Hermitian when `H` and `ρ` are. `L` need not be Hermitian. Dropping the anticommutator is the negative control. Born–Markov coarse-graining is not this row.

`be-65` covers the derivation of the encoded Jeans mass from the virial convention with factor `5` and `M = 4 π R³ ρ / 3`. Replacing `5` by `3` is the negative control. It does not derive the virial theorem.

`be-51` covers the weak-field line integral `(1+γ)/c² ∫_ℝ G M b / (b² + z²)^{3/2} dz = 2(1+γ) G M / (b c²)`. At `γ = 1` the value is the encoded angle `4 G M / (b c²)`. `γ = 0` is the negative control. It does not integrate a geodesic.

`be-61` covers `∫_ℝ x² e^x / (1+e^x)² dx = π²/3`, the factor in the encoded Lorenz number. The integrand is even, so the half-line integral is half of `π²/3`. Claiming the half-line equals `π²/3` is the negative control. It does not derive the Wiedemann–Franz law.

`be-12` covers the two writings of the encoded thermal wavelength: `√(2π ℏ² / (m k_B T)) = h / √(2π m k_B T)` for `h = 2π ℏ` and `ℏ > 0`. The square root is the non-negative root, so `ℏ > 0` is what makes them agree. The Wave Q form `ℏ / √(m k_B T)`, with `ℏ` in the numerator and no `√(2π)`, is the negative control, as is `ℏ / √(2 m k_B T)`. Caldeira–Leggett dephasing is not this row.

`be-59` covers `f = (2e/h) V`, `K_J = 2e/h`, and `f = K_J V`. Clearing `h` recovers `2e`. The factor `2` is the Cooper-pair charge, taken as a premise. Replacing `2e` by `e` is the negative control. The tunneling Hamiltonian is not this row.

`be-55` covers `σ_xy = C e² / h`, `R_H = h / (C e²)`, and `R_K = h / e²`, so `σ_xy R_H = 1` and `R_H = R_K / C`, for a nonzero integer plateau index. Replacing `C` by `C + 1` is the negative control, as is `e` in place of `e²` (they agree at `e = 1`, so that control assumes `e ≠ 1`). TKNN, and the post-2019 exactness of `R_K`, are not this row.

`be-60` covers the Laughlin fraction at `ν = 1/3`: `σ_xy = ν e² / h` and `R_xy = 3 h / e² = 3 R_K`. It follows `PhysJS.QuantumHall.reciprocal` and does not reprove it. At `ν = 1` the formula is that lemma at plateau `C = 1`. `R_K / 3` is the integer plateau `C = 3`, the fraction inverted, and it is the negative control. The Laughlin wavefunction and the anyon charge `e/3` are not this row.

`be-21` covers the saturating value `η/s = ℏ / (4 π k_B)`, written as `4 π k_B (η/s) = ℏ` for `k_B ≠ 0`. The Hawking factor `8π`, the one in `PhysJS.HawkingUnruh.hawking`, is the negative control: it equals `2 ℏ`, not `ℏ`, once `ℏ ≠ 0`. The inequality `η/s ≥ ℏ / (4 π k_B)` is not this row.

`be-14` and `be-43` are one lemma, `PhysJS.PlanckArea.area_law`. It covers `k_B c³ A / (4 G ℏ) = k_B A / (4 ℓ_P²)` for `ℓ_P² = ℏ G / c³`. The area is an input. BE-43 is that equality on a wormhole area, not a second proof. `ℓ_P² = ℏ G / c²` agrees only at `c = 1`, so that control assumes `c ≠ 1`. The factor `2` in place of `4` is the other control. The minimal-surface theorem and ER=EPR are not this row. Both keys name the same theorem.

`be-37` covers `∫_{R_near}^{R_far} (2 G M / c³) (dr / r) = (2 G M / c³) ln(R_far / R_near)` for `0 < R_near < R_far` and `c ≠ 0`. The factor `1` in place of `2` is half that delay, the same half that `γ = 0` catches in the deflection integral, once `G ≠ 0` and `M ≠ 0`. `log₁₀` of the radius ratio is not `ln`. The impact-parameter formula and the Cassini measurement are not this row.

`be-54` covers the positive-tension factor `1/2`: for `σ > 0`, `ρ > 0`, and `G > 0`, `H²_RS − H²_FRW = (8πG/3) ρ² / (2σ) > 0`. It uses `PhysJS.QuantumBounce` and does not reprove the limit `σ → ∞`. The correction `1 + ρ/σ` is the negative control. `σ < 0` puts `H²` below the Friedmann value, so it is not a physical brane. The `c²` dictionary onto `FirstOrderFriedmann` at `k = 0` is the nested `friedmann` object. Identifying the module's `Λ` with Physlib's `Λ` and dropping `c²` fails when `c² ≠ 1` and `Λ ≠ 0`. The five-dimensional Einstein equation is not this row. The reference, when it is attached, names the tension theorem only. The row is recorded when both are present.

`be-17` covers the torsion–spin inversion. `κ` is `PhysJS.Einstein.kappa`, `8πG/c⁴`. If every component satisfies `T = κ S` and `κ ≠ 0`, then `S·S = T·T / κ²`, which is `(c⁴/(8πG))² T·T`. `κ²` in the numerator is the inversion run backwards. It agrees with the true quotient when `κ⁴ = 1`, so that control assumes `κ⁴ ≠ 1` and a nonzero contraction. The Einstein–Cartan field equation and any Newtonian limit are not this row.

`be-27` covers the rewriting of the encoded product `T (1 + Σ_active / (k_B T))` as the sum `T + Σ_active / k_B`, for `T ≠ 0` and `k_B ≠ 0`. The sum equals `T` if and only if `Σ_active = 0`. The product `T · Σ_active / (k_B T)`, with the `1` omitted, is the negative control. The frequency-dependent Cugliandolo–Kurchan `T_eff(ω)` is not this row.

`be-22` covers the toric-code value. Four anyons of quantum dimension `1` have total quantum dimension `D = √4 = 2` and `γ = ln 2` in nats. The encoded decomposition is `S = α L − γ`, with the `O(L⁻¹)` term dropped. `log₂ 2 = 1` is the bit convention, not nats. `D = √2` is one anyon pair, not the toric code. The Kitaev–Preskill theorem and a quantum-gravity identification of the boundary are not this row.

`be-15` covers the coarsening exponent. For `Γ = L₀² / t₀ > 0`, `t > 0`, `t ≠ t₀`, and `z > 0`, the scaling `L(t) = L₀ (t / t₀)^{1/z}` obeys `L(t)² = Γ t` if and only if `z = 2`. At `t = t₀` the ratio holds for every `z`, so that direction assumes `t ≠ t₀`. Model B's `z = 3` gives `L³ ∝ t` and fails `L² = Γ t`. The Model A Langevin equation is not this row. The Langevin kinetic coefficient is a different `Γ`.

`be-33` covers the finite-temperature exponent. The encoded scaling is `ξ(T) = ξ₀ (T / T₀)^{−1/z}`. For `T > 0` and `T₀ > 0`, that scaling gives `ξ T = ξ₀ T₀` at `z = 1`. The retired exponent `−ν/z` is not `−1/z` when `ν ≠ 1`, and the product `ξ T = ξ₀ T₀` fails with it. The module's old pin `−0.71 = −71/100` is that failure at `z = 1`. At `T = T₀` every exponent agrees, so the comparison assumes `T ≠ T₀`. Hertz–Millis theory and a universality-class label are not this row.

`be-50` covers the time-symmetric residual. When `A_ret + A_adv ≠ 0`, `(A_ret − A_adv) / (A_ret + A_adv) = 0` if and only if `A_ret = A_adv`. The encoded field is the half-sum `(A_ret + A_adv) / 2`, and twice that field is the residual's denominator. A fully retarded field, `A_adv = 0` with `A_ret ≠ 0`, gives residual `1`, not `0`. The id is contested. This lemma does not decide the contest. The absorber boundary condition as a theory of radiation reaction is not this row.

`be-32` covers one group element's Born overlap. `|c + s i|² = c² + s²` is `Complex.normSq` of that one matrix element. A sum of squares above `1` is not a probability in `[0, 1]`, which is the module's rejection of `c² + s² > 1`. The difference `c² − s²` agrees only at `s = 0`. The Giacomini–Castro-Ruiz–Brukner transformation and the Haar integral are not this row. The catalog records this id as not-a-bridge. This lemma does not decide that.

`be-28` covers the entropy-production sum. `σ = Σ_i J_i X_i` is the definition of `σ`. If every product is `≥ 0` then `σ ≥ 0`. One flipped sign, with the other products zero and the flipped product strictly positive, is not `σ`, and that flipped sum is negative. The variational maximum-entropy-production principle is not this row. The catalog records this id as not-a-bridge. This lemma does not decide that.

`be-40` covers the scale freedom of the composite-Higgs potential. For `f ≠ 0` and `θ = h/f`, `V(h) / f⁴ = −α sin²θ + β [sin⁴θ − sin²θ cos²θ]`. Both terms carry `f⁴`, so the ratio depends on `h` only through `θ`. The pre-correction first term `−α f² sin²θ`, divided by `f⁴`, is `−α sin²θ / f²`. It depends on `f`, and it agrees with `−α sin²θ` only when `f² = 1`. SILH matching onto a confining theory is not this row. The catalog records this id as not-a-bridge. This lemma does not decide that.
