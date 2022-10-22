import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { DataSource } from 'typeorm';
import { CommentReaction } from '../schemas/comment-reaction.schema';
import { PostReaction } from '../schemas/post-reaction.schema';

@Injectable()
export class ReactionsRawSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getUsersCommentReaction(
    commentId: string,
    userId: string,
  ): Promise<CommentReaction | null> {
    debugger;
    const userCommentReaction = await this.dataSource.query(
      `
      SELECT "likeStatus", "userId", "commentId"
	    FROM public."CommentsReactions"
      WHERE "userId" = $1 and "commentId" = $2
      `,
      [userId, commentId],
    );
    if (userCommentReaction.length === 0) return null;
    return userCommentReaction[0];
  }

  async getUsersAllCommentsReactions(
    userId: string,
  ): Promise<CommentReaction[] | null> {
    const userCommentsReactions: CommentReaction[] | null =
      await this.dataSource.query(
        `
      SELECT "likeStatus", "userId", "commentId"
	    FROM public."CommentsReactions";
      WHERE userId = $1
      `,
        [userId],
      );
    if (userCommentsReactions.length === 0) return null;
    return userCommentsReactions;
  }

  async createCommentReaction(reaction: any) {
    const { commentId, userId, likeStatus } = reaction;
    await this.dataSource.query(
      `
    INSERT INTO public."CommentsReactions"
    ("likeStatus", "userId", "commentId")
	  VALUES ($1, $2, $3);
    `,
      [likeStatus, userId, commentId],
    );
    return reaction;
  }

  // PostReactions =========================================================
  async createPostReaction(reaction: any) {
    await this.dataSource.query(
      `
    INSERT INTO  public."PostsReactions"
    ("addedAt", "userId", login, "postId", "likeStatus")
	  VALUES ($1, $2, $3, $4, $5)
    `,
      [...Object.values(reaction)],
    );
    return reaction;
  }

  async getLastThreePostLikeReactions(postId: string) {
    const lastThreeLikeReactions = await this.dataSource.query(
      `
     SELECT "addedAt", "userId", login
     FROM  public."PostsReactions"
     WHERE "postId" = $1 AND "likeStatus" = 'Like'
     ORDER BY "addedAt" ASC
     LIMIT 3
    `,
      [postId],
    );
    return lastThreeLikeReactions ? lastThreeLikeReactions : [];
  }

  async getUsersPostReaction(
    postId: string,
    userId: string,
  ): Promise<PostReaction | null> {
    debugger;
    const userPostReaction: PostReaction | null = await this.dataSource.query(
      `
     SELECT "addedAt", "userId", login, "likeStatus", "postId"
     FROM  public."PostsReactions"
     WHERE "postId" = $1 AND "userId" = $2
    `,
      [postId, userId],
    );

    if (!userPostReaction) return null;
    return userPostReaction[0];
  }

  async getUserAllPostsReactions(id: string) {
    const userAllPostsReactions: PostReaction[] | null =
      await this.dataSource.query(
        `
     SELECT "addedAt", "userId", login
     FROM  public."PostsReactions"
     WHERE "userId" = $1
     ORDER BY "addedAt" ASC
     LIMIT 3
    `,
        [id],
      );

    if (!userAllPostsReactions) return null;
    return userAllPostsReactions;
  }
}
