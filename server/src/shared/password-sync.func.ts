import crypto from 'node:crypto';

type ScryptParams = { N: number; r: number; p: number; saltLen: number; keyLen: number };
const DEFAULT: ScryptParams = { N: 16384, r: 8, p: 1, saltLen: 16, keyLen: 32 };

function encode(hash: Buffer, salt: Buffer, p: ScryptParams): string {
  return `scrypt$N=${p.N},r=${p.r},p=${p.p}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function decode(stored: string): { params: ScryptParams; salt: Buffer; key: Buffer } | null {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return null;
  const kv = Object.fromEntries(parts[1].split(',').map(s => s.split('='))) as Record<string,string>;
  const params: ScryptParams = {
    N: Number(kv.N), r: Number(kv.r), p: Number(kv.p),
    saltLen: 0, keyLen: 0, // not encoded; inferred from buffers below
  };
  const salt = Buffer.from(parts[2], 'base64');
  const key  = Buffer.from(parts[3], 'base64');
  params.saltLen = salt.length;
  params.keyLen  = key.length;
  return { params, salt, key };
}

export const PasswordHashSync = {
  hash(password: string, params: Partial<ScryptParams> = {}): string {
    const p: ScryptParams = { ...DEFAULT, ...params };
    const salt = crypto.randomBytes(p.saltLen);
    const key  = crypto.scryptSync(password, salt, p.keyLen, { N: p.N, r: p.r, p: p.p, maxmem: 128 * 1024 * 1024 });
    return encode(key, salt, p);
  },
  verify(stored: string, password: string): boolean {
    const parsed = decode(stored);
    if (!parsed) return false;
    const { params, salt, key: expected } = parsed;
    const derived = crypto.scryptSync(password, salt, expected.length, { N: params.N, r: params.r, p: params.p, maxmem: 128 * 1024 * 1024 });
    return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
  },
};