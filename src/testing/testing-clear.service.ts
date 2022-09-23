import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attempt } from '../schemas/attempt.schema';
import { Blogger } from '../schemas/blogger.schema';
import { CommentReaction } from '../schemas/comment-reaction.schema';
import { Comment } from '../schemas/comment.schema';
import { PostReaction } from '../schemas/post-reaction.schema';
import { Post } from '../schemas/post.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class TestingClearService {
  @InjectModel(Post.name) private postModel: Model<Post>;
  @InjectModel(Blogger.name) private bloggerModel: Model<Blogger>;
  @InjectModel(Comment.name) private commentModel: Model<Comment>;
  @InjectModel(Attempt.name) private attemptModel: Model<Attempt>;
  @InjectModel(PostReaction.name)
  private postReactionModel: Model<PostReaction>;
  @InjectModel(CommentReaction.name)
  private commentReactionModel: Model<CommentReaction>;
  @InjectModel(User.name) private userModel: Model<User>;
  async dropTestBase() {
    try {
      await this.bloggerModel.collection.drop();
    } catch {
      console.log('Bloggers collection does not exist');
    }
    try {
      await this.postModel.collection.drop();
    } catch {
      console.log('Posts collection does not exist');
    }
    try {
      await this.commentModel.collection.drop();
    } catch {
      console.log('Comments collection does not exist');
    }
    try {
      await this.postReactionModel.collection.drop();
    } catch {
      console.log('PostReactions collection does not exist');
    }
    try {
      await this.attemptModel.collection.drop();
    } catch {
      console.log('Attempts collection does not exist');
    }
    try {
      await this.commentReactionModel.collection.drop();
    } catch {
      console.log('CommentReactions collection does not exist');
    }
    try {
      await this.userModel.collection.drop();
    } catch {
      console.log('Users collection does not exist');
    }
    return;
  }
}
