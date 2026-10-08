# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- `manifest/bridges.json` is schema `physjs-bridge-manifest/v2`. Every entry carries `kind`, and the covers line no longer opens with a kind word. The kind is read from the Lean source: the module docstring of the file that declares the entry's theorem has one line per key, `` `be-80`. Bridge. ``, and `bun scripts/manifest-kind.ts --write` copies that word into the entry. `tests/manifest-kind.test.ts` and the `check:kinds` CI step fail when a kind disagrees with its Lean file, when a key has no kind line, or when a covers line opens with a kind word. 209 entries change kind: 198 catalog keys whose theorem states the catalog equation were labelled `derivation-step` by their covers prefix and are now `bridge` (seventy-nine of them are the persona-report proofs added above), `be-28` is now `property`, and the ten atlas keys, which had no prefix, are now `bridge`. Thirteen keys stay `derivation-step`, two `limit`, one `reduction`, three `cross-check`, and two more `property`. Nested statements carry no kind and keep their covers lines. Earlier entries in this section that say a covers line "still begins with `derivation-step`" describe the v1 file. The nineteen Lean files that had no kind line for their keys now have one.
- The Release workflow no longer fails on every push to `main`. Its Version job runs only when some workspace package is public; every package is private, so it is skipped. The changesets action used to try to open a release pull request, which GitHub Actions may not do here, and failed. `publish.yml` is removed: PhysJS is not published, and that workflow could only fail.
- Changeset files are named for what they record, with no round or bridge numbers.

### Added

- `be-171` through `be-249`, complete proofs of the seventy-nine candidates from the 2026-10-06 engineering, condensed-matter, plasma and space, thermal and chemical, relativity and astrophysics, optics, and acoustics dogfood reports (sessions 10 to 16). Not catalog entries yet. The intended kind is `bridge`. Each covers line still begins with `derivation-step`. Empirical or convention-dependent constants are hypotheses, not derived. Covered: Cantilever tip stiffness 3EI/L^3 (be-171); Cantilever fundamental frequency and its characteristic root (be-172); Electrostatic spring softening (be-173); Quarter-bridge strain gauge output (be-174); Coaxial characteristic impedance (be-175); Sauerbrey mass loading (be-176); Equipartition displacement kBT/k (be-177); Thermomechanical force noise 4kBTc (be-178); Bolometer thermal-fluctuation NEP (be-179); Peltier cooler maximum delta T (be-180); Vibration-harvester resonant power, Williams-Yates form (be-181); Mean free path and Ioffe-Regel bridge; Bloch-oscillation frequency bridge; Pippard coherence length bridge; Clausius-Mossotti bridge; Depairing current density bridge; Schottky-Mott barrier bridge; Wannier exciton bridge; Coulomb-blockade charging energy bridge; Weak-localization correction bridge; Thermal-conductance quantum bridge; Kondo temperature bridge; Sweet-Parker reconnection inflow; Sedov-Taylor blast radius exponents; Strong-shock compression ratio; Bohm cross-field diffusion; Bondi-Hoyle accretion radius; Stromgren radius; Pulsar dispersion delay; Faraday rotation measure; Larmor radiated power; Thermal bremsstrahlung power density; Critical ionization velocity energy condition; log-mean temperature difference of a counterflow exchanger; counterflow epsilon-NTU effectiveness; Darcy-Weisbach pressure drop with the Blasius friction factor; Ergun packed-bed pressure gradient; ideal Brayton cycle efficiency; Langmuir adsorption isotherm; Butler-Volmer electrode kinetics; Debye-Hueckel limiting law; Kelvin equation for droplet vapor pressure; hard-sphere gas mean free path; gray-body radiation exchange between parallel plates; Nernst-Einstein ionic conductivity; Schwarzschild ISCO and photon sphere (be-216); Gravitational-wave power of a circular binary (be-217); Peters inspiral time (be-218); Geodetic precession (be-219); Matter-dominated age (be-220); Hill radius (be-221); Bekenstein bound saturation (be-222); Photon-gas energy density and CMB scaling (be-223); Etherington reciprocity and Tolman dimming (be-224); Synchrotron cooling time (be-225); Pulsar dipole spin-down field (be-226); Fresnel normal-incidence reflectance from E/H continuity; Rayleigh diffraction limit with Bessel-zero bracketing; Abbe resolution from the grating equation and aperture; Gaussian-beam Rayleigh range and divergence; Fabry-Perot FSR and finesse from the Airy series; Etendue and basic radiance invariance from Snell's law; Schawlow-Townes linewidth from phase diffusion; Laser threshold gain from round-trip balance; Photodiode responsivity from photon counting; Photonic band gap from the transfer-matrix trace; Pockels half-wave voltage from the linear electro-optic effect; Doppler line width from the Maxwell profile; Elastic-wave speeds bridge (be-239); Young modulus from bulk and shear bridge (be-240); Acoustic impedance reflection bridge (be-241); Stokes-Kirchhoff absorption bridge (be-242); Helmholtz resonator bridge (be-243); Mach angle bridge (be-244); Minnaert bubble resonance bridge (be-245); Zener thermoelastic damping bridge (be-246); Piezoelectric coupling bridge (be-247); Brillouin frequency shift bridge (be-248); Photoacoustic initial pressure bridge (be-249).
- `be-147` through `be-170`, complete proofs of the twenty-four candidates
  from the 2026-10-06 thermal, chemical, and engineering dogfood report.
  Arrhenius, Eyring, the Gibbs isotherm, van 't Hoff, Nernst, the integrated
  Clausius–Clapeyron equation, Raoult, the Prandtl, Reynolds, Biot, Nusselt,
  Schmidt, and Sherwood identities, Fourier conduction, Newton cooling, the
  Otto efficiency, the Joule–Thomson coefficient, the Planck spectrum, the
  Stefan–Boltzmann constant, Wien's displacement law, Sackur–Tetrode, Saha,
  Richardson–Dushman, and Onsager reciprocity. van 't Hoff, Nernst, and
  Raoult call `PhysJS.GibbsIsotherm.gibbs_eq`. The integrated coexistence
  curve calls `PhysJS.Clapeyron.slope_eq`. Sackur–Tetrode and Saha call
  `PhysJS.ThermalDeBroglie.wavelength_eq`. The thermoelectric instance calls
  `PhysJS.KelvinRelation.peltier_eq`. Not catalog entries yet. The intended
  kind is `bridge`. Each covers line still begins with `derivation-step`.
