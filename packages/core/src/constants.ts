/**
 * CODATA 2018 and exact-SI constants.
 *
 * The export expressions match UPT `src/core/constants.ts` character for
 * character, so each name is the same IEEE value. `HBAR_SI` is the quotient
 * `H_SI / (2π)`. `GM_SUN_SI` is the IAU nominal solar mass parameter, not
 * `G_SI * M_SUN_SI`.
 */

/** Speed of light in vacuum (m/s). Exact SI definition since 1983. */
export const C_SI = 299792458;

/** Newtonian gravitational constant (m³ kg⁻¹ s⁻²). CODATA 2018. */
// prettier-ignore
export const G_SI = 6.67430e-11;

/** Planck constant (J·s). Exact SI definition since 2019. */
export const H_SI = 6.62607015e-34;

/**
 * Reduced Planck constant h/(2π) (J·s). Exact, from the 2019 SI definition of
 * h. The CODATA display `1.054571817e-34` is that quotient truncated; it is
 * smaller by a relative `6.127e-10`. Planck units below stay the published
 * CODATA 2018 values, which were computed from the truncated display.
 */
export const HBAR_SI = H_SI / (2 * Math.PI);

/** Boltzmann constant (J/K). Exact SI definition since 2019. */
export const K_B_SI = 1.380649e-23;

/** Elementary charge (C). Exact SI definition since 2019. */
export const E_SI = 1.602176634e-19;

/** Fine-structure constant α (dimensionless). CODATA 2018. */
export const ALPHA = 7.2973525693e-3;

/** Planck mass √(ℏc/G) (kg). CODATA 2018. */
export const M_P_SI = 2.176434e-8;

/** Planck length √(ℏG/c³) (m). CODATA 2018. */
export const L_P_SI = 1.616255e-35;

/** Planck time √(ℏG/c⁵) (s). CODATA 2018. */
export const T_P_SI = 5.391247e-44;

/**
 * Hubble parameter H₀ (s⁻¹).
 *
 * Planck 2018 TT,TE,EE+lowE+lensing best estimate: 67.4 km/s/Mpc, converted
 * to SI using 1 Mpc = 3.0857×10²² m.
 */
export const H0_SI = 67.4e3 / 3.0857e22;

/**
 * Solar mass (kg). IAU 2015 nominal value rounded to the
 * conventional literal.
 */
export const M_SUN_SI = 1.989e30;

/**
 * Nominal solar gravitational parameter (GM)☉ (m³ s⁻²), IAU 2015 Resolution B3.
 *
 * The product GM☉ is known to about 10 significant digits, while G alone is
 * known to about 5, so a confrontation that needs GM☉ takes this value rather
 * than `G_SI × M_SUN_SI`.
 */
export const GM_SUN_SI = 1.3271244e20;

/** Where {@link GM_SUN_SI} comes from. */
export const GM_SUN_SOURCE =
  'IAU 2015 Resolution B3, nominal solar mass parameter (GM)☉ = 1.3271244e20 m³ s⁻²';

/** Electron mass (kg). CODATA 2018. */
export const M_E_SI = 9.1093837015e-31;

/**
 * Proton mass (kg). CODATA 2018. Not the Planck mass `M_P_SI`.
 */
export const M_PROTON_SI = 1.67262192369e-27;

/** Avogadro constant (mol⁻¹). Exact in the 2019 SI. */
export const N_A_SI = 6.02214076e23;

/** Faraday constant (C·mol⁻¹), `N_A * e`. */
export const FARADAY_SI = N_A_SI * E_SI;

/** Wien displacement-law constant b = λ_max·T (m·K). CODATA 2018. */
export const B_WIEN_SI = 2.897771955e-3;

/** Unified atomic mass unit (kg). CODATA 2018 atomic mass constant. */
// prettier-ignore
export const M_U_SI = 1.66053906660e-27;
