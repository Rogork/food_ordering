import bcrypt from 'bcrypt';

const BCRYPT_RE = /^\$2[abxy]\$(\d{2})\$[./A-Za-z0-9]{53}$/;

export const PasswordHashSync = {
  isHash(str: unknown): str is string {
    if (typeof str !== 'string') return false;
    const m = str.match(BCRYPT_RE);
    if (!m) return false;
    const cost = parseInt(m[1], 10);
    return cost >= 4 && cost <= 31 && str.length === 60;
  },
  hash(password: string): string {
    return password ? bcrypt.hashSync(password, 10) : '';
  },
  verify(stored: string, password: string): boolean {
    return bcrypt.compareSync(password, stored);
  },
};