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
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'farce',
      database: 'Blog',
      autoLoadEntities: false,
      synchronize: false,
    }),
    AuthModule,
    BloggersModule,
    PostsModule,
    CommentsModule,
    UsersModule,
    // TestingClearModule,
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