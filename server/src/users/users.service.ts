import { PasswordHashSync } from './../shared/password-sync.func';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { BASE_VIEWS, BaseModel } from 'src/shared/base.model';
import { BaseService } from 'src/shared/base.service';
import crypto from 'node:crypto';
import {
  DateField,
  Default,
  Password,
  Property,
  Required,
  StringField,
} from 'src/shared/decorators.utils';
import { _id } from 'src/shared/helpers.func';
import { asModelCtor, Model } from 'src/shared/meta.utils';
import { defineViews } from 'src/shared/projections.utils';

export interface IUserSession {
  sessionId: string;
  token: string;
  createdAt: Date;
  lastUsed: Date;
  ip?: string;
  device?: string;
  agent?: string;
}

export const USER_VIEWS = defineViews<_UserModel>()({
  ref: ['_id', 'name', 'email'] as const,
  public: ['_id', 'name', 'email', 'benefitNo'] as const,
  session: ['_id']
});

@Model({ table: 'users' })
export class _UserModel extends BaseModel {

  @Property()
  name: string;

  @Required()
  @Property()
  @StringField()
  email: string;

  @Property()
  @Password()
  password: string;

  @Property()
  @DateField()
  dob: Date;

  @Property()
  benefitNo: string;

  @Property()
  @Default([])
  sessions: IUserSession[];

  generateSession(sessionId: string, ip: string = '127.0.0.1', device: string = 'Unknown', agent: string = 'Unknown'): IUserSession {
    const session = {
      sessionId,
      token: crypto.randomBytes(64).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
      createdAt: new Date(),
      lastUsed: new Date(),
      ip,
      device,
      agent,
    } as IUserSession;
    return session;
  }

  destroySession(token: string) {
    const idx = _.findIndex(this.sessions, (session) => session.token === token);
    if (idx === -1) return false;
    return this.sessions.splice(idx, 1)?.[0];
  }

  views = () => USER_VIEWS;
}
export const UserModel = asModelCtor<_UserModel>(_UserModel);

@Injectable()
export class UsersService extends BaseService<_UserModel> {

  protected get Model() { return UserModel; }

  async findByEmail(email: string) {
    return this.findOne({ email });
  }

  async findUserBySessionToken(token: string) {
    const user = await this.findOne({ sessions: { $elemMatch: { token } } });
    if (user === null) return null;
    const session = _.find(user.sessions, (session) => session.token === token);
    return { user, session };
  }

  async findUserBySessionId(sessionId: string) {
    const user = await this.findOne({ sessions: { $elemMatch: { sessionId } } });
    if (user === null) return null;
    const session = _.find(user.sessions, (session) => session.sessionId === sessionId);
    return { user: user.view('public'), session };
  }

  async emailExists(email: string) {
    const count = await this.count({ email });
    return count !== 0;
  }

  async register(params: { email: string, name?: string, password: string }, ext: { sessionId: string, ip?: string, device?: string, agent?: string }) {
    const user = new UserModel(params);
    const session = user.generateSession(ext.sessionId, ext?.ip, ext?.device, ext?.agent);
    user.sessions.push(session);
    await this.create(user);
    return { user: _.omit(user, 'sessions'), session };
  }

  async signIn(email: string, password: string, ext: { sessionId: string, ip?: string, device?: string, agent?: string }) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found");
    if (!PasswordHashSync.verify(user.password, password)) throw "Passwsord mismatch";
    const session = user.generateSession(ext.sessionId, ext?.ip, ext?.device, ext?.agent);
    user.sessions.push(session);
    await this.update({ _id: user._id }, { $push: { sessions: session } });
    return { user: _.omit(user, 'sessions'), session };
  }

  async logout(token: string) {
    const resp = await this.findUserBySessionToken(token);
    if (!resp) throw new Error("User not found");
    await this.update({ _id: resp.user._id }, { $pull: { sessions: { token } } });
    return true;
  }
}
