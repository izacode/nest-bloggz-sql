import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from '../schemas/comment.schema';
import { CustomResponseType } from '../types';
import { FilterDto } from '../dto/filter.dto';
import { LikeStatusDto } from '../dto/like-status.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ReactionsRepository } from '../likes/reactions.repository';
import { ReactionsService } from '../likes/reactions.service';
import { CommentsRawSqlRepository } from './comments.raw-sql-repository';
import { ReactionsRawSqlRepository } from '../likes/reactions.raw-sql-repository';

@Injectable()
export class CommentsService {
  constructor(
    private commentsRepository: CommentsRawSqlRepository,
    private config: ConfigService,
    private jwtService: JwtService,
    private reactionsRepository: ReactionsRawSqlRepository,
    private reactionsService: ReactionsService,
  ) {}

  async createComment(
    id: string,
    createCommentDto: CreateCommentDto,
    currentUserData: any,
  ): Promise<any> {
    const { content } = createCommentDto;
    const newComment = {
      id: (+new Date()).toString(),
      content,
      postId: id,
      userId: currentUserData.sub,
      userLogin: currentUserData.username,
      addedAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };

    return this.commentsRepository.createComment(newComment);
  }

  async getPostComments(
    id: string,
    filterDto: FilterDto,
    headers: any,
  ): Promise<CustomResponseType> {
    let accessToken: string;
    if (headers.authorization)
      accessToken = headers.authorization.split(' ')[1];

    try {
      const result = await this.jwtService.verify(accessToken, {
        secret: await this.config.get('ACCESS_TOKEN_SECRET'),
      });

      return this.commentsRepository.getPostComments(id, filterDto, result);
    } catch {
      return this.commentsRepository.getPostComments(id, filterDto);
    }
  }

  async getCommentById(id: string, headers?: any) {
    try {
      let accessToken: string;
      if (headers?.authorization)
        accessToken = headers.authorization.split(' ')[1];
      const userInfo = await this.jwtService.verify(accessToken, {
        secret: await this.config.get('ACCESS_TOKEN_SECRET'),
      });

      return this.commentsRepository.getCommentById(id, userInfo);
    } catch {
      debugger;
      return this.commentsRepository.getCommentById(id);
    }
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
    username: string,
  ) {
    return this.commentsRepository.updateComment(
      id,
      updateCommentDto,
      username,
    );
  }

  async deleteComment(id: string, username: string): Promise<boolean> {
    return this.commentsRepository.deleteComment(id, username);
  }

  async reactOnComment(
    id: string,
    likeStatusDto: LikeStatusDto,
    currentUserData: any,
  ) {
    const { likeStatus } = likeStatusDto;
    const comment = await this.getCommentByIdForReaction(id);

    const currentUserCommentReaction =
      await this.reactionsRepository.getUsersCommentReaction(
        id,
        currentUserData.sub,
      );

    // If user hasn't reacted before
    if (!currentUserCommentReaction) {
      const reaction = await this.reactionsService.createCommentReaction(
        id,
        currentUserData.sub,
        likeStatusDto,
      );
      return this.commentsRepository.reactOnComment(reaction, comment);
    }

    // If user has reacted before
    return this.commentsRepository.reactOnCommentAgain(
      currentUserCommentReaction,
      comment,
      likeStatus,
    );
  }
  async getCommentByIdForReaction(id: string, headers?: any) {
    try {
      let accessToken: string;
      if (headers?.authorization)
        accessToken = headers.authorization.split(' ')[1];
      const userInfo = await this.jwtService.verify(accessToken, {
        secret: await this.config.get('ACCESS_TOKEN_SECRET'),
      });

      return this.commentsRepository.getCommentByIdForReaction(id, userInfo);
    } catch {
      return this.commentsRepository.getCommentByIdForReaction(id);
    }
  }
}
