import {
  compileExpr,
  evaluate,
  type PhysicsEvaluateOptions,
} from '@danielsimonjr/mathts-functions';

/**
 * PhysJS always compiles with MathTS physics mode.
 * Bare `e` is the elementary-charge scalar. `E` stays unbound.
 * Euler's number is `exp(x)`. An explicit scope entry for `e` wins.
 */
const physicsOptions = {
  physics: true,
  charge: 'scalar',
} satisfies PhysicsEvaluateOptions;

export function compilePhysicsExpr(expr: string) {
  return compileExpr(expr, physicsOptions);
}

export function physicsValue(expr: string, scope?: Record<string, unknown>) {
  return evaluate(expr, scope, physicsOptions);
}
