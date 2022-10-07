import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth/guards/basic-auth-guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { CurrentUserData } from '../common/current-user-data.param.decorator';
import { FilterDto } from '../dto/filter.dto';
import { LikeStatusDto } from '../dto/like-status.dto';
import { CreatePostDto } from './dto/create-post.dto';

import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected commentsService: CommentsService,
  ) {}

  @Get()
  async getPosts(@Headers() headers: any, @Query() filterDto: FilterDto) {
    return this.postsService.getPosts(filterDto, headers);
  }

  // @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    const createdPost = await this.postsService.createPost(createPostDto);
    return createdPost;
  }
  @Get('/:id')
  async getPost(@Headers() headers: any, @Param('id') id: string) {
    const post = await this.postsService.getPost(id, headers);
    return post;
  }

  // @UseGuards(BasicAuthGuard)
  @Put('/:id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const isUpdated: boolean = await this.postsService.updatePost(
      id,
      updatePostDto,
    );

    return;
  }

  // @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
  
    return this.postsService.deletePost(id);
    
  }

  @Get('/:id/comments')
  async getPostComments(
    @Param('id') id: string,
    @Query() filterDto: FilterDto,
    @Headers() headers: any,
  ) {
    await this.postsService.getPost(id);
    const postComments = await this.commentsService.getPostComments(
      id,
      filterDto,
      headers,
    );
    return postComments;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/comments')
  async createPostComment(
    @CurrentUserData() currentUserData: any,
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    await this.postsService.getPost(id);
    const newComment = await this.commentsService.createComment(
      id,
      createCommentDto,
      currentUserData,
    );
    return newComment;
  }


  @UseGuards(JwtAuthGuard)
  @Put('/:id/like-status')
  @HttpCode(204)
  async reactOnPost(
    @Param('id') id: string,
    @Body() likeStatusDto: LikeStatusDto,
    @CurrentUserData() currentUserData: any,
  ) {
    
    await this.postsService.reactOnPost(id, likeStatusDto, currentUserData);
    return;
  }
}
