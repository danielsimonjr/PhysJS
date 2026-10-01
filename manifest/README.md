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

`be-13` covers the four-dimensional contraction of the Einstein equation, `R = 4Λ − κ T`. The contraction does not choose a signature. Under `−,+,+,+`, dust with `u_μ u^μ = −c²` has trace `−ρ c²`. The BE-20 density is the nested `vacuum` object. The reference, when it is attached, names the contraction only. The opposite sign for the vacuum tensor is the negative control. This does not certify Jacobson's thermodynamic derivation. BE-20 does not get its own reference.

`be-34` covers the Kibble–Zurek freeze-out power. `ε̂` is the unique positive solution of `τ₀ ε^{−zν} = ε τ_Q`, and the defect power is `ξ₀^{−d} (τ_Q/τ₀)^{−dν/(1+zν)}`. The exponent with the `1` omitted is the negative control. The Boltzmann factor and the missing `1/a^d` prefactor are not this row.

`be-42` is a cross-check, not a formalRef. The covers line names BE-57 and the edge `be-42-via-rs`. `T_H` at the Schwarzschild radius equals `T_H(M)`, and the Unruh temperature at `c⁴/(4GM)` equals `T_H(M)`. `T_U(c⁴/(2GM))` is the negative control. It does not certify the Hawking effect.
