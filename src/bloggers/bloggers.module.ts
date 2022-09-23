import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ReactionsService } from '../likes/reactions.service';
import { ReactionsRawSqlRepository } from '../likes/reactions.raw-sql-repository';
import { PostsRawSqlRepository } from '../posts/posts.raw-sql-repository';
import { PostsService } from '../posts/posts.service';



import { BloggersController } from './bloggers.controller';
import { BloggersRawSqlRepository } from './bloggers.raw-sql-repository';
import { BloggersRepository } from './bloggers.repository';
import { BloggersService } from './bloggers.service';

@Module({
  controllers: [BloggersController],
  providers: [
    BloggersService,
    BloggersRawSqlRepository,
    PostsService,
    ReactionsRawSqlRepository,
    PostsRawSqlRepository,
    JwtService,
    ReactionsService
  ],
  exports: [BloggersService, BloggersRawSqlRepository],
})
export class BloggersModule {}
