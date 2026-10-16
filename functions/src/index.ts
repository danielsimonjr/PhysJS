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
  COLLISION_CORES,
  COLLISION_DEFAULTS,
  EVENT_TYPES,
  INTEGRATOR_CATALOG,
  JOINT_TYPES,
  MATERIAL_FIELDS,
  PACKAGE_NAME as CORE_PACKAGE_NAME,
  SHAPES,
  SOLVER_DEFAULTS,
  SUPPORTED_DIMS,
  VALUE_RULES,
  VERSION as CORE_VERSION,
  WORLD_DEFAULTS,
} from '@danielsimonjr/physjs-core';
export type {
  Aabb,
  BodyDescriptor,
  BodyEvent,
  BodyHandle,
  BodyTypeName,
  BoxShape,
  CapsuleShape,
  ColliderDescriptor,
  ColliderHandle,
  ColliderRecord,
  CollisionCoreName,
  CollisionDefaults,
  ContactManifold,
  ContactPoint,
  IntegratorName,
  JointDescriptor,
  JointHandle,
  JointRecord,
  JointTypeName,
  NumericInput,
  NumericOutput,
  PairEvent,
  PhysicsEvent,
  RayHit,
  ShapeDescriptor,
  SolverDefaults,
  SphereShape,
  World,
  WorldOptions,
} from '@danielsimonjr/physjs-core';

export const PACKAGE_NAME = '@danielsimonjr/physjs';
export const VERSION: string = __PKG_VERSION__;

export { colliderAabb } from './collision/broadphase';
export { findContacts } from './collision/contacts';
export type { ContactOptions } from './collision/contacts';
export { overlap, pointQuery, raycast } from './collision/queries';
export { validateShape } from './collision/shapes';
export { applyForce, applyTorque } from './dynamics/loads';
export type { LoadAdder } from './dynamics/loads';
export { isSleeping, wakeBody } from './dynamics/sleep';
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
export { addCollider, getCollider, removeCollider } from './world/colliders';
export { addJoint, getJoint, removeJoint } from './joints/joints';
export { createWorld } from './world/create-world';
export { drainEvents } from './world/events';
export { MAX_BODIES } from './world/handles';
export { SNAPSHOT_FORMAT, checksum, restore, snapshot } from './world/snapshot';
export { step } from './world/step';
