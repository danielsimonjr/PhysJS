/** Shape checks, generated from the `SHAPES` catalog. */

import { SHAPES, type ShapeDescriptor, type ShapeRecord } from '@danielsimonjr/physjs-core';
import { readValue, rejectUnknownKeys, requireRecord } from '../world/validate';

/** Each shape row with the descriptor keys it allows. */
const BY_TYPE = new Map<string, { record: ShapeRecord; keys: ReadonlySet<string> }>(
  SHAPES.map((record) => [
    record.type,
    { record, keys: new Set(['type', ...Object.keys(record.params)]) },
  ])
);

/**
 * Checks a shape against its `SHAPES` row: a known type, exactly that row's
 * parameters, and every number within its rule. Throws a `TypeError` or
 * `RangeError` naming the parameter.
 */
export function validateShape(shape: ShapeDescriptor): void {
  requireRecord('shape', shape);
  const entry = BY_TYPE.get(shape.type);
  if (entry === undefined) {
    const known = SHAPES.map((row) => row.type).join(', ');
    throw new RangeError(`shape type must be one of ${known}; got ${String(shape.type)}`);
  }
  const { record, keys } = entry;
  rejectUnknownKeys(`${record.type} shape`, shape, keys);
  for (const [name, schema] of Object.entries(record.params)) {
    readValue(
      `${record.type}.${name}`,
      (shape as unknown as Record<string, unknown>)[name],
      schema
    );
  }
}