- `PhysJS.MagneticPressure.pressure_eq`, a complete proof that a linear
  inductor, `U = (L/2) I²`, and a long solenoid give the magnetic pressure
  `p = B²/(2 μ0)`. The monomial `p = C B²/μ0` leaves `C` unfixed. The
  prefactor `1` is the battery work per volume, not this pressure.
  Manifest key `be-74`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`. Not a
  kinetic pressure.
- `PhysJS.LondonPenetration.depth_eq`, a complete proof that the London
  equation and Ampere's law on `B = B0 exp(−x/λ)` give
  `λ = √(m/(μ0 n e²))`, with `e` the elementary charge. The inputs do not
  form a unique monomial. Manifest key `be-75`. Not a catalog entry yet.
  The intended kind is `bridge`. The covers line still begins with
  `derivation-step`. Not the classical skin depth.
- `PhysJS.PlasmaBeta.beta_eq`, a complete proof that
  `β = p / p_B = 2 μ0 n k_B T / B²` when `p_B` is
  `PhysJS.MagneticPressure.pressure_eq` and `p = n k_B T`. Manifest key
  `be-76`. Not a catalog entry yet. The intended kind is `bridge`. The
  covers line still begins with `derivation-step`. Not a plasma-β
  inequality.
- `PhysJS.HagenPoiseuille.flow_eq`, a complete proof that the circular-pipe
  balance integrates to `Q = π R⁴ ΔP/(8 μ L)` and `f_D Re = 64`. The Fanning
  product on the same profile is `16`. Manifest key `be-77`. Not a catalog
  entry yet. The intended kind is `bridge`. The covers line still begins
  with `derivation-step`. Not a square duct.
- `PhysJS.EulerBuckling.critical_load`, a complete proof that the lowest
  pinned Euler eigenvalue is `π² E I/L²`, with the cantilever at `π²/4` of
  that load. Manifest key `be-78`. Not a catalog entry yet. The intended
  kind is `bridge`. The covers line still begins with `derivation-step`.
- `PhysJS.PullIn.pull_in_eq`, a complete proof that the parallel-plate fold
  is `g = 2 g0/3` and `V_pi² = 8 k g0³/(27 ε0 A) = 8 k g0²/(27 C0)`.
  Manifest key `be-79`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`.
- `PhysJS.MottGurney.current_eq`, a complete proof that drift and Poisson
  with an injecting contact integrate to `J = (9/8) ε μ V²/d³`. Manifest
  key `be-80`. Not a catalog entry yet. The intended kind is `bridge`.
  The covers line still begins with `derivation-step`. Not Child–Langmuir.
- `PhysJS.ChildLangmuir.current_eq`, a complete proof that the vacuum
  profile `x^{4/3}` gives `J = (4 ε0/9) sqrt(2 e/m) V^{3/2}/d²`, with `e`
  the elementary charge. Manifest key `be-81`. Not a catalog entry yet.
  The intended kind is `bridge`. The covers line still begins with
  `derivation-step`. Not Mott–Gurney.
- `PhysJS.ShockleyDiode.shockley_eq`, a complete proof that Boltzmann
  quasi-equilibrium, ideality 1, and detailed balance give
  `I = I_s (exp(e V/(k_B T)) − 1)`. Manifest key `be-82`. Not a catalog
  entry yet. The intended kind is `bridge`. The covers line still begins
  with `derivation-step`.
- `PhysJS.Thomson.thomson_eq`, a complete proof that differentiating the
  Kelvin relation gives `μ_T = T dS/dT`. Manifest key `be-83`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line still
  begins with `derivation-step`. Not `be-73` itself.
- `PhysJS.FourPoint.sheet_eq`, a complete proof that equal collinear probes
  on an infinite sheet give `R_s = (π/ln 2)(V/I)`. Manifest key `be-84`.
  Not a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`. Not `be-35`.
- `PhysJS.ShotNoise.shot_eq`, a complete proof that a Poisson count and the
  one-sided window `Δf = 1/(2 T)` give `S_I = 2 e I`. Manifest key `be-85`.
  Not a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`. Not Johnson–Nyquist.
- `PhysJS.ReynoldsAnalogy.reynolds_eq`, a complete proof that equal wall
  diffusivities at `Pr = 1` give `St = C_f/2`. Manifest key `be-86`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line still
  begins with `derivation-step`.
- `PhysJS.CapacitorNoise.noise_eq`, a complete proof that one quadratic
  capacitor in equilibrium has `⟨v²⟩ = k_B T/C`. Manifest key `be-87`.
  Not a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`. Not `(3/2) k_B T`.
- `PhysJS.FermiSea.fermi_sea`, a complete proof that two spins in the
  sphere give `k_F = (3 π² n)^{1/3}`, with `E_F` and `v_F` from the
  isotropic parabola. Manifest key `be-88`. Not a catalog entry yet.
  The intended kind is `bridge`. The covers line still begins with
  `derivation-step`. One spin is a different sphere.
- `PhysJS.DebyeCutoff.debye_cutoff`, a complete proof that three branches
  filling `3n` states give `ω_D = v_s (6 π² n)^{1/3}`. Manifest key
  `be-89`. Not a catalog entry yet. The intended kind is `bridge`. The
  covers line still begins with `derivation-step`.
- `PhysJS.DebyeHeat.debye_heat`, a complete proof that `U ∝ T⁴` and the
  hypothesis `∫ x³/(e^x−1) dx = π⁴/15` give
  `C_V = (12 π⁴/5) N k_B (T/θ_D)³`. Manifest key `be-90`. Not a catalog
  entry yet. The intended kind is `bridge`. The covers line still begins
  with `derivation-step`. The Bose integral is not evaluated.
- `PhysJS.EinsteinSolid.einstein_heat`, a complete proof that three Planck
  oscillators differentiate to the Einstein heat capacity and tend to
  `3 N k_B`. Manifest key `be-91`. Not a catalog entry yet. The intended
  kind is `bridge`. The covers line still begins with `derivation-step`.
- `PhysJS.SommerfeldHeat.electronic_heat`, a complete proof that the
  Sommerfeld energy correction and a `√E` density give
  `c_V = (π²/2) n k_B² T/E_F`. Manifest key `be-92`. Not a catalog entry
  yet. The intended kind is `bridge`. The covers line still begins with
  `derivation-step`. Not `be-61`.
- `PhysJS.CurieWeiss.curie_weiss`, a complete proof that the moment
  `S(S+1)/3` and mean field give `χ = C/(T−θ)`. Manifest key `be-93`.
  Not a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`. The second moment is a hypothesis.
