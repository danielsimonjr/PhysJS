/** `findContacts`: broadphase pairs through the narrowphase into manifolds. */

import {
  COLLISION_DEFAULTS,
  type ColliderRecord,
  type ContactManifold,
  type ContactPoint,
  type World,
} from '@danielsimonjr/physjs-core';
import { readValue, rejectUnknownKeys, requireRecord } from '../world/validate';
import { isPlanar } from '../world/planar';
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
    const planar = isPlanar(world);
    const points = manifoldPoints(A, B, near, margin);
    const [nx, ny, nz] = planar ? planarNormal(near.normal) : near.normal;
    manifolds.push({
      colliderA: ha,
      colliderB: hb,
      bodyA: a.body,
      bodyB: b.body,
      normal: [nx!, ny!, nz!],
      points: planar ? planarPoints(points) : points,
    });
  }
  return manifolds;
}

/** Points closer than this in the plane are one 2-D contact, metres. */
const PLANAR_MERGE = 1e-6;

/** A 2-D normal lies in the plane: drop z and renormalize (a prism cap never touches in 2-D). */
function planarNormal(normal: readonly number[]): number[] {
  const len = Math.hypot(normal[0]!, normal[1]!);
  return len > 0 ? [normal[0]! / len, normal[1]! / len, 0] : [...normal];
}

/** Flattens prism contacts onto z = 0; each merged pair keeps its deepest point. */
function planarPoints(points: readonly ContactPoint[]): ContactPoint[] {
  const out: ContactPoint[] = [];
  for (const point of points) {
    const [x, y] = point.position;
    const twin = out.findIndex(
      (p) => Math.hypot(p.position[0] - x, p.position[1] - y) <= PLANAR_MERGE
    );
    const flat: ContactPoint = { position: [x, y, 0], depth: point.depth };
    if (twin < 0) out.push(flat);
    else if (point.depth > out[twin]!.depth) out[twin] = flat;
  }
  return out;
}
