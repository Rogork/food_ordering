import { ObjectId } from "bson";
import crypto from 'node:crypto';

export function _id() {
    return new ObjectId().toHexString();
}

type ScryptParams = { N: number; r: number; p: number; saltLen: number; keyLen: number };
const DEFAULT: ScryptParams = { N: 16384, r: 8, p: 1, saltLen: 16, keyLen: 32 };

export const PasswordHashSync = {
  hash(password: string, params: Partial<ScryptParams> = {}): string {
    const p: ScryptParams = { ...DEFAULT, ...params };
    const salt = crypto.randomBytes(p.saltLen);
    const encoder = new TextEncoder();
    const key  = crypto.scryptSync(encoder.encode(password), salt, p.keyLen, { N: p.N, r: p.r, p: p.p, maxmem: 128 * 1024 * 1024 });
    return `scrypt$N=${p.N},r=${p.r},p=${p.p}$${salt.toString('base64')}$${key.toString('base64')}`;
  },
  verify(stored: string, password: string): boolean {
    const parts = stored.split('$');
    if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
    const kv = Object.fromEntries(parts[1].split(',').map(s => s.split('='))) as Record<string, string>;
    const params: ScryptParams = {
        N: Number(kv.N), r: Number(kv.r), p: Number(kv.p),
        saltLen: 0, keyLen: 0,
    };
    const salt = Buffer.from(parts[2], 'base64');
    const key  = Buffer.from(parts[3], 'base64');
    params.saltLen = salt.length;
    params.keyLen  = key.length;
    const derived = crypto.scryptSync(password, salt, key.length, { N: params.N, r: params.r, p: params.p, maxmem: 128 * 1024 * 1024 });
    return derived.length === key.length && crypto.timingSafeEqual(derived, key);
  },
};