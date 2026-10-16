/**
 * Event types, as data. `step` queues events in the world; `drainEvents`
 * returns and clears them. A `pair` event names two colliders and their
 * bodies; a `body` event names one body.
 */

import { deepFreeze } from './freeze';

/** One event type. */
export interface EventTypeRecord {
  /** Event `type` value. */
  readonly name: string;
  /** What the event is about. */
  readonly subject: 'pair' | 'body';
  /** When the event is queued. */
  readonly description: string;
}

/** Every event type, in the order `step` queues them. */
export const EVENT_TYPES = deepFreeze([
  { name: 'contactBegin', subject: 'pair', description: 'two colliders started touching' },
  { name: 'contactEnd', subject: 'pair', description: 'two colliders stopped touching' },
  { name: 'wake', subject: 'body', description: 'a sleeping body woke up' },
  { name: 'sleep', subject: 'body', description: 'a body came to rest and fell asleep' },
] as const satisfies readonly EventTypeRecord[]);

/** An event type name. */
export type EventTypeName = (typeof EVENT_TYPES)[number]['name'];
/** Names of the events about a collider pair. */
export type PairEventName = Extract<(typeof EVENT_TYPES)[number], { subject: 'pair' }>['name'];
/** Names of the events about one body. */
export type BodyEventName = Extract<(typeof EVENT_TYPES)[number], { subject: 'body' }>['name'];