- `PhysJS.PauliParamagnetism.pauli`, a complete proof that Zeeman imbalance
  and the parabolic density give `χ_P = μ₀ μ_B² (3 n)/(2 E_F)`. Manifest
  key `be-94`. Not a catalog entry yet. The intended kind is `bridge`.
  The covers line still begins with `derivation-step`. Not Landau
  diamagnetism.
- `PhysJS.GinzburgLandau.type_boundary`, a complete proof that a trial
  wall in the stated normalization changes sign at `κ = 1/√2`. Manifest
  key `be-95`. Not a catalog entry yet. The intended kind is `bridge`.
  The covers line still begins with `derivation-step`. The positive side
  is this trial, not every minimizer.
- `PhysJS.UpperCritical.critical_field`, a complete proof that the
  hypothesized Landau level of charge `2e` is `B_c2 = Φ₀/(2 π ξ²)`.
  Manifest key `be-96`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`.
- `PhysJS.AmbegaokarBaratoff.ambegaokar_baratoff`, a complete proof that
  the zero-temperature coherence integral is `π/2`, so
  `I_c R_n = π Δ/(2 e)` once the tunnel Hamiltonian supplies that
  integral. Manifest key `be-97`. Not a catalog entry yet. The intended
  kind is `bridge`. The covers line still begins with `derivation-step`.
- `PhysJS.BcsJump.heat_jump`, a complete proof that the weak-coupling
  quartic and the both-spin Sommerfeld heat capacity give
  `ΔC/C_n = 12/(7 ζ)`. Manifest key `be-98`. Not a catalog entry yet.
  The intended kind is `bridge`. The covers line still begins with
  `derivation-step`. `ζ` is not evaluated as a series.
- `PhysJS.MassAction.mass_action`, a complete proof that Boltzmann tails
  give `n_i = √(N_c N_v) exp(−E_g/(2 k_B T))` and `n p = n_i²`. Manifest
  key `be-99`. Not a catalog entry yet. The intended kind is `bridge`.
  The covers line still begins with `derivation-step`.
- `PhysJS.LyddaneSachsTeller.lst`, a complete proof that an undamped
  oscillator zero gives `ω_LO²/ω_TO² = ε(0)/ε(∞)`. Manifest key `be-100`.
  Not a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`.
- `PhysJS.BktJump.bkt_jump`, a complete proof that a `θ = φ` vortex and
  area entropy give `k_B T_BKT = π J/2`. Manifest key `be-101`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line still
  begins with `derivation-step`. Not the renormalization-group flow.
- `PhysJS.LandauerConductance.conductance_eq`, a complete proof that
  one-dimensional mode flux and spin `2` give `G = (2 e²/h) Σ T_n`.
  Manifest key `be-102`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`. Not the
  Hall conductance.
- `PhysJS.BohmSheath.cold_bohm_threshold`, a complete proof that cold ions
  and Boltzmann electrons require `u0² ≥ k_B T_e/m_i`. `γ_i = 3` gives
  `c_s² = (k_B T_e + 3 k_B T_i)/m_i`. Manifest key `be-103`. Not a catalog
  entry yet. The intended kind is `bridge`. The covers line still begins
  with `derivation-step`.
- `PhysJS.IonAcoustic.dispersion_eq`, a complete proof of the cold-ion
  dispersion `ω² = k² c_s²/(1 + k² λ_De²)`. Manifest key `be-104`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line still
  begins with `derivation-step`.
- `PhysJS.UpperHybrid.upper_hybrid_eq`, a complete proof that the cold
  perpendicular ansatz gives `ω² = ω_pe² + ω_ce²`. Manifest key `be-105`.
  Not a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`.
- `PhysJS.ColdPlasmaCutoff.cutoff_R` and `cutoff_L`, complete proofs of the
  nonnegative R and L roots, and `whistler_limit` from the simplified R-mode
  dispersion. Manifest key `be-106`. Not a catalog entry yet. The intended
  kind is `bridge`. The covers line still begins with `derivation-step`.
  The Stix index is a hypothesis.
- `PhysJS.LowerHybrid.lower_hybrid_eq`, a complete proof of
  `ω_LH² = 1/(1/ω_pi² + 1/(ω_ci ω_ce))` from the ordered cold balance.
  Manifest key `be-107`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`.
- `PhysJS.ObliqueMagnetosonic.phase_speed_eq`, a complete proof of the
  oblique fast and slow roots of the `be-69` quartic. Manifest key
  `be-108`. Not a catalog entry yet. The intended kind is `bridge`. The
  covers line still begins with `derivation-step`. Not a second proof of
  the perpendicular polarization.
- `PhysJS.BennettPinch.bennett_eq`, a complete proof of the pinch integral
  `μ0 I(R)²/(8 π) = ∫ 2 π r p dr`. Equal electron and ion temperatures
  give `I = sqrt(16 π N k_B T/μ0)`, not the single-population factor `8`.
  Manifest key `be-109`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`.
- `PhysJS.LossCone.loss_cone_eq`, a complete proof that
  `sin² θ_lc = B0/Bm = 1/R_m`. Manifest key `be-110`. Not a catalog entry
  yet. The intended kind is `bridge`. The covers line still begins with
  `derivation-step`.
