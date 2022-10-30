import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ReactionsService } from '../likes/reactions.service';
import { ReactionsRawSqlRepository } from '../likes/reactions.raw-sql-repository';
import { PostsRawSqlRepository } from '../posts/posts.raw-sql-repository';
import { PostsService } from '../posts/posts.service';

import { BloggersController } from './bloggers.controller';
import { BloggersRawSqlRepository } from './bloggers.raw-sql-repository';

import { BloggersService } from './bloggers.service';
import { PostsQbRepository } from '../posts/posts.qb-repository';

import { Post } from '../posts/post.entity';
import { Blogger } from './blogger.entity';
import { BloggersQbRepository } from './bloggers.qb-repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Blogger, Post])],
  controllers: [BloggersController],
  providers: [
    BloggersService,
    BloggersRawSqlRepository,
    BloggersQbRepository,
    PostsService,
    ReactionsRawSqlRepository,
    PostsRawSqlRepository,
    PostsQbRepository,
    JwtService,
    ReactionsService,
  ],
  exports: [BloggersService, BloggersQbRepository, BloggersRawSqlRepository],
})
export class BloggersModule {}
