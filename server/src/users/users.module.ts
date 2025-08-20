import { Database } from 'src/shared/database.service';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [Database, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
