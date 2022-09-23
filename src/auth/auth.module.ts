import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailAdapter } from '../emails/email.adapter';
import { EmailManager } from '../emails/email.manager';
import { EmailService } from '../emails/email.service';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersRepository } from '../users/users.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AttemptsMiddleware } from '../middleware/attempts.middleware';
import { Attempt, AttemptSchema } from '../schemas/attempt.schema';
import { LocalStrategy } from './strategies/local.strategy';
// import { JwtService } from './application/jwt.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { UsersRawSqlRepository } from '../users/users.raw-sql-repository';
import { AttemptsRawSqlMiddleware } from '../middleware/attempts.raw-sql-middleware';

@Module({
  imports: [PassportModule, JwtModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    UsersRawSqlRepository,
    UsersService,
    EmailManager,
    EmailAdapter,
    ConfigService,
    LocalStrategy,
    JwtStrategy,
    BasicStrategy,
  ],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AttemptsRawSqlMiddleware)
      .forRoutes(
        'auth/login',
        'auth/registration',
        'auth/registration-confirmation',
        'auth/registration-email-resending',
      );
  }
}
