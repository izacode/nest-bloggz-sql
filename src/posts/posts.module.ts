import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersModule } from '../bloggers/bloggers.module';
import { CommentsModule } from '../comments/comments.module';
import { Blogger, BloggerSchema } from '../schemas/blogger.schema';
import { Comment, CommentSchema } from '../schemas/comment.schema';
import { Post, PostSchema } from '../schemas/post.schema';
import { PostsController } from './posts.controller';

import { PostsService } from './posts.service';
import { forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ReactionsRepository } from '../likes/reactions.repository';
import {
  CommentReaction,
  CommentReactionSchema,
} from '../schemas/comment-reaction.schema';
import {
  PostReaction,
  PostReactionSchema,
} from '../schemas/post-reaction.schema';
import { ReactionsService } from '../likes/reactions.service';
import { CredsValidationMiddleware } from '../middleware/creds-validation.middleware';
import { PostsRawSqlRepository } from './posts.raw-sql-repository';
import { ReactionsRawSqlRepository } from '../likes/reactions.raw-sql-repository';

// forward ref to rewrite through helpers usecase

@Module({
  imports: [forwardRef(() => BloggersModule), CommentsModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRawSqlRepository,
    JwtService,
    ReactionsRawSqlRepository,
    ReactionsService,
  ],
  exports: [PostsService, PostsRawSqlRepository],
})
export class PostsModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(CredsValidationMiddleware)
  //     .forRoutes({ path: 'posts/:id/comments', method: RequestMethod.POST });
  // }
}
