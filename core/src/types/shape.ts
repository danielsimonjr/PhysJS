/** Shape records, matching the `SHAPES` catalog and fourJS's shape union. */

import type { NumericInput } from './numeric';

/** A ball. */
export interface SphereShape {
  /** Shape type. */
  readonly type: 'sphere';
  /** Radius, metres, > 0. */
  readonly radius: number;
}

/** A box centred on the body frame. */
export interface BoxShape {
  /** Shape type. */
  readonly type: 'box';
  /** Half the size along each body axis, metres, each > 0. */
  readonly halfExtents: NumericInput;
}

/** A capsule along local +Y. Total height is `2 * (halfHeight + radius)`. */
export interface CapsuleShape {
  /** Shape type. */
  readonly type: 'capsule';
  /** Radius of the caps and the cylinder, metres, > 0. */
  readonly radius: number;
  /** Half the length of the cylindrical section only, metres, > 0. */
  readonly halfHeight: number;
}

/** Any shape in the `SHAPES` catalog. */
export type ShapeDescriptor = SphereShape | BoxShape | CapsuleShape;
