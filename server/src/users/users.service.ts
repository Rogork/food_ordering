import { PasswordHashSync } from './../shared/password-sync.func';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { BaseService } from 'src/shared/base.service';
import { Database } from 'src/shared/database.service';
import {
  Default,
  Password,
  Property,
  Required,
} from 'src/shared/decorators.utils';
import { _id } from 'src/shared/helpers.func';
import { asModelCtor, Model, ModelCtor } from 'src/shared/meta.utils';

export interface IUserSession {
  token: string;
  createdAt: Date;
  lastUsed: Date;
  ip?: string;
  device?: string;
  agent?: string;
}
@Model({ table: 'users' })
export class _UserModel {
  @Property()
  name: string;

  @Property()
  @Required()
  email: string;

  @Property()
  @Password()
  password: string;

  @Property()
  @Default([])
  sessions: IUserSession[];

  generateSession(ip: string = '127.0.0.1', device: string = 'Unknown', agent: string = 'Unknown'): IUserSession {
    const session = {
      token: _id(),
      createdAt: new Date(),
      lastUsed: new Date(),
      ip,
      device,
      agent,
    };
    this.sessions.push(session);
    return session;
  }

  destroySession(token: string) {
    const idx = _.findIndex(this.sessions, (session) => session.token === token);
    if (idx === -1) return false;
    this.sessions.splice(idx, 1);
    return true;
  }
}
export const UserModel = asModelCtor<_UserModel>(_UserModel);

@Injectable()
export class UsersService extends BaseService<_UserModel> {

  protected get Model() { return UserModel; }

  async findByEmail(email: string) {
    return this.findOne({ email });
  }

  async findUserBySessionToken(token: string) {
    return this.findOne({ sessions: { $elemMatch: { token }}});
  }

  async emailExists(email: string) {
    const count = await this.count({ email });
    return count !== 0;
  }

  async register(params: Partial<Omit<_UserModel, '_id'|'createdAt'>>) {
    const user = new UserModel(params);
    return this.create(user);
  }

  async signIn(email: string, password: string, ext?: { ip: string, device: string, agent: string}) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found");
    if (!PasswordHashSync.verify(user.password, password)) throw new Error("Password mismatch");
    const session = user.generateSession(ext?.ip, ext?.device, ext?.agent);
    return { user, session };
  }

  async logout(token: string) {
    const user = await this.findUserBySessionToken(token);
    if (!user) throw new Error("User not found");

  }
}
