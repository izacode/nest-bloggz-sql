import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attempt, AttemptSchema } from '../schemas/attempt.schema';
import { Blogger, BloggerSchema } from '../schemas/blogger.schema';
import {
  CommentReaction,
  CommentReactionSchema,
} from '../schemas/comment-reaction.schema';
import { Comment, CommentSchema } from '../schemas/comment.schema';
import {
  PostReaction,
  PostReactionSchema,
} from '../schemas/post-reaction.schema';
import { Post, PostSchema } from '../schemas/post.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { TestingClearController } from './testing-clear.controller';
import { TestingClearService } from './testing-clear.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Blogger.name,
        schema: BloggerSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: CommentReaction.name,
        schema: CommentReactionSchema,
      },
      {
        name: PostReaction.name,
        schema: PostReactionSchema,
      },
      {
        name: Attempt.name,
        schema: AttemptSchema,
      },
    ]),
  ],
  controllers: [TestingClearController],
  providers: [TestingClearService],
})
export class TestingClearModule {}
