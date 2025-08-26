import _ from 'lodash';

/** Strip functions from shapes */
export type NonFunctionPropertyNames<T> = {
  [K in keyof T]-?: T[K] extends Function ? never : K
}[keyof T];

/** Recursively build dot-paths for object-ish properties (arrays use "items.field") */
type Primitive = string | number | boolean | bigint | symbol | null | undefined | Date | RegExp;
type Objish = Record<string, any>;
type IsObj<T> = T extends Primitive ? false : T extends any[] ? (T[number] extends Primitive ? false : true) : T extends Objish ? true : false;
export type DotPath<T> =
  // shallow keys
  | Extract<keyof T, string>
  // nested keys: K.Nested...
  | {
    [K in Extract<keyof T, string>]:
    IsObj<T[K]> extends true
    ? `${K}.${DotPath<T[K]>}` // object or array element object
    : never
  }[Extract<keyof T, string>];

/** Define views with full type inference (top-level or nested dot paths) */
export function defineViews<T>() {
  return <V extends Record<string, readonly DotPath<T>[]>>(v: V) => v;
}

/** Build an inclusion projection usable by MongoDB & NeDB (supports dotted paths) */
export function toProjection<T>(
  paths: readonly DotPath<T>[],
  opts?: { id?: 0 | 1 }, // { id: 0 } to exclude _id
): Record<string, 0 | 1> {
  const p: Record<string, 0 | 1> = {};
  for (const k of paths) p[k as string] = 1;
  if (opts?.id === 0) p._id = 0;
  return p;
}

/** In-memory projection that mirrors Mongo inclusion semantics (supports arrays) */
export function projectDocDeep<T>(doc: T, paths: readonly DotPath<T>[]): Partial<T> {
  const out: any = {};

  for (const path of paths) {
    const segs = (path as string).split('.');
    assignProjected(doc as any, out, segs, 0);
  }

  return out;
}

/**
 * Recursively assign from src into dst along segs.
 * - If a segment resolves to an array in src, we "fan out":
 *   dst[key] becomes an array with the same length and we continue projecting
 *   into each element using the remaining segments.
 * - For objects, we descend creating objects as needed.
 * - On the last segment, we write the primitive/object as-is.
 */
function assignProjected(src: any, dst: any, segs: string[], i: number): void {
  if (src == null) return;
  const key = segs[i];

  // terminal segment → write value if defined
  if (i === segs.length - 1) {
    const val = src[key];
    if (val !== undefined) {
      // If the source at this segment is an array, copy the array shallowly.
      if (Array.isArray(val)) {
        dst[key] = val.map((v) => v);
      } else {
        dst[key] = val;
      }
    }
    return;
  }

  // non-terminal
  const next = src[key];
  if (next == null) return;

  if (Array.isArray(next)) {
    // ensure array at dst[key]
    if (!Array.isArray(dst[key])) dst[key] = [];
    const arrOut = dst[key] as any[];

    const restIndex = i + 1;
    for (let idx = 0; idx < next.length; idx++) {
      const el = next[idx];
      // ensure object at dst[key][idx]
      if (arrOut[idx] == null || typeof arrOut[idx] !== 'object') arrOut[idx] = {};
      assignProjected(el, arrOut[idx], segs, restIndex);
    }
  } else if (_.isObject(next)) {
    // ensure object at dst[key]
    if (dst[key] == null || typeof dst[key] !== 'object') dst[key] = {};
    assignProjected(next, dst[key], segs, i + 1);
  } else {
    // primitive encountered before path ends → nothing to assign
    return;
  }
}