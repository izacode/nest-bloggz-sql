import { Injectable } from '@nestjs/common';
import { LikeStatusDto } from 'src/dto/like-status.dto';
import { ReactionsRawSqlRepository } from './reactions.raw-sql-repository';
import { ReactionsRepository } from './reactions.repository';

@Injectable()
export class ReactionsService {
  constructor(private reactionsRepository: ReactionsRawSqlRepository) {}
  async createCommentReaction(
    commentId: string,
    userId: string,
    reactionStatus: LikeStatusDto,
  ) {
    const { likeStatus } = reactionStatus;

    const reaction = {
      commentId,
      userId,
      likeStatus,
    };

    return this.reactionsRepository.createCommentReaction(reaction);
  }
  async createPostReaction(
    postId: string,
    userId: string,
    login: string,
    reactionStatus: LikeStatusDto,
  ) {
    const { likeStatus } = reactionStatus;

    const reaction = {
      addedAt: new Date().toISOString(),
      userId,
      login,
      postId,
      likeStatus,
    };

    await this.reactionsRepository.createPostReaction(reaction);
    return this.reactionsRepository.getUsersPostReaction(postId, userId);
  }
}
