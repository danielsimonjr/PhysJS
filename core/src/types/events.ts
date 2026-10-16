/** Event records queued by `step` and returned by `drainEvents`. */

import type { BodyEventName, PairEventName } from '../catalog/events';
import type { BodyHandle } from './body';
import type { ColliderHandle } from './collider';

/** Two colliders started or stopped touching. */
export interface PairEvent {
  /** Event type. */
  readonly type: PairEventName;
  /** Lower collider handle of the pair. */
  readonly colliderA: ColliderHandle;
  /** Higher collider handle of the pair. */
  readonly colliderB: ColliderHandle;
  /** Body of `colliderA`. */
  readonly bodyA: BodyHandle;
  /** Body of `colliderB`. */
  readonly bodyB: BodyHandle;
}

/** A body fell asleep or woke up. */
export interface BodyEvent {
  /** Event type. */
  readonly type: BodyEventName;
  /** The body. */
  readonly body: BodyHandle;
}

/** Any event. */
export type PhysicsEvent = PairEvent | BodyEvent;