- `PhysJS.GradBDrift.drift_magnitude`, a complete proof of the signed
  grad-B and vacuum-curvature speeds and their sum. Manifest key `be-111`.
  Not a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`.
- `PhysJS.ExBDrift.drift_eq`, a complete proof that `v_x = E_y/B` and
  `v_y = −E_x/B`. Manifest key `be-112`. Not a catalog entry yet. The
  intended kind is `bridge`. The covers line still begins with
  `derivation-step`.
- `PhysJS.LandauDamping.damping_eq`, a complete proof of the Landau rate
  from a Maxwellian slope and a residue hypothesis. The contour integral
  is not evaluated. Manifest key `be-113`. Not a catalog entry yet. The
  intended kind is `bridge`. The covers line still begins with
  `derivation-step`.
- `PhysJS.DebyeSphere.coulomb_argument`, a complete proof that
  `Λ = λ_D/b_90 = 9 N_D` for `b_90` at `(3/2) k_B T`. Manifest key
  `be-114`. Not a catalog entry yet. The intended kind is `bridge`. The
  covers line still begins with `derivation-step`. The logarithm is not
  derived.
- `PhysJS.MultiDebye.debye_two`, a complete proof that two Boltzmann
  species add in `1/λ_D²`. Manifest key `be-115`. Not a catalog entry yet.
  The intended kind is `bridge`. The covers line still begins with
  `derivation-step`.
- `PhysJS.LorentzResistivity.resistivity_eq`, a complete proof of the
  kinetic resistivity `(π √(2π)/8)` from the conductivity moment
  `8/√π`, which is a hypothesis. The typed reference prefactor
  `(4 √(2π)/3)` is a different closure and equals `(32/(3π))` times the
  kinetic one. Manifest key `be-116`. Not a catalog entry yet. The
  intended kind is `bridge`. The covers line still begins with
  `derivation-step`. Not the Spitzer–Härm factor.
- `PhysJS.ResistiveSlab.decay_time`, a complete proof that the fundamental
  slab mode decays at `τ = μ0 σ L²/π²`, with `S/Rm = v_A/v`. Manifest key
  `be-117`. Not a catalog entry yet. The intended kind is `bridge`. The
  covers line still begins with `derivation-step`.
- `PhysJS.ParkerCritical.critical_radius`, a complete proof that both
  factors of the isothermal wind vanish at `r_c = GM/(2 c_s²)`. Manifest
  key `be-118`. Not a catalog entry yet. The intended kind is `bridge`.
  The covers line still begins with `derivation-step`.
- `PhysJS.ParkerSpiral.spiral_ratio`, a complete proof that
  `B_φ/B_r = −Ω r sinθ/v_r`. Manifest key `be-119`. Not a catalog entry
  yet. The intended kind is `bridge`. The covers line still begins with
  `derivation-step`.
- `PhysJS.ChapmanFerraro.standoff_eq`, a complete proof that a doubled
  dipole and ram pressure give `(R/R_E)⁶ = 2 B_E²/(μ0 ρ v²)`. Manifest
  key `be-120`. Not a catalog entry yet. The intended kind is `bridge`.
  The covers line still begins with `derivation-step`.
- `PhysJS.LawsonBreakeven.breakeven_eq`, a complete proof that 50–50 DT
  breakeven is `n τ = 12 k_B T/(⟨σv⟩ E)`. Manifest key `be-121`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line still
  begins with `derivation-step`.
- `PhysJS.LangmuirProbe.floating_potential`, a complete proof of the
  floating potential from Bohm ion flux and Boltzmann electron flux.
  Manifest key `be-122`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`. Not
  Child–Langmuir.
- `PhysJS.CrossFieldDiffusion.diffusion_ratio`, a complete proof that
  `D_⊥/D_∥ = 1/(1 + ω_c² τ²)`. Manifest key `be-123`. Not a catalog entry
  yet. The intended kind is `bridge`. The covers line still begins with
  `derivation-step`.
- `PhysJS.Firehose.firehose_threshold`, a complete proof that the CGL
  firehose root is negative iff `β_∥ − β_⊥ > 2`. Manifest key `be-124`.
  Not a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`. Not a proof of `be-76`.
- `PhysJS.MirrorInstability.mirror_threshold`, a complete proof that the
  mirror threshold `β_⊥ (T_⊥/T_∥ − 1) > 1` is `T_⊥/T_∥ − 1 > 1/β_⊥`.
  Manifest key `be-125`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`. Not the
  loss cone.
- `PhysJS.CombDrive.force_eq`, a complete proof that both sidewalls and
  coenergy give `F = n ε h V² / g`. Manifest key `be-126`. Not a catalog
  entry yet. The intended kind is `bridge`. The covers line still begins
  with `derivation-step`. One sidewall leaves the coenergy `1/2`. Not
  `be-79`.
- `PhysJS.SubthresholdSwing.swing_eq`, a complete proof that one decade of
  weak-inversion current is `S = ln(10) (k_B T/e) (1 + C_d/C_ox)`. Manifest
  key `be-127`. Not a catalog entry yet. The intended kind is `bridge`.
  The covers line still begins with `derivation-step`. Not `be-82`.
- `PhysJS.BoostConverter.boost_ratio`, a complete proof that volt-second
  balance gives `V_out/V_in = 1/(1 − D)`. Manifest key `be-128`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line still
  begins with `derivation-step`. Not the buck ratio.
- `PhysJS.FinEfficiency.efficiency_eq`, a complete proof that an adiabatic
  rectangular fin has `m = √(2 h/(k t))` and `η = tanh(m L)/(m L)`.
  Manifest key `be-129`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`. Not one
  face and not an infinite fin.
- `PhysJS.ThermoelectricGenerator.efficiency_eq`, a complete proof that the
  optimum current gives
  `η = (1 − T_c/T_h) (√(1 + Z T_m) − 1)/(√(1 + Z T_m) + T_c/T_h)`. Manifest
  key `be-130`. Not a catalog entry yet. The intended kind is `bridge`.
  The covers line still begins with `derivation-step`. Not matched load
  and not Carnot alone.
- `PhysJS.Joukowsky.joukowsky_eq`, a complete proof that `Δp = ρ c Δv` and
  the thin-wall speed is `c = √(K/ρ) / √(1 + (K/E)(D/e_wall))`. Manifest
  key `be-131`. Not a catalog entry yet. The intended kind is `bridge`.
  The covers line still begins with `derivation-step`. Not `ρ (Δv)²` and
  not a rigid pipe.
- `PhysJS.CoaxialCapacitance.capacitance_per_length`, a complete proof that
  `C' = 2 π ε / ln(b/a)`. Manifest key `be-132`. Not a catalog entry yet.
  The intended kind is `bridge`. The covers line still begins with
  `derivation-step`. Not `ε A/d`.
