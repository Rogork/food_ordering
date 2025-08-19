import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { Database } from 'src/shared/database.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, Database],
})
export class AuthModule {}
