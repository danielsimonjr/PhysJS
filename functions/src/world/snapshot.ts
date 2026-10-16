/**
 * `snapshot`, `restore` and `checksum`. A snapshot is the whole world, encoded
 * by one generic binary codec: numbers are stored as their exact float64 bits,
 * typed arrays verbatim, and maps and objects in insertion order, so a restored
 * world steps exactly like the original. The header records the format and the
 * `BODY_FIELDS` layout, and `restore` refuses a snapshot of another layout,
 * dimension or integrator. The checksum is 32-bit FNV-1a over the snapshot.
 * Bit-identical results across JS engines are MathTS #380.
 */

import { BODY_FIELDS, type World } from '@danielsimonjr/physjs-core';

const MAGIC = 'PHYSJS-SNAPSHOT';
/** Snapshot format version; bump it when the encoding or the world shape changes. */
export const SNAPSHOT_FORMAT = 1;

/** The value kinds the codec stores, one tag each. */
const TAGS = [
  'undefined',
  'number',
  'string',
  'boolean',
  'array',
  'object',
  'map',
  'Float64Array',
  'Uint32Array',
  'Uint8Array',
] as const;
type Tag = (typeof TAGS)[number];
const TAG_OF = new Map<Tag, number>(TAGS.map((tag, i) => [tag, i]));
const TYPED = {
  Float64Array: Float64Array,
  Uint32Array: Uint32Array,
  Uint8Array: Uint8Array,
} as const;
type TypedName = keyof typeof TYPED;

class Writer {
  private bytes = new Uint8Array(1024);
  private view = new DataView(this.bytes.buffer);
  length = 0;
  private reserve(n: number) {
    if (this.length + n <= this.bytes.length) return;
    let size = this.bytes.length * 2;
    while (size < this.length + n) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.bytes);
    this.bytes = next;
    this.view = new DataView(next.buffer);
  }
  u8(x: number) {
    this.reserve(1);
    this.view.setUint8(this.length++, x);
  }
  u32(x: number) {
    this.reserve(4);
    this.view.setUint32(this.length, x, true);
    this.length += 4;
  }
  f64(x: number) {
    this.reserve(8);
    this.view.setFloat64(this.length, x, true);
    this.length += 8;
  }
  raw(data: Uint8Array) {
    this.reserve(data.length);
    this.bytes.set(data, this.length);
    this.length += data.length;
  }
  result(): ArrayBuffer {
    return this.bytes.slice(0, this.length).buffer;
  }
}

class Reader {
  private view: DataView;
  private at = 0;
  constructor(private readonly bytes: Uint8Array) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  private need(n: number) {
    if (this.at + n > this.bytes.length) throw new RangeError('snapshot is truncated');
  }
  u8() {
    this.need(1);
    return this.view.getUint8(this.at++);
  }
  u32() {
    this.need(4);
    const x = this.view.getUint32(this.at, true);
    this.at += 4;
    return x;
  }
  f64() {
    this.need(8);
    const x = this.view.getFloat64(this.at, true);
    this.at += 8;
    return x;
  }
  raw(n: number) {
    this.need(n);
    const out = this.bytes.slice(this.at, this.at + n);
    this.at += n;
    return out;
  }
  get done() {
    return this.at === this.bytes.length;
  }
}

const text = new TextEncoder();
const untext = new TextDecoder();

function tagOf(value: unknown): Tag {
  if (value === undefined) return 'undefined';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Map) return 'map';
  for (const name of Object.keys(TYPED) as TypedName[])
    if (value instanceof TYPED[name]) return name;
  if (typeof value === 'object' && value !== null) return 'object';
  throw new TypeError(`snapshot cannot store a ${typeof value}`);
}

function write(w: Writer, value: unknown): void {
  const tag = tagOf(value);
  w.u8(TAG_OF.get(tag)!);
  switch (tag) {
    case 'undefined':
      return;
    case 'number':
      return w.f64(value as number);
    case 'boolean':
      return w.u8(value ? 1 : 0);
    case 'string': {
      const data = text.encode(value as string);
      w.u32(data.length);
      return w.raw(data);
    }
    case 'array':
      w.u32((value as unknown[]).length);
      for (const item of value as unknown[]) write(w, item);
      return;
    case 'map':
      w.u32((value as Map<unknown, unknown>).size);
      for (const [k, v] of value as Map<unknown, unknown>) {
        write(w, k);
        write(w, v);
      }
      return;
    case 'object': {
      const entries = Object.entries(value as object);
      w.u32(entries.length);
      for (const [k, v] of entries) {
        write(w, k);
        write(w, v);
      }
      return;
    }
    default: {
      const typed = value as Float64Array | Uint32Array | Uint8Array;
      w.u32(typed.length);
      w.raw(new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength));
    }
  }
}

function read(r: Reader): unknown {
  const tag = TAGS[r.u8()];
  switch (tag) {
    case 'undefined':
      return undefined;
    case 'number':
      return r.f64();
    case 'boolean':
      return r.u8() === 1;
    case 'string':
      return untext.decode(r.raw(r.u32()));
    case 'array':
      return Array.from({ length: r.u32() }, () => read(r));
    case 'map': {
      const n = r.u32();
      const map = new Map<unknown, unknown>();
      for (let i = 0; i < n; i++) map.set(read(r), read(r));
      return map;
    }
    case 'object': {
      const n = r.u32();
      const out: Record<string, unknown> = {};
      for (let i = 0; i < n; i++) out[read(r) as string] = read(r);
      return out;
    }
    case undefined:
      throw new RangeError('snapshot has an unknown value tag');
    default: {
      const Typed = TYPED[tag];
      const n = r.u32();
      const data = r.raw(n * Typed.BYTES_PER_ELEMENT);
      return new Typed(data.buffer, data.byteOffset, n);
    }
  }
}

/** What a snapshot header records. */
const header = (world: World) => ({
  magic: MAGIC,
  format: SNAPSHOT_FORMAT,
  fields: Object.keys(BODY_FIELDS).join(','),
  dims: world.dims,
  integrator: world.integrator,
});

/**
 * The whole world as bytes.
 *
 * ```ts
 * const saved = snapshot(world);
 * step(world, dt); // ...
 * restore(world, saved); // back to the saved state, exactly
 * ```
 */
export function snapshot(world: World): ArrayBuffer {
  const w = new Writer();
  write(w, header(world));
  write(w, { ...world });
  return w.result();
}

/**
 * Puts `world` back into the state recorded by `snapshot`. Throws a
 * `RangeError` for a snapshot of another format, body layout, dimension or
 * integrator, or one that does not decode.
 */
export function restore(world: World, data: ArrayBuffer | Uint8Array): void {
  const r = new Reader(data instanceof Uint8Array ? data : new Uint8Array(data));
  const saved = read(r) as Record<string, unknown>;
  const expected = header(world);
  for (const [key, value] of Object.entries(expected)) {
    if (saved?.[key] !== value) {
      throw new RangeError(
        `snapshot ${key} is ${String(saved?.[key])}; this world needs ${String(value)}`
      );
    }
  }
  const state = read(r) as Record<string, unknown>;
  if (!r.done) throw new RangeError('snapshot has trailing bytes');
  Object.assign(world, state);
}

/** 32-bit FNV-1a of the world's snapshot, as 8 hex digits. Equal worlds give equal checksums. */
export function checksum(world: World): string {
  const bytes = new Uint8Array(snapshot(world));
  let hash = 0x811c9dc5;
  for (const byte of bytes) hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
  return hash.toString(16).padStart(8, '0');
}
