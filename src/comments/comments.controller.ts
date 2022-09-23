import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { CurrentUserData } from '../common/current-user-data.param.decorator';
import { LikeStatusDto } from '../dto/like-status.dto';
import { CommentsService } from './comments.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}
  // @HttpCode(204)
  @Get('/:id')
  async getCommentById(@Headers() headers: any, @Param('id') id: string) {
    const comment = await this.commentsService.getCommentById(id, headers);
    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const isUpdated = await this.commentsService.updateComment(
      id,
      updateCommentDto,
    );
    return isUpdated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteComment(@Param('id') id: string) {
    const isDeleted = await this.commentsService.deleteComment(id);
    return isDeleted;
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id/like-status')
  @HttpCode(204)
  async reactOnComment(
    @Param('id') id: string,
    @Body() likeStatusDto: LikeStatusDto,
    @CurrentUserData() currentUserData: any,
  ) {
    await this.commentsService.reactOnComment(
      id,
      likeStatusDto,
      currentUserData,
    );
    return;
  }
}
