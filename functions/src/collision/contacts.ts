/** `findContacts`: broadphase pairs through the narrowphase into manifolds. */

import {
  COLLISION_DEFAULTS,
  type ColliderRecord,
  type ContactManifold,
  type World,
} from '@danielsimonjr/physjs-core';
import { readValue, rejectUnknownKeys, requireRecord } from '../world/validate';
import { sweepAndPrune } from './broadphase';
import { manifoldPoints, proximity } from './narrowphase';
import { bodyPose } from './pose';
import { shapeProxy, type Proxy } from './proxy';

/** What `findContacts` takes. */
export interface ContactOptions {
  /** Report pairs whose surfaces are at most this far apart, metres, >= 0. */
  readonly margin?: number;
}

const OPTION_KEYS: ReadonlySet<string> = new Set(['margin']);

/** The proxy of a collider in its body's current pose. */
export const colliderProxy = (world: World, collider: ColliderRecord): Proxy =>
  shapeProxy(collider.shape, bodyPose(world, collider.body));

/** Reads the contact margin from options, defaulting to `COLLISION_DEFAULTS.margin`. */
function readMargin(options: ContactOptions | undefined): number {
  if (options === undefined) return COLLISION_DEFAULTS.margin;
  requireRecord('contact options', options);
  rejectUnknownKeys('contact options', options, OPTION_KEYS);
  if (options.margin === undefined) return COLLISION_DEFAULTS.margin;
  return readValue('margin', options.margin, {
    components: 1,
    scalar: true,
    rule: 'nonNegative',
  })[0]!;
}

/**
 * Every contact in the world, one manifold per touching collider pair, sorted
 * by collider handles.
 *
 * ```ts
 * const ground = addBody(world, { type: 'static' });
 * addCollider(world, ground, { shape: { type: 'box', halfExtents: [10, 1, 10] }, density: 1 });
 * const ball = addBody(world, { type: 'dynamic', position: [0, 1.4, 0] });
 * addCollider(world, ball, { shape: { type: 'sphere', radius: 0.5 }, density: 1000 });
 * findContacts(world); // one manifold, normal [0, 1, 0], depth 0.1
 * ```
 *
 * Pairs come from sweep-and-prune; pairs on one body and pairs of two
 * non-dynamic bodies are skipped. Normals point from `colliderA` to `colliderB`.
 */
export function findContacts(world: World, options?: ContactOptions): ContactManifold[] {
  const margin = readMargin(options);
  const { byHandle } = world.colliders;
  const manifolds: ContactManifold[] = [];
  for (const [ha, hb] of sweepAndPrune(world, margin)) {
    const a = byHandle.get(ha)!;
    const b = byHandle.get(hb)!;
    const A = colliderProxy(world, a);
    const B = colliderProxy(world, b);
    const near = proximity(A, B);
    if (near.separation > margin) continue;
    const [nx, ny, nz] = near.normal;
    manifolds.push({
      colliderA: ha,
      colliderB: hb,
      bodyA: a.body,
      bodyB: b.body,
      normal: [nx!, ny!, nz!],
      points: manifoldPoints(A, B, near, margin),
    });
  }
  return manifolds;
}
