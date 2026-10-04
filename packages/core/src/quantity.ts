import { Unit } from '@danielsimonjr/mathts-units';

/** Instance returned by MathTS `Unit.parse` and `Unit.toSI`. */
export type UnitInstance = ReturnType<typeof Unit.parse>;

/**
 * A physical quantity whose value is a MathTS `Unit`.
 * Conversion is `toSI` and `to` on that unit. This type does not evaluate a law.
 */
export class Quantity {
  readonly unit: UnitInstance;

  constructor(unit: UnitInstance) {
    this.unit = unit;
  }

  toSI(): Quantity {
    return new Quantity(this.unit.toSI());
  }

  to(unit: string): Quantity {
    return new Quantity(this.unit.to(unit));
  }
}

/** Parse a MathTS unit literal, for example `25degC`. */
export function quantity(literal: string): Quantity {
  return new Quantity(Unit.parse(literal));
}
