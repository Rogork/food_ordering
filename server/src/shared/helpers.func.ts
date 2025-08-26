import { ObjectId } from "bson";
import _ from "lodash";

export function _id() {
    return new ObjectId().toHexString();
}

export function generateCode(len: number = 6) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for(let i = 0; i < len; i++) {
        result += charset[_.random(charset.length-1, false)];
    }
    return result;
}