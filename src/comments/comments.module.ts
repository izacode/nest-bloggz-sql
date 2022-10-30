import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeStatusValidationMiddleware } from '../middleware/likeStatus-validation.middleware';

import { ReactionsRepository } from '../likes/reactions.repository';
import { ReactionsService } from '../likes/reactions.service';
import { Blogger, BloggerSchema } from '../schemas/blogger.schema';
import {
  CommentReaction,
  CommentReactionSchema,
} from '../schemas/comment-reaction.schema';
// import { Comment, CommentSchema } from '../schemas/comment.schema';
import {
  PostReaction,
  PostReactionSchema,
} from '../schemas/post-reaction.schema';
import { Post, PostSchema } from '../schemas/post.schema';

import { CommentsController } from './comments.controller';
// import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { CommentsRawSqlRepository } from './comments.raw-sql-repository';
import { ReactionsRawSqlRepository } from '../likes/reactions.raw-sql-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsRawSqlRepository,
    ReactionsService,
    ReactionsRawSqlRepository,
    JwtService,
  ],
  exports: [CommentsService, CommentsRawSqlRepository],
})
export class CommentsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LikeStatusValidationMiddleware).forRoutes({
      path: 'comments/:id/like-status',
      method: RequestMethod.PUT,
    });
  }
}
