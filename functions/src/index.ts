/**
 * @danielsimonjr/physjs
 *
 * The public PhysJS package. dynamics/, collision/ and constraints/ arrive as
 * directories here from 0.1.0 (docs/design/PHYSICS_ENGINE_PLAN.md).
 * 0.0.0 is the skeleton only.
 *
 * @packageDocumentation
 */

declare const __PKG_VERSION__: string;

export {
  PACKAGE_NAME as CORE_PACKAGE_NAME,
  VERSION as CORE_VERSION,
} from '@danielsimonjr/physjs-core';

export const PACKAGE_NAME = '@danielsimonjr/physjs';
export const VERSION: string = __PKG_VERSION__;