- `PhysJS.DampingRatio.damping_ratio`, a complete proof that
  `ζ = c / (2 √(k m))` and that, for `c ≥ 0`, critical damping is `ζ = 1`.
  Manifest key `be-133`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`.
- `PhysJS.BlochLaw.bloch_law`, a complete proof that one Bohr magneton per
  magnon and the Bose-integral hypothesis `I = ζ(3/2) √π/4` give
  `ΔM = μ_B ζ(3/2) (k_B T/(4 π D))^{3/2}`. `g = 2` is not that moment.
  `heisenberg_fraction` puts the extra `1/S`. Manifest key `be-134`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line still
  begins with `derivation-step`. `ζ(3/2)` is not evaluated.
- `PhysJS.DensityOfStates3D.dos_3d`, a complete proof that two spins and
  `E = ℏ² k²/(2 m)` give
  `g(E) = (1/(2 π²)) (2 m/ℏ²)^{3/2} √E`. Manifest key `be-135`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line still
  begins with `derivation-step`. One spin is half of that density.
- `PhysJS.DensityOfStates2D.dos_2d`, a complete proof that two spins in the
  disk give `g(E) = m/(π ℏ²)`. Manifest key `be-136`. Not a catalog entry
  yet. The intended kind is `bridge`. The covers line still begins with
  `derivation-step`. A valley factor other than `1` is not this density.
- `PhysJS.ThomasFermi.thomas_fermi`, a complete proof that Poisson and
  `δn = g(E_F) e φ` give `k_TF² = e² g(E_F)/ε0 = (e²/ε0) (3 n)/(2 E_F)`,
  using `PhysJS.FermiSea.dos_factor`. Manifest key `be-137`. Not a catalog
  entry yet. The intended kind is `bridge`. The covers line still begins
  with `derivation-step`. Not `be-135` and not a classical Debye length.
- `PhysJS.BuiltinVoltage.builtin_voltage`, a complete proof that Boltzmann
  tails give `V_bi = (k_B T/e) ln(N_A N_D/n_i²)`. Manifest key `be-138`.
  Not a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`. `n p = n_i²` is an input from
  `be-99`. Not `be-82`.
- `PhysJS.SemiconductorFermi.fermi_level`, a complete proof of the intrinsic
  offset `(3/4) k_B T ln(m_h*/m_e*)` and the extrinsic line
  `E_c − E_F = k_B T ln(N_c/N_D)`. Manifest key `be-139`. Not a catalog
  entry yet. The intended kind is `bridge`. The covers line still begins
  with `derivation-step`. Not a Fermi–Dirac integral.
- `PhysJS.OnsagerFrequency.onsager_frequency`, a complete proof that the
  step `n → n + 1` cancels `γ`, so `F = ℏ A/(2 π e)`. Manifest key
  `be-140`. Not a catalog entry yet. The intended kind is `bridge`. The
  covers line still begins with `derivation-step`.
- `PhysJS.JosephsonInductance.inductance_eq`, a complete proof that
  `L_J = ℏ/(2 e I_c) = Φ₀/(2 π I_c)` at `φ = 0`. Manifest key `be-141`.
  Not a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`. Not the frequency of `be-59`.
- `PhysJS.LowerCritical.lower_critical`, a complete proof that the London
  line energy on `ξ ≤ r ≤ λ` gives
  `B_c1 = (Φ₀/(4 π λ²)) ln(λ/ξ)`. Manifest key `be-142`. Not a catalog
  entry yet. The intended kind is `bridge`. The covers line still begins
  with `derivation-step`. The core cutoff is a hypothesis. Not `be-96`.
- `PhysJS.AcDrude.ac_drude`, a complete proof that the cosine transform of
  the causal relaxation is `σ₀/(1 + ω² τ²)`. Manifest key `be-143`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line still
  begins with `derivation-step`. Not `be-123`.
- `PhysJS.Matthiessen.matthiessen`, a complete proof that independent
  exponential survivals give `1/τ = 1/τ₁ + 1/τ₂` and `ρ = ρ₁ + ρ₂`.
  Manifest key `be-144`. Not a catalog entry yet. The intended kind is
  `bridge`. The covers line still begins with `derivation-step`. Not a
  collision integral.
- `PhysJS.Stoner.stoner`, a complete proof that the geometric series is
  `χ = χ_P/(1 − I g(E_F))`, with the pole the same formula. Manifest key
  `be-145`. Not a catalog entry yet. The intended kind is `bridge`. The
  covers line still begins with `derivation-step`. `χ_P` is not re-proved.
- `PhysJS.GorterCasimir.gorter_casimir`, a complete proof that the
  hypothesis `p = 4` and the London depths give
  `λ(T) = λ(0)/√(1 − (T/T_c)^4)`. Manifest key `be-146`. Not a catalog
  entry yet. The intended kind is `bridge`. The covers line still begins
  with `derivation-step`. Not a BCS gap and not a second proof of `be-75`.

### Changed

- Lean sources are flat under `lean/`. `PhysJS/<File>.lean` is
  `lean/<File>.lean` (module `lean.<File>`), and the nested
  `lean/PhysJS/` directory is gone. The aggregator is `lean.lean`
  (module `lean`). `lakefile.toml` sets `srcDir = "."`, `roots = ["lean"]`,
  and `globs = ["lean.*"]`, so `lake build` builds every file.
  Imports are `import lean.<File>`. Namespaces and theorem names stay
  `PhysJS.*`. The axiom audit root is the module `lean`. `lakefile.toml`,
  `lean-toolchain`, and `lake-manifest.json` stay at the repository root.
  `manifest/bridges.json` is unchanged. `manifest/lean-files.json` lists
  the proof files at `lean/<File>.lean`.

### Added

- Tier 1 `@danielsimonjr/physjs-core`: the UPT SI constant table, a
  quantity that carries a MathTS `Unit`, and the expression binding
  where bare `e` is the elementary charge, `E` is energy, and Euler's
  number is only `exp(x)`. The package stays private.
- Tier 0 TypeScript workspace: a private Bun 1.4.2 workspace and ten
  marker packages (`core`, `mechanics`, `em`, `thermo`, `fluids`,
  `plasma`, `optics`, `gr`, `bridges`, `proofs`). Nothing is published.
- `docs/design/library-architecture.md`, a proposal for the TypeScript
  library, the Modelica package, and the fourJS boundary. fourJS calls
  the PhysJS step API directly. There is no adapter package. Later tiers
  still wait for approval.

### Changed

- Module comments, theorem docstrings, the README, and `manifest/README.md`
  now record the UPT `formalRef` kinds at PhysJS `c695865`. `be-11`
  (`PhysJS.Lindblad.preserve`) and `be-29` (`PhysJS.Jarzynski.jensen_work`)
  are kind `property`. `be-19` (`PhysJS.QuantumBounce.dictionary`), `be-24`
  (`PhysJS.Fret.dictionary`), and `be-42` (`PhysJS.HawkingUnruh.dictionary`)
  are kind `cross-check`. `be-28` (`PhysJS.EntropyProduction.nonneg`) is
  kind `property` while its covers line still begins with `derivation-step`.
  Fourteen catalog keys are kind `bridge` while the covers line still begins
  with `derivation-step`: `be-12`, `be-16` (`PhysJS.Landauer.erasure_eq`,
  the equal-level two-state case), `be-21`, `be-27`, `be-33`, `be-37`,
  `be-40`, `be-43`, `be-50`, `be-54`, `be-55`, `be-59`, `be-60`, and `be-63`.
  Sixteen catalog references stay counted. Ten atlas bridges stay kind
  `bridge`. No theorem statement or proof changed.

### Added

- `PhysJS.FastMagnetosonic.speed_eq`, a complete proof that one
  compressional monochromatic polarization of the perpendicular ideal-MHD
  linearization has phase speed `√(c_s² + B²/(μ0 ρ))`. The textbook
  quartic at `k_∥ = 0` is `perpendicular_of_dispersion`. The zero root
  does not solve compressional induction. Manifest key `be-69`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`. Not a kinetic dispersion, and
  not the oblique fast mode.
