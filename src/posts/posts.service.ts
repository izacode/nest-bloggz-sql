import {  Injectable, NotFoundException } from '@nestjs/common';
import { FilterDto } from '../dto/filter.dto';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';



import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LikeStatusDto } from '../dto/like-status.dto';
import { ReactionsRepository } from '../likes/reactions.repository';
import { ReactionsService } from '../likes/reactions.service';

import { PostsRawSqlRepository } from './posts.raw-sql-repository';
import { ReactionsRawSqlRepository } from '../likes/reactions.raw-sql-repository';
import { BloggersRawSqlRepository } from '../bloggers/bloggers.raw-sql-repository';
import { Post } from './post.entity';
import { Blogger } from 'src/bloggers/blogger.entity';
import { PostReaction } from '../likes/entities/post-reaction.entity';
import { PostsQbRepository } from './posts.qb-repository';

@Injectable()
export class PostsService {
  constructor(
    // private postsRepository: PostsRawSqlRepository,
    private postsRepository: PostsQbRepository,
    private bloggersRepository: BloggersRawSqlRepository,
    private jwtService: JwtService,
    private config: ConfigService,
    private reactionsRepository: ReactionsRawSqlRepository,
    private reactionsService: ReactionsService,
  ) {}
  async getPosts(filterDto: FilterDto, headers: any, bloggerId?: string) {
    try {
      let accessToken: string;
      if (headers?.authorization)
        accessToken = headers.authorization.split(' ')[1];
      const userInfo = await this.jwtService.verify(accessToken, {
        secret: await this.config.get('ACCESS_TOKEN_SECRET'),
      });

      return this.postsRepository.getPosts(filterDto, userInfo, bloggerId);
    } catch {
      return this.postsRepository.getPosts(filterDto, null, bloggerId);
    }
  }

  async createPost(
    createPostDto: CreatePostDto,
    id?: string,
  ): Promise<Post | null> {
    const { title, shortDescription, content } = createPostDto;
    const bloggerId: string = id || createPostDto.bloggerId;

    const blogger: Blogger = await this.bloggersRepository.getBlogger(
      bloggerId,
    );

    if (!blogger) throw new NotFoundException();

    const newPost: Post = {
      title,
      shortDescription,
      content,
      bloggerId,
      bloggerName: blogger.name,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    } as Post;

    return this.postsRepository.createPost(newPost);
  }

  async getPost(id: string, headers?: any): Promise<Post | null> {
    try {
      let accessToken: string;
      if (headers?.authorization)
        accessToken = headers.authorization.split(' ')[1];
      const userInfo = await this.jwtService.verify(accessToken, {
        secret: await this.config.get('ACCESS_TOKEN_SECRET'),
      });

      return this.postsRepository.getPost(id, userInfo);
    } catch {
      return this.postsRepository.getPost(id);
    }
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto): Promise<boolean> {
    return this.postsRepository.updatePost(id, updatePostDto);
  }

  async deletePost(id: string): Promise<boolean> {
    return this.postsRepository.deletePost(id);
  }

  // React on post ======================================================================================================================
  async reactOnPost(
    id: string,
    likeStatusDto: LikeStatusDto,
    currentUserData: any,
  ) {
 
    const { likeStatus } = likeStatusDto;

    let post = await this.postsRepository.getPostForReact(id);

    const currentUserPostReaction: PostReaction =
      await this.reactionsRepository.getUsersPostReaction(
        id,
        currentUserData.sub,
      );

    // If user hasn't reacted before
    if (!currentUserPostReaction) {
      const reaction = await this.reactionsService.createPostReaction(
        id,
        currentUserData.sub,
        currentUserData.username,
        likeStatusDto,
      );
      return this.postsRepository.reactOnPost(reaction, post);
    }

    // If user has reacted before

    return this.postsRepository.reactOnPostAgain(
      currentUserPostReaction,
      post,
      likeStatus,
    );
  }
}
