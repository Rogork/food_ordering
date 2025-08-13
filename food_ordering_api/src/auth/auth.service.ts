import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { type INewUser, UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async getDetails(token: string) {
    return await this.usersService.findUserBySessionToken(token);
  }

  async emailExists(email: string) {
    return await this.usersService.findOne(email) !== undefined;
  }

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    return result;
  }

  async register(newUser: INewUser): Promise<any> {
    if (await this.usersService.findOne(newUser.email) !== undefined) {
      throw new ConflictException();
    }
    const { password, ...result } = await this.usersService.insert(newUser);
    return result;
  }
}
