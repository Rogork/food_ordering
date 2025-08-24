import { ObjectId } from "bson";

export function _id() {
    return new ObjectId().toHexString();
}