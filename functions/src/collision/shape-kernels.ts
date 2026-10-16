/**
 * The shape kernel table: one kernel per `SHAPES` type, 3-D (`kernels.ts`) and
 * 2-D (`kernels2d.ts`). The mapped type makes the compiler require every row.
 */

import type { ShapeDescriptor, ShapeType } from '@danielsimonjr/physjs-core';
import { BOX_KERNEL, CAPSULE_KERNEL, SPHERE_KERNEL, type ShapeKernel } from './kernels';
import { KERNELS_2D } from './kernels2d';

/** One kernel per `SHAPES` type. */
export const SHAPE_KERNELS: {
  readonly [T in ShapeType]: ShapeKernel<ShapeDescriptor & { type: T }>;
} = { sphere: SPHERE_KERNEL, capsule: CAPSULE_KERNEL, box: BOX_KERNEL, ...KERNELS_2D };

/** The kernel of a shape, typed for that shape. */
export const kernelOf = (shape: ShapeDescriptor): ShapeKernel<ShapeDescriptor> =>
  SHAPE_KERNELS[shape.type] as ShapeKernel<ShapeDescriptor>;
