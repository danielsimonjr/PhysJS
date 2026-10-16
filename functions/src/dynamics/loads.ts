/**
 * Applied loads. Each accumulator column of `BODY_FIELDS` gets one adder; the
 * sums act on dynamic bodies at the next `step` and are then reset to zero.
 * Adding a load wakes a sleeping body.
 */

import {
  BODY_FIELDS,
  type BodyFieldName,
  type BodyHandle,
  type NumericInput,
  type World,
} from '@danielsimonjr/physjs-core';
import { requireSlot } from '../world/handles';
import { wakeSlot } from './sleep';
import { readWorldValue } from '../world/planar';

/** Adds a load to a body's accumulator for the next step. */
export type LoadAdder = (world: World, handle: BodyHandle, load: NumericInput) => void;

function loadAdder(name: BodyFieldName): LoadAdder {
  const field = BODY_FIELDS[name];
  return (world, handle, load) => {
    const slot = requireSlot(world.bodies, handle);
    const values = readWorldValue(world, name, load, field, field.planar);
    const column = world.bodies.fields[name];
    const offset = slot * field.components;
    for (let k = 0; k < field.components; k++)
      column[offset + k] = column[offset + k]! + values[k]!;
    wakeSlot(world, slot);
  };
}

/** Adds a world-frame force, N (`[fx, fy]` in 2-D), through the centre of mass. Only dynamic bodies respond. */
export const applyForce: LoadAdder = loadAdder('force');
/** Adds a world-frame torque, N m (`[tz]` about +z in 2-D). Only dynamic bodies respond. */
export const applyTorque: LoadAdder = loadAdder('torque');
