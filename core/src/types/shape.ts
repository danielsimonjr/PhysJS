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

/** A disc (2-D). */
export interface CircleShape {
  /** Shape type. */
  readonly type: 'circle';
  /** Radius, metres, > 0. */
  readonly radius: number;
}

/** A rectangle centred on the body frame (2-D). */
export interface RectangleShape {
  /** Shape type. */
  readonly type: 'rectangle';
  /** Half the size along each body axis, `[x, y]`, metres, each > 0. */
  readonly halfExtents: NumericInput;
}

/** A stadium along local +Y (2-D). */
export interface Capsule2dShape {
  /** Shape type. */
  readonly type: 'capsule2d';
  /** Radius of the caps, metres, > 0. */
  readonly radius: number;
  /** Half the length of the straight section, metres, > 0. */
  readonly halfHeight: number;
}

/** A convex polygon, counter-clockwise, with its centroid at the body origin (2-D). */
export interface PolygonShape {
  /** Shape type. */
  readonly type: 'polygon';
  /** Corners `[x, y]`, at least three. */
  readonly vertices: readonly NumericInput[];
}

/** Any shape in the `SHAPES` catalog. */
export type ShapeDescriptor =
  | SphereShape
  | BoxShape
  | CapsuleShape
  | CircleShape
  | RectangleShape
  | Capsule2dShape
  | PolygonShape;
