/**
 * PhysJS core: SI constants, a quantity that carries a MathTS unit, and the
 * physics binding for `e`, `E`, and `exp`. No domain formula is exported.
 */
export const packageName = '@danielsimonjr/physjs-core' as const;

export {
  ALPHA,
  B_WIEN_SI,
  C_SI,
  E_SI,
  FARADAY_SI,
  G_SI,
  GM_SUN_SI,
  GM_SUN_SOURCE,
  H0_SI,
  HBAR_SI,
  H_SI,
  K_B_SI,
  L_P_SI,
  M_E_SI,
  M_P_SI,
  M_PROTON_SI,
  M_SUN_SI,
  M_U_SI,
  N_A_SI,
  T_P_SI,
} from './constants';

export { Quantity, quantity, type UnitInstance } from './quantity';
export { compilePhysicsExpr, physicsValue } from './expr';
