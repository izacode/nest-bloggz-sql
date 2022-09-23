import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentReaction } from '../schemas/comment-reaction.schema';
import { PostReaction } from '../schemas/post-reaction.schema';

@Injectable()
export class ReactionsRepository {
  constructor(
    @InjectModel(CommentReaction.name)
    private commentReactionModel: Model<CommentReaction>,
    @InjectModel(PostReaction.name)
    private postReactionModel: Model<PostReaction>,
  ) {}

  async getUsersCommentReaction(
    commentId: string,
    userId: string,
  ): Promise<CommentReaction | null> {
    const userCommentReaction: CommentReaction | null =
      await this.commentReactionModel
        .findOne(
          {
            commentId,
            userId,
          },
          '-__v',
        )
        .exec();
    if (!userCommentReaction) return null;
    return userCommentReaction;
  }

  async getUsersAllCommentsReactions(
    userId: string,
  ): Promise<CommentReaction[] | null> {
    const userCommentsReactions: CommentReaction[] | null =
      await this.commentReactionModel
        .find({
          userId,
        })
        .exec();
    if (userCommentsReactions.length === 0) return null;
    return userCommentsReactions;
  }

  async createCommentReaction(reaction: any) {
    await this.commentReactionModel.create(reaction);
    const userId = reaction.userId.toString();

    return this.commentReactionModel.findOne(
      {
        commentId: reaction.commentId,
        userId,
      },
      '-_id -__v',
    );
  }
  async createPostReaction(reaction: any) {
    await this.postReactionModel.create(reaction);
    const userId = reaction.userId.toString();

    return this.postReactionModel.findOne(
      {
        postId: reaction.postId,
        userId,
      },
      '-_id -__v',
    );
  }

  async getLastThreePostLikeReactions(postId: string) {
    const lastThreeLikeReactions = await this.postReactionModel
      .find(
        { postId, likeStatus: 'Like' },
        { _id: 0, postId: 0, likeStatus: 0, __v: 0 },
      )
      .sort({ addedAt: -1 })
      .limit(3);

    return lastThreeLikeReactions ? lastThreeLikeReactions : [];
  }
  // _id added 10:00
  async getUsersPostReaction(
    postId: string,
    userId: string,
  ): Promise<PostReaction | null> {
    const userPostReaction: PostReaction | null =
      await this.postReactionModel.findOne(
        {
          postId,
          userId,
        },
        '-postId -__v',
        // '-_id -postId -likeStatus -__v',
      );
    if (!userPostReaction) return null;
    return userPostReaction;
  }

  async getUserAllPostsReactions(id: string) {
    const userAllPostsReactions: PostReaction[] | null =
      await this.postReactionModel.find({ userId: id }, '-_id -__v');

    if (!userAllPostsReactions) return null;
    return userAllPostsReactions;
  }
}
