import { IUserSession } from "src/users/users.service";

declare module 'express-session' {
  interface SessionData {
    user?: UserModel|false;
    userSession?: IUserSession|false;
  }
}

export {};