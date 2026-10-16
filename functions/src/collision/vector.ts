/**
 * Plain `[x, y, z]` views of the MathTS vector functions, typed for the
 * collision code. Every operation is MathTS; nothing is reimplemented here.
 * MathTS `subtract` rejects plain arrays (MathTS #384), so `sub` composes
 * `add` and `multiply`. Allocation-free kernels are MathTS #375.
 */

import {
  add as mathAdd,
  cross as mathCross,
  dot as mathDot,
  multiply as mathMultiply,
  norm as mathNorm,
} from '@danielsimonjr/mathts-functions';

/** A world- or local-frame 3-vector. */
export type Vec = readonly number[];

/** `a + b`. */
export const add = (a: Vec, b: Vec): number[] => mathAdd(a as number[], b as number[]) as number[];
/** `a * s`. */
export const scale = (a: Vec, s: number): number[] => mathMultiply(a as number[], s) as number[];
/** `a - b`. */
export const sub = (a: Vec, b: Vec): number[] => add(a, scale(b, -1));
/** `-a`. */
export const neg = (a: Vec): number[] => scale(a, -1);
/** `a . b`. */
export const dot = (a: Vec, b: Vec): number => mathDot(a as number[], b as number[]) as number;
/** `a x b`. */
export const cross = (a: Vec, b: Vec): number[] =>
  mathCross(a as number[], b as number[]) as number[];
/** Euclidean length. */
export const length = (a: Vec): number => mathNorm(a as number[]) as number;
/** `a / |a|`, or `undefined` when `|a|` is at most `tiny`. */
export function unit(a: Vec, tiny = 0): number[] | undefined {
  const l = length(a);
  return l > tiny ? scale(a, 1 / l) : undefined;
}
/** The world axes, used as fallback search directions. */
export const AXES: readonly Vec[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