- `PhysJS.EinsteinRelation.diffusion_eq`, a complete proof that drift
  cancels diffusion on a classical Boltzmann profile, so
  `D = μ k_B T / q`. Dropping `q`, the Fermi-liquid form, and
  Stokes–Einstein are the negative controls. Manifest key `be-70`. Not
  a catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`. Not a master equation.
- `PhysJS.Clapeyron.slope_eq`, a complete proof that equal specific
  Gibbs energies and `dg = −s dT + v dP` give `dP/dT = L/(T Δv)` when
  `L = T Δs`. Dropping `T` or one phase volume fails. Manifest key
  `be-71`. Not a catalog entry yet. The intended kind is `bridge`. The
  covers line still begins with `derivation-step`. Not the integrated
  vapor-pressure law.
- `PhysJS.GravitationalRedshift.frequency_ratio`, a complete proof that
  two static observers of one coordinate period have
  `ν1/ν2 = √(g_00 ratio)` for `g_00 < 0`. `tolman_same_ratio` is the
  link to `be-68`: the temperatures stand in that ratio only when the
  Tolman products agree. Manifest key `be-72`. Not a catalog entry yet.
  The intended kind is `bridge`. The covers line still begins with
  `derivation-step`. Not `hydrostatic_constant`, and not a horizon
  temperature.
- `PhysJS.KelvinRelation.peltier_eq`, a complete proof that open-circuit
  Seebeck and isothermal Peltier coefficients satisfy `Π = S T` when
  `L12 = L21`. That equality is a structure field, not an axiom.
  Without it the coefficients disagree. Manifest key `be-73`. Not a
  catalog entry yet. The intended kind is `bridge`. The covers line
  still begins with `derivation-step`. Not the first Thomson relation.
- `PhysJS.RadiationPressure.pressure_eq`, a complete proof of
  `P_n = (I/c)(1+R) cos²θ` from foreshortening, normal momentum per
  energy, and an opaque split into absorption and specular reversal.
  `pressure_monomial` leaves `C` in `P = C I/c` unfixed.
  `coefficient_unfixed`, `reflector_not_absorber`, and
  `oblique_endpoints` are the negative controls. UPT kind is `bridge`
  on `pressure_eq`. The covers line still begins with `derivation-step`.
  Not the Maxwell stress tensor, and not the Eddington luminosity.
- `PhysJS.AlfvenSpeed.speed_eq`, a complete proof that one transverse
  monochromatic polarization of the parallel incompressible ideal-MHD
  linearization has phase speed `B/√(μ0 ρ)` for `B > 0`. `ρ` is the
  total mass density in that momentum premise. Proton-only density and
  the Gaussian writing without the unit dictionary are the negative
  controls. `4π×10^{-7}` is the permeability stand-in, not a measured
  `μ0`. UPT kind is `bridge` on `speed_eq`. The covers line still
  begins with `derivation-step`. Not a kinetic dispersion relation.
  Dimensional homogeneity of `{v, B, μ0, ρ}` is not formalized.
- `PhysJS.TolmanEhrenfest.hydrostatic_constant`, a complete proof that
  hydrostatic balance and the equilibrium Gibbs relation give
  `T √(-g_00)` equal at the endpoints of a static interval, in the
  signature `(−,+,+,+)`. `units_do_not_entail` and
  `mostly_plus_needs_the_minus` are the negative controls. UPT kind is
  `bridge` on `hydrostatic_constant`. The covers line still begins
  with `derivation-step`. Not a horizon temperature, and not
  `T ‖ξ‖ = const`. The hydrostatic equation is not derived from
  `∇_μ T^{μν} = 0`.
- `PhysJS.Landauer.erasure_eq`, a complete proof that the free-energy deficit
  `⟨E⟩ − F` of Physlib's equal-level two-state ensemble is `k_B T log 2`
  for `T > 0`. `equal_levels` remains the entropy step `k_B log 2`. At
  `T > 0`, levels `E` and `E + δ` are not that deficit. UPT kind is
  `bridge` on `erasure_eq`, the equal-level two-state case. The covers
  line still begins with `derivation-step`. Not `E ≥ T ΔS` for an
  arbitrary erasure protocol and not the Bérut confrontation.
- `PhysJS.RandallSundrum.brane_friedmann`, a complete proof of the catalog
  equation `H² = (8πG/3) ρ (1 + ρ/(2σ)) + Λ/3` for `σ ≠ 0`. The same rate
  equals the Friedmann term plus `(8πG/3) ρ²/(2σ)`. `positive_tension`
  remains the sign of that excess. It covers that equation of `be-54`,
  not a derivation from the five-dimensional Einstein equation.
- `PhysJS.TimeSymmetric.wheeler_feynman`, a complete proof of the catalog
  equation `A_μ(x) = (A_μ^ret(x) + A_μ^adv(x))/2`. Twice that component is
  the sum. `residual_iff` remains the vanishing of the residual. It covers
  that equation of `be-50`, not the absorber theory of radiation reaction.
- `PhysJS.QuantumCritical.thermal_scaling`, a complete proof of the catalog
  scaling `ξ(T) = ξ₀ (T/T₀)^{−1/z}`. At `z = 1`, for `T > 0` and `T₀ > 0`,
  this is `ξ₀ (T/T₀)^{−1} = ξ₀ T₀/T`. `xi_product` remains `ξ T = ξ₀ T₀`.
  It covers that equation of `be-33`, not Hertz–Millis theory.
- `PhysJS.Laughlin.filling_fraction`, a complete proof of the catalog
  equation at `ν = p/q`: `σ_xy = ν e²/h` and `R_xy = R_K/ν = (q/p) h/e²`,
  for nonzero integers `p` and `q`. Oddness of `q` is not this identity.
  `fraction` remains the case `ν = 1/3`. It covers that equation of
  `be-60`, not the Laughlin wavefunction and not the anyon charge `e/3`.
- `PhysJS.Dimensional`, a Buckingham-Pi fragment. A dimensionally homogeneous
  function of positive magnitudes is a monomial times a dimensionless constant
  when a unit change reaches every positive tuple, and a monomial times a
  function of one ratio when a single dimensionless group remains. A pure
  number that labels the dimension assignment is an input, not a conclusion.
- `PhysJS.Coarsening.length_monomial_at`. Hypothesis: `L` is a dimensionally
  homogeneous function of `Γ` and `t` alone, and `[Γ] = L^z T⁻¹` for a
  positive rational `z`. Conclusion: `L = C (Γ t)^{1/z}`, with `C` not fixed.
  Every such `z` works, so `z = 2` is not derived. `length_monomial` is the
  case `[Γ] = L² T⁻¹`. `exponent_iff` remains the scaling comparison. This is
  not the Model A Langevin equation.
- `PhysJS.EinsteinCartan.torsion_monomial`. `[κ]` and `[S]` are independent
  base dimensions and `[T] = [κ][S]`. Hypothesis: a positive torsion component
  is dimensionally homogeneous in those dimensions. Every positive pair is
  then a unit change of `(1, 1)`. Conclusion: `T = C κ S` with `C = f(1, 1)`.
  `C = 1` is not derived. `coefficient_not_fixed` separates any other factor
  from the catalog coefficient. `inversion_of_unit_coefficient` applies
  `inversion` only after assuming `C = 1`. The Einstein trace stays a
  hypothesis of `PhysJS.Einstein.trace_eq`. `inversion` remains the reference.
  The module is the one introduced for `be-15`.
- `PhysJS.QuantumCritical.scaling_shape`. Hypothesis: `ξ` is a dimensionally
  homogeneous function of a length `ξ₀` and two temperatures. Conclusion:
  `ξ = ξ₀ φ(T/T₀)`, and `φ` is not fixed. `every_power_homogeneous` shows that
  every real power of `T/T₀` has that homogeneity, so the exponent `−1/z` is
  not derived. Both are nested on `be-33`. The module is the one introduced
  for `be-15`.
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
  covers that dictionary of `be-42`, not the Hawking effect. UPT stores
  it as a `formalRef` of kind `cross-check`.
- `PhysJS.Fret.dictionary`, a complete cross-check that the Förster
  efficiency is `R₀⁶/(R₀⁶+R⁶)`, `1/(1+(R/R₀)⁶)`, and
  `k_FRET/(k_FRET+1/τ_D)`, and that it decreases. At `R = 2 R₀` the
  exponent 4 is not the exponent 6. It covers that dictionary of `be-24`,
  not the dipole–dipole law. UPT stores it as a `formalRef` of kind
  `cross-check`.
- `PhysJS.QuantumBounce.dictionary`, a complete cross-check that
  `H²_LQC` equals `H²_RS` at `σ = −ρ_c/2`, that both tend to
  `(8πG/3)ρ + Λ/3`, and that `H²_LQC = 0` at `ρ = ρ_c` and `Λ = 0`.
  The covers line names BE-54. `σ = +ρ_c/2` is not that polynomial, and
  `σ < 0` is not a physical Randall–Sundrum brane. It covers that
  dictionary of `be-19`. UPT stores it as a `formalRef` of kind
  `cross-check`.
- `PhysJS.Landauer.equal_levels`, a complete proof that equal levels of
  Physlib's two-state ensemble have thermodynamic entropy `k_B log 2`.
  At `T ≠ 0`, levels `E` and `E + δ` are not that value. At `T = 0` the
  closed form does not separate the levels. It remains the entropy step of
  `be-16`. The reference is `erasure_eq`. Not `E ≥ T ΔS`, and not the
  Bérut confrontation.
- `PhysJS.Jarzynski.jensen_work`, a complete proof that a finite
  probability and `β > 0` give `⟨W⟩ ≥ ΔF`, where `ΔF` is
  `−(1/β) log(∑ p_i exp(−β W_i))`. The reversed inequality fails on two
  unequal work values. It covers that property of `be-29`, not
  Jarzynski's theorem and not the Gaussian identity. UPT stores it as a
  `formalRef` of kind `property`.
- `PhysJS.Lindblad.preserve`, a complete proof that one channel of the
  displayed GKSL generator has trace zero, and that it is Hermitian when
  `H` and `ρ` are. `L` need not be Hermitian. Dropping the anticommutator
  makes the trace nonzero. It covers that property of `be-11`, not
  Born–Markov coarse-graining. UPT stores it as a `formalRef` of kind
  `property`.
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
  `ℏ / √(2 m k_B T)`. It covers `be-12` (kind `bridge` on `wavelength_eq`;
  the covers line still begins with `derivation-step`), not
  Caldeira–Leggett dephasing.
- `PhysJS.Josephson.frequency_eq`, a complete proof that
  `f = (2e/h) V`, `K_J = 2e/h`, and `f = K_J V`. Clearing the denominator
  recovers `2e`. The factor `2` is the Cooper-pair charge, taken as a
  premise. Replacing it by `e` fails. It covers `be-59` (kind `bridge` on
  `frequency_eq`; the covers line still begins with `derivation-step`),
  not the tunneling Hamiltonian.
- `PhysJS.QuantumHall.reciprocal`, a complete proof that
  `σ_xy = C e² / h`, `R_H = h / (C e²)`, and `R_K = h / e²` satisfy
  `σ_xy R_H = 1` and `R_H = R_K / C` for a nonzero integer `C`. The
  shifted index `C + 1` is a different conductance. Replacing `e²` by `e`
  makes the product fail to be `1` when `e ≠ 1`. It covers `be-55` (kind
  `bridge` on `reciprocal`; the covers line still begins with
  `derivation-step`), not the TKNN theorem.
- `PhysJS.Laughlin.fraction`, a complete proof that at `ν = 1/3`,
  `σ_xy = ν e² / h` and `R_xy = 3 h / e² = 3 R_K`, using the BE-55
  reciprocal. At `ν = 1` the formula is the integer plateau `C = 1`.
  `R_K / 3` is that lemma at `C = 3`, the fraction inverted, and it
  fails. The formalRef of `be-60` is `filling_fraction`, kind `bridge`.
  The covers line still begins with `derivation-step`. This case is not
  the Laughlin wavefunction and not the anyon charge `e/3`.
- `PhysJS.Kss.saturating`, a complete proof that the encoded saturating
  value `η/s = ℏ / (4 π k_B)` is the equality `4 π k_B (η/s) = ℏ` for
  `k_B ≠ 0`. The Hawking factor `8π` in place of `4π` is twice `ℏ`, not
  `ℏ`, once `ℏ ≠ 0`. It covers `be-21` (kind `bridge` on `saturating`;
  the covers line still begins with `derivation-step`), not the
  inequality `η/s ≥ ℏ / (4 π k_B)`.
- `PhysJS.PlanckArea.area_law`, a complete proof that
  `k_B c³ A / (4 G ℏ) = k_B A / (4 ℓ_P²)` for `ℓ_P² = ℏ G / c³`. The
  area is an input. BE-43 is that equality on a wormhole area, not a
  second lemma. `ℓ_P² = ℏ G / c²` fails when `c ≠ 1`, and the factor `2`
  in place of `4` fails. `be-14` is kind `derivation-step`. `be-43` is
  kind `bridge` on this same theorem. Both covers lines still begin with
  `derivation-step`. Not a minimal surface and not ER=EPR.
- `PhysJS.Shapiro.radial_integral`, a complete proof that
  `∫_{R_near}^{R_far} (2 G M / c³) (dr / r) = (2 G M / c³) ln(R_far / R_near)`
  for `0 < R_near < R_far` and `c ≠ 0`. The factor `1` in place of `2` is
  half that delay, once `G ≠ 0` and `M ≠ 0`. `log₁₀` of the radius ratio
  is not `ln`. It covers `be-37` (kind `bridge` on `radial_integral`;
  the covers line still begins with `derivation-step`), not the
  impact-parameter formula and not the Cassini measurement.
- `PhysJS.RandallSundrum.positive_tension`, a complete proof that for
  `σ > 0`, `ρ > 0`, and `G > 0`,
  `H²_RS − H²_FRW = (8πG/3) ρ² / (2σ) > 0`. The correction `1 + ρ/σ`
  fails, and `σ < 0` lies below the Friedmann value. The nested
  `flat_friedmann` theorem is the `c²` dictionary onto Physlib's
  `FirstOrderFriedmann` at `k = 0`. Dropping `c²` fails when `c² ≠ 1`
  and `Λ ≠ 0`. The limit `σ → ∞` is already the `be-19` reference. The
  formalRef of `be-54` is `brane_friedmann`, kind `bridge`. The covers
  line still begins with `derivation-step`. Not a derivation from the
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
  `T · Σ_active / (k_B T)`, with the `1` omitted, fails. It covers `be-27`
  (kind `bridge` on `sum_eq`; the covers line still begins with
  `derivation-step`), not the frequency-dependent
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
  `vacuum_density` and is not reproved. It covers that corollary of
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
  agrees, so the comparison assumes `T ≠ T₀`. The formalRef of `be-33` is
  `thermal_scaling`, kind `bridge`. The covers line still begins with
  `derivation-step`. Not Hertz–Millis theory and not a universality class.
- `PhysJS.TimeSymmetric.residual_iff`, a complete proof that when
  `A_ret + A_adv ≠ 0`, the residual
  `(A_ret − A_adv) / (A_ret + A_adv)` is `0` if and only if
  `A_ret = A_adv`. The encoded field is the half-sum
  `(A_ret + A_adv) / 2`, and twice that field is the residual's
  denominator. A fully retarded field, `A_adv = 0` with `A_ret ≠ 0`,
  gives residual `1`, not `0`. The id is contested, and this lemma
  does not decide the contest. The formalRef of `be-50` is
  `wheeler_feynman`, kind `bridge`. The covers line still begins with
  `derivation-step`. Not the absorber boundary condition as a theory of
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
  `σ`, and that flipped sum is negative. UPT kind is `property` on
  `nonneg`. The covers line still begins with `derivation-step`. Not the
  variational maximum-entropy-production principle. The catalog records
  this id as not-a-bridge, and this lemma does not decide that.
- `PhysJS.CompositeHiggs.scale_free`, a complete proof that for
  `f ≠ 0` and `θ = h/f`, `V(h) / f⁴ = −α sin²θ + β [sin⁴θ − sin²θ
  cos²θ]`. Both terms carry `f⁴`, so the ratio depends on `h` only
  through `θ`. The pre-correction first term `−α f² sin²θ`, divided
  by `f⁴`, is `−α sin²θ / f²`. It depends on `f`, and it agrees with
  `−α sin²θ` only when `f² = 1`. It covers `be-40` (kind `bridge` on
  `scale_free`; the covers line still begins with `derivation-step`),
  not SILH matching onto a confining theory. The catalog
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
  `ω₃⁰` fails when `ω₃⁰ ≠ 1`. It covers `be-63` (kind `bridge` on
  `prefactor`; the covers line still begins with `derivation-step`),
  not stellar rotation or magnetic support.
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
