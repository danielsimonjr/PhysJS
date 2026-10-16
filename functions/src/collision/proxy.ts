/**
 * Collision proxies: a shape placed in the world, seen by the narrowphase only
 * through its core kind, radius, support and features. Colliders, query shapes
 * and query points all become proxies, so one narrowphase serves all of them.
 */

import {
  COLLISION_CORES,
  SHAPES,
  type CollisionCoreName,
  type ShapeDescriptor,
} from '@danielsimonjr/physjs-core';
import { kernelOf } from './kernels';
import { directionToLocal, pointToWorld, type Pose } from './pose';
import type { Vec } from './vector';

/** A shape in the world frame. */
export interface Proxy {
  /** The core kind, from the `SHAPES` row. */
  readonly core: CollisionCoreName;
  /** Radius swept around the core. */
  readonly radius: number;
  /** A point inside the core, used to seed searches. */
  readonly center: readonly number[];
  /** The core point farthest along world direction `d`. */
  support(d: Vec): number[];
  /** The core feature facing world direction `d`, world frame. */
  feature(d: Vec): number[][];
  /** Ends of an analytic core, world frame. */
  readonly ends?: readonly [number[], number[]] | undefined;
}

const CORE_OF = new Map<string, CollisionCoreName>(SHAPES.map((row) => [row.type, row.core]));
const ANALYTIC = new Map<string, boolean>(COLLISION_CORES.map((row) => [row.name, row.analytic]));

/** Whether a core kind is handled by the analytic narrowphase. */
export const isAnalytic = (core: CollisionCoreName): boolean => ANALYTIC.get(core)!;

/** The proxy of `shape` placed at `pose`. */
export function shapeProxy(shape: ShapeDescriptor, pose: Pose): Proxy {
  const kernel = kernelOf(shape);
  const core = CORE_OF.get(shape.type)!;
  const ends = isAnalytic(core) ? kernel.ends?.(shape) : undefined;
  return {
    core,
    radius: kernel.radius(shape),
    center: pose.position,
    support: (d) => pointToWorld(pose, kernel.support(shape, directionToLocal(pose, d))),
    feature: (d) =>
      kernel.feature(shape, directionToLocal(pose, d)).map((p) => pointToWorld(pose, p)),
    ends: ends && [pointToWorld(pose, ends[0]), pointToWorld(pose, ends[1])],
  };
}

/** The proxy of a single world point (radius 0). */
export function pointProxy(point: Vec): Proxy {
  const p = Array.from(point);
  return {
    core: 'point',
    radius: 0,
    center: p,
    support: () => [...p],
    feature: () => [[...p]],
    ends: [[...p], [...p]],
  };
}
