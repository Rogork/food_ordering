import { ObjectId } from "bson";
import bcrypt from 'bcrypt';

export function _id() {
    return new ObjectId().toHexString();
}

export const PasswordHashSync = {
  hash(password: string): string {
    return password? bcrypt.hashSync(password, 10) : '';
  },
  verify(stored: string, password: string): boolean {
    return bcrypt.compareSync(password, stored);
  },
};