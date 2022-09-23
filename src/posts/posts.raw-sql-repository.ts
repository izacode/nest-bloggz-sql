import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blogger } from '../schemas/blogger.schema';
import { ExtendedLikesInfo, Post } from '../schemas/post.schema';
import { CustomResponseType } from '../types';
import { CreatePostDto } from './dto/create-post.dto';
import { FilterDto } from '../dto/filter.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ReactionsRepository } from '../likes/reactions.repository';
import { PostReaction } from 'src/schemas/post-reaction.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ReactionsRawSqlRepository } from '../likes/reactions.raw-sql-repository';

@Injectable()
export class PostsRawSqlRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    private reactionsRawSqlRepository: ReactionsRawSqlRepository,
  ) {}

  postMapper = (post) => {
    const {
      id,
      title,
      shortDescription,
      content,
      bloggerId,
      likesCount,
      dislikesCount,
      myStatus,
    } = post;
    let mappedPost = {
      id,
      title,
      shortDescription,
      content,
      bloggerId,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes: [],
      },
    };
    return mappedPost;
  };

  async getPosts(
    filterDto: FilterDto,
    userInfo?: any,
    bloggerId?: string,
  ): Promise<CustomResponseType> {
    const { SearchNameTerm, PageNumber, PageSize } = filterDto;
    const offset = (+PageNumber - 1) * +PageSize || 0;

    let filter: any;
    if (SearchNameTerm === '' && bloggerId === undefined) filter = '';
    if (SearchNameTerm === '' && bloggerId !== undefined) filter = bloggerId;
    if (SearchNameTerm !== '' && bloggerId === undefined)
      filter = SearchNameTerm;

    let posts: Post[] = await this.dataSource.query(
      `
         SELECT *
         FROM posts
         WHERE title LIKE ('%'||$1||'%') or bloggerId LIKE ('%'||$1||'%')
         LIMIT $2 OFFSET $3
      `,
      [SearchNameTerm, PageSize, offset],
    );
    let mappedPosts: Post[];
    if (!userInfo && posts.length !== 0) {
      posts.forEach(async (p) => {
        const lastThreePostLikeReactions =
          await this.reactionsRawSqlRepository.getLastThreePostLikeReactions(
            p.id,
          );
        let mappedPost = this.postMapper(p);
        mappedPost.extendedLikesInfo.newestLikes = lastThreePostLikeReactions;
        mappedPosts.push(mappedPost as any);
      });
    } else {
      const userPostReactions =
        await this.reactionsRawSqlRepository.getUserAllPostsReactions(
          userInfo.sub,
        );
      posts.forEach(async (p) => {
        let mappedPost = this.postMapper(p);
        mappedPosts.push(mappedPost as any);
      });
      mappedPosts.map(async (p) => {
        userPostReactions.forEach((r) => {
          if (r.postId === p.id) {
            p.extendedLikesInfo.myStatus = r.likeStatus;
          }
        });
        const lastThreePostLikeReactions =
          await this.reactionsRawSqlRepository.getLastThreePostLikeReactions(
            p.id,
          );
        p.extendedLikesInfo.newestLikes = lastThreePostLikeReactions;
        return p;
      });
    }

    //  =====================================================================================================

    const totalCount: number = +(
      await this.dataSource.query(`
      SELECT Count(*)
	    FROM public.Posts`)
    )[0].count;
    const customResponse = {
      pagesCount: Math.ceil(totalCount / +PageSize),
      page: +PageNumber,
      pageSize: +PageSize,
      totalCount,
      items: posts,
    };

    return customResponse;
  }

  async createPost(newPost: CreatePostDto): Promise<Post | null> {
    const { id, title, shortDescription, content, bloggerId } = newPost;
    await this.dataSource.query(
      `
   INSERT INTO public."Posts"( 
	 id, title, "shortDescription", content, "bloggerId", "createdAt", "likesCount", "dislikesCount", "myStatus")
	 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
   `,
      [id, title, shortDescription, content, bloggerId, 0, 0, 0],
    );
    return newPost as Post;
  }

  async getPost(id: string, userInfo?: any): Promise<Post> {
    let post = await this.dataSource.query(
      `
    SELECT p.*, b.bloggerName 
    FROM "Posts" as p
    WHERE id = $1
    JOIN "Bloggers" as b 
    ON p.bloggerId = b.id 
    `,
      [id],
    );

    if (!post) throw new NotFoundException();

    let mappedPost = this.postMapper(post);

    let userPostReaction: PostReaction;

    if (userInfo)
      userPostReaction =
        await this.reactionsRawSqlRepository.getUsersPostReaction(
          id,
          userInfo.sub,
        );

    if (userPostReaction)
      mappedPost.extendedLikesInfo.myStatus = userPostReaction.likeStatus;

    const lastThreePostLikeReactions =
      await this.reactionsRawSqlRepository.getLastThreePostLikeReactions(id);
    mappedPost.extendedLikesInfo.newestLikes = lastThreePostLikeReactions;

    return mappedPost as Post;
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto): Promise<boolean> {
    await this.getPost(id);
    await this.dataSource.query(
      `
    UPDATE public."Posts"
	  SET title=$2, "shortDescription"=$3, content=$4, "bloggerId"=$5
	  WHERE id = $1;
    `,
      [id, ...Object.values(updatePostDto)],
    );
    return true;
  }

  async deletePost(id: string): Promise<boolean> {
    await this.getPost(id);
    await this.dataSource.query(
      `
    DELETE FROM public."Posts"
	  WHERE id = $1; 
    `,
      [id],
    );
    return true;
  }

  // ============================= Get Post for reactioon=============================================================
  async getPostForReact(id: string, userInfo?: any): Promise<Post> {
    return this.getPost(id, userInfo);
  }

  async reactOnPost(reaction: PostReaction, post: any) {
    if (reaction.likeStatus === 'None') return;
    if (reaction.likeStatus === 'Like') {
      await this.dataSource.query(
        `
      UPDATE "Posts"
      SET 'likesCount' +=1 
      WHERE id = $1
      `,
        [post.id],
      );
    } else if (reaction.likeStatus === 'Dislike') {
      await this.dataSource.query(
        `
      UPDATE "Posts"
      SET 'dislikesCount' +=1 
       WHERE id = $1
      `,
        [post.id],
      );
    }
    return;
  }
  async reactOnPostAgain(
    currentUserPostReaction: PostReaction,
    post: any,
    likeStatus: string,
  ) {
    if (likeStatus === 'Like') {
      if (currentUserPostReaction.likeStatus === 'Like') return;
      await this.dataSource.query(
        `
      UPDATE "Posts"
      SET 'likesCount' +=1
      WHERE id = $1
      `,
        [post.id],
      );

      if (currentUserPostReaction.likeStatus === 'Dislike')
        await this.dataSource.query(
          `
      UPDATE "Posts"
      SET 'dislikesCount' -=1
      WHERE id = $1
      `,
          [post.id],
        );
      
      
    } else if (likeStatus === 'Dislike') {
      if (currentUserPostReaction.likeStatus === 'Dislike') return;
      await this.dataSource.query(
        `
      UPDATE "Posts"
      SET 'dislikesCount' +=1
      WHERE id = $1
      `,
        [post.id],
      );

      if (currentUserPostReaction.likeStatus === 'Dislike')
        await this.dataSource.query(
          `
      UPDATE "Posts"
      SET 'likesCount' -=1
      WHERE id = $1
      `,
          [post.id],
        );
      
      
    } else {
      if (currentUserPostReaction.likeStatus === 'Dislike')
         await this.dataSource.query(
           `
      UPDATE "Posts"
      SET 'dislikesCount' -=1
      WHERE id = $1
      `,
           [post.id],
         );

      if (currentUserPostReaction.likeStatus === 'Like')
         await this.dataSource.query(
           `
      UPDATE "Posts"
      SET 'likesCount' -=1
      WHERE id = $1
      `,
           [post.id],
         );
    }
    // Update PostReaction likeStatus
    await this.dataSource.query(
      `
      UPDATE "PostsReactions"
      SET 'likeStatus' = $1
      WHERE 'userId' = $2 and 'postId' = $3
      `,
      [
        likeStatus,
        currentUserPostReaction.userId,
        currentUserPostReaction.postId,
      ],
    )
    return
  }
}
