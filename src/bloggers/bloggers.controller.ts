import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { Blogger } from '../schemas/blogger.schema';
import { CustomResponseType } from 'src/types';
import { BloggersService } from './bloggers.service';
import { CreateBloggerDto } from './dto/create-blogger.dto';
import { FilterDto } from '../dto/filter.dto';
import { UpdateBloggerDto } from './dto/update-blogger.dto';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { PostsService } from '../posts/posts.service';
import { BasicAuthGuard } from '../auth/guards/basic-auth-guard';

@Controller('bloggers')
export class BloggersController {
  constructor(
    protected bloggersService: BloggersService,
    protected postsService: PostsService
  ) {}

  @Get()
  async getBloggers(
    @Query() filterDto: FilterDto,
  ): Promise<CustomResponseType> {
    return this.bloggersService.getBloggers(filterDto);
  }

  // @UseGuards(BasicAuthGuard)
  @Post()
  async createBlogger(@Body() createBloggerDto: CreateBloggerDto) {
    const newBlogger: Blogger = await this.bloggersService.createBlogger(
      createBloggerDto,
    );
    return newBlogger;
  }

  @Get('/:id')
  async getBlogger(@Param('id') id: string) {
    const foundBlogger: Blogger = await this.bloggersService.getBlogger(id);
    return foundBlogger;
  }

  // @UseGuards(BasicAuthGuard)
  @Put('/:id')
  @HttpCode(204)
  async updateBlogger(
    @Param('id') id: string,
    @Body() updateBloggerDto: UpdateBloggerDto,
  ) {
    await this.bloggersService.getBlogger(id);
    const isUpdated: boolean = await this.bloggersService.updateBlogger(
      id,
      updateBloggerDto,
    );
    return;
  }

  // @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  @HttpCode(204)
  async deleteBlogger(@Param('id') id: string) {
    await this.bloggersService.getBlogger(id);
    const isDeleted: boolean = await this.bloggersService.deleteBlogger(id);
    return;
  }


  @Get('/:id/posts')
  async getBloggerPosts(
    @Param('id') id: string,
    @Query() filterDto: FilterDto,
    @Headers() headers: any,
  ) {
    const bloggerPosts = await this.postsService.getPosts(
      filterDto,
      headers,
      id,
    );
    return bloggerPosts;
  }
  @UseGuards(BasicAuthGuard)
  @Post('/:id/posts')
  @HttpCode(201)
  async createBloggerPost(
    @Param('id') id: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    const newPost = await this.postsService.createPost(createPostDto, id);
   
    return newPost;
  }
}
