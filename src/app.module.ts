import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

import { BloggersModule } from './bloggers/bloggers.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { UsersModule } from './users/users.module';
import { TestingClearModule } from './testing/testing-clear.module';
import { logger } from './middleware/logger.middleware';
import { CommentsController } from './comments/comments.controller';
import { PostsController } from './posts/posts.controller';
import { BloggersController } from './bloggers/bloggers.controller';
import { WalletsModule } from './wallets/wallets.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts/posts.service';
import { PostsRawSqlRepository } from './posts/posts.raw-sql-repository';
import { JwtService } from '@nestjs/jwt';
import { ReactionsRawSqlRepository } from './likes/reactions.raw-sql-repository';
import { ReactionsService } from './likes/reactions.service';
import { EmailAdapter } from './emails/email.adapter';
import { UsersService } from './users/users.service';
import { UsersRawSqlRepository } from './users/users.raw-sql-repository';
import { AuthService } from './auth/auth.service';
import { EmailService } from './emails/email.service';
import { EmailManager } from './emails/email.manager';
import { CommentsService } from './comments/comments.service';
import { CommentsRawSqlRepository } from './comments/comments.raw-sql-repository';
import { BloggersService } from './bloggers/bloggers.service';
import { BloggersRawSqlRepository } from './bloggers/bloggers.raw-sql-repository';
import { TestingClearService } from './testing/testing-clear.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: 5432,
      username: 'postgres',
      password: 'farce',
      database: 'Blog',
      autoLoadEntities: false,
      synchronize: false,
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'ec2-44-207-253-50.compute-1.amazonaws.com',
    //   port: 5432,
    //   // username: 'postgres',
    //   // database: 'Blog',
    //   url: process.env.DATABASE_URL,
    //   autoLoadEntities: true,
    //   synchronize: false,
    //   ssl: {
    //     rejectUnauthorized: false,
    //   },
    // }),
    AuthModule,
    BloggersModule,
    PostsModule,
    CommentsModule,
    UsersModule,
    TestingClearModule,
    // MongooseModule.forRoot(
    //   `mongodb+srv://thug:${process.env.MONGO_PASSWORD}@clusterblogg.gub0i.mongodb.net`,
    // ),

    WalletsModule,
  ],
  // providers: [
  //   PostsService,
  //   PostsRawSqlRepository,
  //   JwtService,
  //   ReactionsRawSqlRepository,
  //   ReactionsService,
  //   EmailAdapter,
  //   UsersService,
  //   UsersRawSqlRepository,
  //   AuthService,
  //   EmailService,
  //   EmailManager,
  //   CommentsService,
  //   CommentsRawSqlRepository,
  //   BloggersService,
  //   BloggersRawSqlRepository,
  //   TestingClearService,
  // ],
})
export class AppModule {}
