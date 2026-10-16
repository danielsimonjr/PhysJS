import { describe, expect, it } from 'bun:test';
import { validateShape, type ShapeDescriptor } from '../src/index';

describe('validateShape', () => {
  it('accepts every core shape with valid parameters', () => {
    expect(() => validateShape({ type: 'sphere', radius: 0.5 })).not.toThrow();
    expect(() => validateShape({ type: 'box', halfExtents: [1, 2, 3] })).not.toThrow();
    expect(() =>
      validateShape({ type: 'box', halfExtents: new Float64Array([1, 1, 1]) })
    ).not.toThrow();
    expect(() => validateShape({ type: 'capsule', radius: 0.25, halfHeight: 1 })).not.toThrow();
  });

  it('rejects unknown types, missing, extra and out-of-range parameters', () => {
    expect(() => validateShape({ type: 'torus' } as unknown as ShapeDescriptor)).toThrow(
      RangeError
    );
    expect(() => validateShape({ type: 'sphere' } as unknown as ShapeDescriptor)).toThrow(
      /sphere\.radius/
    );
    expect(() => validateShape({ type: 'sphere', radius: 0 })).toThrow(RangeError);
    expect(() => validateShape({ type: 'box', halfExtents: [1, 2] })).toThrow(TypeError);
    expect(() => validateShape({ type: 'box', halfExtents: [1, -2, 3] })).toThrow(
      /halfExtents\[1\]/
    );
    expect(() =>
      validateShape({ type: 'capsule', radius: 1, halfHeight: 1, height: 3 } as ShapeDescriptor)
    ).toThrow(/height/);
    expect(() => validateShape(null as unknown as ShapeDescriptor)).toThrow(TypeError);
  });
});
