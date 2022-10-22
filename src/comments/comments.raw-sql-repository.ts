import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from '../schemas/comment.schema';
import { FilterDto } from '../dto/filter.dto';
import { CustomResponseType } from '../types';
import { ReactionsRepository } from '../likes/reactions.repository';
import { CommentReaction } from 'src/schemas/comment-reaction.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ReactionsRawSqlRepository } from '../likes/reactions.raw-sql-repository';

@Injectable()
export class CommentsRawSqlRepository {
  constructor(
    private reactionsRepository: ReactionsRawSqlRepository,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  commentMapper(comment) {
    const {
      id,
      content,
      userId,
      addedAt,
      userLogin,
      likesCount,
      dislikesCount,
      myStatus,
    } = comment;

    const mappedComment = {
      id,
      content,
      userId,
      addedAt,
      userLogin,
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
      },
    };
    return mappedComment;
  }

  async getCommentById(id: string, userInfo?: any): Promise<Comment> {
    debugger;
    let comment = await this.dataSource.query(
      `
    SELECT c.*, u."userName" as "userLogin"
    FROM public."Comments" as c
    JOIN public."Users" as u 
    ON c."userId" = u.id 
    WHERE c.id = $1
    `,
      [id],
    );
    if (comment.length === 0) throw new NotFoundException();
    let mappedComment = this.commentMapper(comment[0]);
    let userCommentReaction: any;
    if (userInfo) {
      userCommentReaction =
        await this.reactionsRepository.getUsersCommentReaction(
          id,
          userInfo.sub,
        );
    }

    if (userCommentReaction)
      mappedComment.likesInfo.myStatus = userCommentReaction.likeStatus;

    return mappedComment as Comment;
  }

  async createComment(newComment: any): Promise<Comment> {
    const {
      id,
      content,
      postId,
      userId,
      addedAt,
      likesInfo: { likesCount, dislikesCount, myStatus },
    } = newComment;

    await this.dataSource.query(
      `
    INSERT INTO public."Comments"
    (id, content, "postId", "userId", "addedAt", "likesCount", "dislikesCount", "myStatus")
	  VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `,
      [
        id,
        content,
        postId,
        userId,
        addedAt,
        likesCount,
        dislikesCount,
        myStatus,
      ],
    );

    return newComment;
  }

  async getPostComments(
    id: string,
    filterDto: FilterDto,
    userInfo?: any,
  ): Promise<CustomResponseType> {
    const { PageNumber, PageSize } = filterDto;
    const offset = (+PageNumber - 1) * +PageSize || 0;

    let postComments: Comment[] = await this.dataSource.query(
      `
      SELECT c.*, u."userName" as "userLogin"
      FROM "Comments" as c
      JOIN "Users" as u 
      ON c."userId" = u.id
      WHERE c."postId" = $1
      LIMIT $2 OFFSET $3
      `,
      [id, +PageSize, offset],
    );
    let mappedPostComments;
    if (postComments.length !== 0) {
      mappedPostComments = postComments.map((m) => this.commentMapper(m));
    }

    let userCommentsReactions: CommentReaction[];

    if (userInfo)
      userCommentsReactions =
        await this.reactionsRepository.getUsersAllCommentsReactions(
          userInfo.sub,
        );
    if (userCommentsReactions && userCommentsReactions.length !== 0) {
      mappedPostComments.map((m) => {
        userCommentsReactions.forEach((r) => {
          if (r.commentId === m.id)
            return (m.likesInfo.myStatus = r.likeStatus);
        });
      });
    }

    const totalCount: number = +(
      await this.dataSource.query(
        `
    SELECT COUNT(*)
    FROM "Comments"
    WHERE "postId" = $1
    `,
        [id],
      )
    )[0].count;
    const customResponse: CustomResponseType = {
      pagesCount: Math.ceil(totalCount / +PageSize),
      page: +PageNumber,
      pageSize: +PageSize,
      totalCount,
      items: mappedPostComments,
    };
    return customResponse;
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
    username: string,
  ): Promise<boolean> {
    const { content } = updateCommentDto;
    const commentToUpdate = await this.getCommentById(id);
    if (commentToUpdate.userLogin !== username) throw new ForbiddenException();

    await this.dataSource.query(
      `
    UPDATE public."Comments"
	  SET content = $1
	  WHERE id = $2
    `,
      [content, id],
    );
    return true;
  }

  async deleteComment(id: string, username: string): Promise<boolean> {
    const commentToDelete = await this.getCommentById(id);
    if (commentToDelete.userLogin !== username) throw new ForbiddenException();
    await this.dataSource.query(
      `
    DELETE FROM public."Comments"
	  WHERE id = $1;
    `,
      [id],
    );
    return true;
  }

  async getCommentByIdForReaction(
    id: string,
    userInfo?: any,
  ): Promise<Comment> {
    return this.getCommentById(id);
  }

  async reactOnComment(reaction: CommentReaction, comment: any) {
    if (reaction.likeStatus === 'Like') {
      await this.dataSource.query(
        `
      UPDATE public."Comments"
	    SET "likesCount" = "likesCount" + 1
	    WHERE id = $1
      `,
        [comment.id],
      );
    } else if (reaction.likeStatus === 'Dislike') {
      await this.dataSource.query(
        `
      UPDATE public."Comments"
	    SET "dislikesCount" ="dislikesCount" + 1
	    WHERE id = $1
      `,
        [comment.id],
      );
    }

    return;
  }

  async reactOnCommentAgain(
    currentUserCommentReaction: CommentReaction,
    comment: any,
    likeStatus: string,
  ) {
    if (likeStatus === 'Like') {
      if (currentUserCommentReaction.likeStatus === 'Like') return;
      await this.dataSource.query(
        `
      UPDATE public."Comments"
	    SET "likesCount" = "likesCount" + 1
	    WHERE id = $1
      `,
        [comment.id],
      );
      if (currentUserCommentReaction.likeStatus === 'Dislike')
        await this.dataSource.query(
          `
      UPDATE public."Comments"
	    SET "dislikesCount" = "dislikesCount" - 1
	    WHERE id = $1
      `,
          [comment.id],
        );
    } else if (likeStatus === 'Dislike') {
      if (currentUserCommentReaction.likeStatus === 'Dislike') return;
      await this.dataSource.query(
        `
      UPDATE public."Comments"
	    SET "dislikesCount" = "dislikesCount" + 1
	    WHERE id = $1
      `,
        [comment.id],
      );
      if (currentUserCommentReaction.likeStatus === 'Like')
        await this.dataSource.query(
          `
      UPDATE public."Comments"
	    SET "likesCount" = "likesCount" - 1
	    WHERE id = $1
      `,
          [comment.id],
        );
    } else {
      if (currentUserCommentReaction.likeStatus === 'Dislike')
        await this.dataSource.query(
          `
      UPDATE public."Comments"
	    SET "dislikesCount" = "dislikesCount" + 1 
	    WHERE id = $1
      `,
          [comment.id],
        );

      if (currentUserCommentReaction.likeStatus === 'Like')
        await this.dataSource.query(
          `
      UPDATE public."Comments"
	    SET "likesCount" = "likesCount" - 1
	    WHERE id = $1
      `,
          [comment.id],
        );
    }
    await this.dataSource.query(
      `
    UPDATE public."CommentsReactions"
	  SET "likeStatus" = $1
	  WHERE "commentId" = $2 AND "userId" = $3;
    `,
      [likeStatus, comment.id, currentUserCommentReaction.userId],
    );
    return;
  }
}
