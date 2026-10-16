/**
 * Collider records. Field names follow fourJS's `ColliderDescriptor`; 0.1
 * colliders sit at the body origin, aligned with the body axes.
 */

import type { BodyHandle } from './body';
import type { ShapeDescriptor } from './shape';

/** Opaque collider handle, unique within its world. */
export type ColliderHandle = number & { readonly __physjsBrand: 'ColliderHandle' };

/** What `addCollider` takes. */
export interface ColliderDescriptor {
  /** Collision shape, centred on the body origin. */
  readonly shape: ShapeDescriptor;
  /** Mass per unit volume, kg/m^3, > 0. */
  readonly density: number;
  /** Coulomb friction coefficient, >= 0. Defaults to `MATERIAL_FIELDS.friction`. */
  readonly friction?: number;
  /** Restitution from 0 to 1. Defaults to `MATERIAL_FIELDS.restitution`. */
  readonly restitution?: number;
}

/** A stored collider and its mass properties from MathTS `massProperties`. */
export interface ColliderRecord {
  /** Body the collider is attached to. */
  readonly body: BodyHandle;
  /** Validated copy of the shape. */
  readonly shape: ShapeDescriptor;
  /** Density, kg/m^3. */
  readonly density: number;
  /** Mass, kg. */
  readonly mass: number;
  /** Principal moments about the body origin, kg m^2. */
  readonly inertia: readonly [number, number, number];
  /** Friction coefficient. */
  readonly friction: number;
  /** Restitution. */
  readonly restitution: number;
}

/** Colliders of a world, keyed by handle. */
export interface ColliderStore {
  /** Next handle to hand out. */
  next: number;
  /** Live colliders. */
  readonly byHandle: Map<ColliderHandle, ColliderRecord>;
}
