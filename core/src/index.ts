/**
 * @danielsimonjr/physjs-core
 *
 * Core types, data catalogs and configuration for PhysJS. Units, constants and
 * all mathematics come from MathTS; nothing here redefines them.
 * See docs/design/PHYSICS_ENGINE_PLAN.md.
 *
 * @packageDocumentation
 */

declare const __PKG_VERSION__: string;

export const PACKAGE_NAME = '@danielsimonjr/physjs-core';
export const VERSION: string = __PKG_VERSION__;

export { BODY_FIELDS } from './catalog/body-fields';
export type {
  BodyFieldName,
  BodyFieldRecord,
  BodyFieldRole,
  DescriptorFieldName,
} from './catalog/body-fields';
export { BODY_TYPES } from './catalog/body-types';
export type { BodyTypeName, BodyTypeRecord } from './catalog/body-types';
export { COLLISION_CORES } from './catalog/collision-cores';
export type { CollisionCoreName, CollisionCoreRecord } from './catalog/collision-cores';
export { INTEGRATOR_CATALOG } from './catalog/integrators';
export type { IntegratorName, IntegratorRecord } from './catalog/integrators';
export { SHAPES } from './catalog/shapes';
export type { ShapeParamRecord, ShapeRecord, ShapeType } from './catalog/shapes';
export { VALUE_RULES } from './catalog/value-rules';
export type { ValueRule, ValueRuleRecord } from './catalog/value-rules';
export { COLLISION_DEFAULTS, SUPPORTED_DIMS, WORLD_DEFAULTS } from './config';
export type { CollisionDefaults, SupportedDims, WorldDefaults } from './config';
export type { BodyDescriptor, BodyHandle } from './types/body';
export type {
  ColliderDescriptor,
  ColliderHandle,
  ColliderRecord,
  ColliderStore,
} from './types/collider';
export type {
  Aabb,
  BroadphaseState,
  ContactManifold,
  ContactPoint,
  RayHit,
} from './types/collision';
export type { NumericInput, NumericOutput } from './types/numeric';
export type { BoxShape, CapsuleShape, ShapeDescriptor, SphereShape } from './types/shape';
export type { BodyStore, World, WorldOptions } from './types/world';
