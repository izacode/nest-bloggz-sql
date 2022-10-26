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

  @Get('/:id')
  async getCommentById(@Headers() headers: any, @Param('id') id: string) {
    const comment = await this.commentsService.getCommentById(id, headers);
    debugger;
    return comment;
  }

  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateComment(
    @CurrentUserData() currentUserData: any,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const { username } = currentUserData;
    const isUpdated = await this.commentsService.updateComment(
      id,
      updateCommentDto,
      username,
    );
    return isUpdated;
  }
  
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteComment(
    @CurrentUserData() currentUserData: any,
    @Param('id') id: string,
  ) {
    const { username } = currentUserData;
    const isDeleted = await this.commentsService.deleteComment(id, username);
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
