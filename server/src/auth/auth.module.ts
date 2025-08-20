import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { Database } from 'src/shared/database.service';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [UsersService, Database],
})
export class AuthModule {}
