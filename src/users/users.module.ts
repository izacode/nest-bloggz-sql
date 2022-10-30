import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from '../emails/email.service';
import { AuthService } from '../auth/auth.service';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersController } from './users.controller';
// import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailManager } from '../emails/email.manager';
import { EmailAdapter } from '../emails/email.adapter';
import { UsersRawSqlRepository } from './users.raw-sql-repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    EmailAdapter,
    UsersService,
    UsersRawSqlRepository,
    AuthService,
    EmailService,
    JwtService,
    EmailManager,
  ],
})
export class UsersModule {}
