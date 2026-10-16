/** Plain numeric inputs and outputs shared by every PhysJS record. */

/** A vector or quaternion given as numbers: an array or a typed array. */
export type NumericInput = ArrayLike<number>;

/** A caller-supplied output buffer: an array or a typed array. */
export interface NumericOutput {
  [index: number]: number;
  readonly length: number;
}
