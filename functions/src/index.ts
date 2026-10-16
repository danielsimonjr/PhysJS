/**
 * @danielsimonjr/physjs
 *
 * The public PhysJS package: worlds, bodies, applied loads and integration.
 * Free functions over plain data, named exports only, in the MathTS style.
 * Units, constants and mathematics come from MathTS. See
 * docs/design/PHYSICS_ENGINE_PLAN.md for the milestones.
 *
 * @packageDocumentation
 */

declare const __PKG_VERSION__: string;

export {
  BODY_FIELDS,
  BODY_TYPES,
  INTEGRATOR_CATALOG,
  PACKAGE_NAME as CORE_PACKAGE_NAME,
  SHAPES,
  SUPPORTED_DIMS,
  VALUE_RULES,
  VERSION as CORE_VERSION,
  WORLD_DEFAULTS,
} from '@danielsimonjr/physjs-core';
export type {
  BodyDescriptor,
  BodyHandle,
  BodyTypeName,
  BoxShape,
  CapsuleShape,
  IntegratorName,
  NumericInput,
  NumericOutput,
  ShapeDescriptor,
  SphereShape,
  World,
  WorldOptions,
} from '@danielsimonjr/physjs-core';

export const PACKAGE_NAME = '@danielsimonjr/physjs';
export const VERSION: string = __PKG_VERSION__;

export { validateShape } from './collision/shapes';
export { applyForce, applyTorque } from './dynamics/loads';
export type { LoadAdder } from './dynamics/loads';
export {
  addBody,
  bodyCount,
  getAngularVelocity,
  getBodyType,
  getLinearVelocity,
  getMass,
  getPosition,
  getRotation,
  hasBody,
  removeBody,
  setAngularVelocity,
  setLinearVelocity,
  setPosition,
  setRotation,
} from './world/bodies';
export type { FieldGetter, FieldSetter } from './world/bodies';
export { createWorld } from './world/create-world';
export { MAX_BODIES } from './world/handles';
export { step } from './world/step';
