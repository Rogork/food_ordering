import { Injectable } from '@nestjs/common';
import { ObjectId } from 'bson';

export interface IUserSession {
  _id: ObjectId;
  token: string;
  createdAt: Date;
  lastUsed: Date;
  ip?: string;
  device?: string;
  agent?: string;
}

export interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  sessions?: IUserSession[];
}

export interface INewUser extends Omit<IUser, '_id' | 'createdAt'> {}

@Injectable()
export class UsersService {
  private users: IUser[] = [
    {
      _id: new ObjectId(),
      name: 'john',
      email: 'john@email.com',
      password: 'changeme',
      createdAt: new Date(),
      sessions: [],
    },
    {
      _id: new ObjectId(),
      name: 'maria',
      email: 'maria@email.com',
      password: 'guess',
      createdAt: new Date(),
      sessions: [],
    },
  ];

  async findOne(email: string): Promise<IUser | undefined> {
    return new Promise((resolve) => {
      resolve(this.users.find((user) => user.email === email));
    });
  }

  generateSession(ip: string = '127.0.0.1', device: string = 'Unknown', agent: string = 'Unknown'): IUserSession {
    return {
      _id: new ObjectId(),
      token: new ObjectId().toHexString(),
      createdAt: new Date(),
      lastUsed: new Date(),
      ip,
      device,
      agent,
    }
  }

  async findUserBySessionToken(token: string): Promise<IUser | undefined> {
    return new Promise((resolve) => {
      for(const user of this.users) {
        for(const session of user.sessions ?? []) {
          if (session.token === token) return resolve(user);
        }
      }
      resolve(undefined);
    });
  }

  async insert(user: INewUser) {
    const newUser = {
      _id: new ObjectId(),
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: new Date(),
      sessions: [],
    };
    this.users.push(newUser);
    return newUser;
  }

  async createSession(email: string) {
    return new Promise(async (resolve, reject) => {
      const user = await this.findOne(email);
      if (user === undefined) return reject();
      const session = this.generateSession();
      if (user.sessions === undefined) user.sessions = [];
      user.sessions.push(session);
      resolve(session);
    });
  }
}
