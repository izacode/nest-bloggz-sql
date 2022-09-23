import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
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



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'ec2-3-93-206-109.compute-1.amazonaws.com',
      port: 5432,
      username: 'zyufqgjelilcdl',
      // username: 'postgres',
      password: process.env.DATABASE_PASSWORD,
      database: 'dcvimirjgmvo3l',
      // database: 'Blog',
      url: process.env.DATABASE_URL,
      autoLoadEntities: false,
      synchronize: false,
    }),
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
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(logger)
  //     .exclude(
  //       { path: 'comments/:id', method: RequestMethod.PUT },
  //       { path: 'comments/:id', method: RequestMethod.DELETE },
  //     )
  //     .forRoutes(CommentsController);
  // }
}
