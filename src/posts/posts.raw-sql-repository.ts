import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
      blogId,
      name,
      createdAt,
      likesCount,
      dislikesCount,
      myStatus,
    } = post;
    let mappedPost = {
      id,
      title,
      shortDescription,
      content,
      createdAt,
      blogId,
      blogName: name,
      // extendedLikesInfo: {
      //   likesCount,
      //   dislikesCount,
      //   myStatus,
      //   newestLikes: [],
      // },
    };
    return mappedPost;
  };

  async getPosts(
    filterDto: FilterDto,
    userInfo?: any,
    blogId?: string,
  ): Promise<CustomResponseType> {
    const { SearchNameTerm, PageNumber, PageSize, sortBy, sortDirection } =
      filterDto;
    const offset = (+PageNumber - 1) * +PageSize || 0;

    let filter: any;
    if (SearchNameTerm === '' && blogId === undefined) filter = '';
    if (SearchNameTerm === '' && blogId !== undefined) filter = blogId;
    if (SearchNameTerm !== '' && blogId === undefined) filter = SearchNameTerm;
    let posts: Post[];
    if (sortDirection === 'DESC') {
      posts = await this.dataSource.query(
        `
    SELECT p.*, b.name 
    FROM "Posts" as p
    LEFT JOIN bloggers as b ON p."blogId" = b.id 
     WHERE title LIKE ('%'||$1||'%') or "blogId" LIKE ('%'||$1||'%')
     ORDER BY $4 DESC
     LIMIT $2 OFFSET $3
    `,
        [SearchNameTerm, PageSize, offset, sortBy],
      );
    } else {
      posts = await this.dataSource.query(
        `
    SELECT p.*, b.name 
    FROM "Posts" as p
    LEFT JOIN bloggers as b ON p."blogId" = b.id 
     WHERE title LIKE ('%'||$1||'%') or "blogId" LIKE ('%'||$1||'%')
     ORDER BY $4 ASC
     LIMIT $2 OFFSET $3
    `,
        [SearchNameTerm, PageSize, offset, sortBy],
      );
    }

    // let mappedPosts = [];
    // if (posts.length !== 0) {
    //   if (!userInfo) {
    //     posts.map(async (p) => {
    //       const lastThreePostLikeReactions =
    //         await this.reactionsRawSqlRepository.getLastThreePostLikeReactions(
    //           p.id,
    //         );
    //       let mappedPost = this.postMapper(p);
    //       mappedPost.extendedLikesInfo.newestLikes = lastThreePostLikeReactions;
    //       mappedPosts.push(mappedPost as any);
    //     });
    //   } else {
    //     const userPostReactions =
    //       await this.reactionsRawSqlRepository.getUserAllPostsReactions(
    //         userInfo.sub,
    //       );
    //     posts.forEach(async (p) => {
    //       let mappedPost = this.postMapper(p);
    //       mappedPosts.push(mappedPost as any);
    //     });
    //     mappedPosts.map(async (p) => {
    //       userPostReactions.forEach((r) => {
    //         if (r.postId === p.id) {
    //           p.extendedLikesInfo.myStatus = r.likeStatus;
    //         }
    //       });
    //       const lastThreePostLikeReactions =
    //         await this.reactionsRawSqlRepository.getLastThreePostLikeReactions(
    //           p.id,
    //         );
    //       p.extendedLikesInfo.newestLikes = lastThreePostLikeReactions;
    //       return p;
    //     });
    //   }
    // }
    //  =====================================================================================================

    const totalCount: number = +(
      await this.dataSource.query(`
      SELECT Count(*)
	    FROM public."Posts"`)
    )[0].count;
    const customResponse = {
      pagesCount: Math.ceil(totalCount / +PageSize),
      page: +PageNumber,
      pageSize: +PageSize,
      totalCount,
      // items: mappedPosts,
      items: posts,
    };

    return customResponse;
  }

  async createPost(newPost: Post): Promise<Post | null> {
    const { id, title, shortDescription, content, blogId, createdAt } = newPost;
    await this.dataSource.query(
      `
   INSERT INTO public."Posts"( 
	 id, title, "shortDescription", content, "blogId", "createdAt", "likesCount", "dislikesCount", "myStatus")
	 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
   `,
      [id, title, shortDescription, content, blogId, createdAt, 0, 0, 'None'],
    );
    return newPost as Post;
  }

  async getPost(id: string, userInfo?: any): Promise<Post> {
    debugger;
    let post = await this.dataSource.query(
      `
    SELECT p.*, b.name 
    FROM "Posts" as p
    LEFT JOIN bloggers as b ON p."blogId" = b.id 
    LEFT JOIN  public."PostsReactions" as pr ON pr."postId" = $1 AND pr."userId" = $2 
    WHERE p.id = $1
    `,
      [id, userInfo?.sub],
    );

    if (post.length === 0) throw new NotFoundException();

    // let mappedPost = this.postMapper(post[0]);

    // let userPostReaction: PostReaction;

    // if (userInfo)
    //   userPostReaction =
    //     await this.reactionsRawSqlRepository.getUsersPostReaction(
    //       id,
    //       userInfo.sub,
    //     );

    // if (userPostReaction)
    //   mappedPost.extendedLikesInfo.myStatus = userPostReaction.likeStatus;

    // const lastThreePostLikeReactions =
    //   await this.reactionsRawSqlRepository.getLastThreePostLikeReactions(id);
    // mappedPost.extendedLikesInfo.newestLikes = lastThreePostLikeReactions;

    // return mappedPost as Post;
    return post;
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto): Promise<boolean> {
    await this.getPost(id);
    await this.dataSource.query(
      `
    UPDATE public."Posts"
	  SET title=$2, "shortDescription"=$3, content=$4, "blogId"=$5
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
    debugger;
    return this.getPost(id, userInfo);
  }

  async reactOnPost(reaction: PostReaction, post: any) {
    debugger;
    if (reaction.likeStatus === 'None') return;
    if (reaction.likeStatus === 'Like') {
      await this.dataSource.query(
        `
      UPDATE "Posts"
      SET "likesCount" = "likesCount" + 1 
      WHERE id = $1
      `,
        [post.id],
      );
    } else if (reaction.likeStatus === 'Dislike') {
      await this.dataSource.query(
        `
      UPDATE "Posts"
      SET "dislikesCount" = "dislikesCount" + 1 
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
    debugger;
    if (likeStatus === 'Like') {
      if (currentUserPostReaction.likeStatus === 'Like') return;
      await this.dataSource.query(
        `
      UPDATE "Posts"
      SET "likesCount" = "likesCount" + 1
      WHERE id = $1
      `,
        [post.id],
      );

      if (currentUserPostReaction.likeStatus === 'Dislike')
        await this.dataSource.query(
          `
      UPDATE "Posts"
      SET "dislikesCount" = "dislikesCount" - 1
      WHERE id = $1
      `,
          [post.id],
        );
    } else if (likeStatus === 'Dislike') {
      if (currentUserPostReaction.likeStatus === 'Dislike') return;
      await this.dataSource.query(
        `
      UPDATE "Posts"
      SET "dislikesCount" = "dislikesCount" + 1
      WHERE id = $1
      `,
        [post.id],
      );

      if (currentUserPostReaction.likeStatus === 'Like')
        await this.dataSource.query(
          `
      UPDATE "Posts"
      SET "likesCount" = "likesCount" - 1
      WHERE id = $1
      `,
          [post.id],
        );
    } else {
      if (currentUserPostReaction.likeStatus === 'Dislike')
        await this.dataSource.query(
          `
      UPDATE "Posts"
      SET "dislikesCount" = "dislikesCount" - 1
      WHERE id = $1
      `,
          [post.id],
        );

      if (currentUserPostReaction.likeStatus === 'Like')
        await this.dataSource.query(
          `
      UPDATE "Posts"
      SET "likesCount" = "likesCount" - 1
      WHERE id = $1
      `,
          [post.id],
        );
    }
    // Update PostReaction likeStatus
    await this.dataSource.query(
      `
      UPDATE  public."PostsReactions"
      SET "likeStatus" = $1
      WHERE "userId" = $2 and "postId" = $3
      `,
      [
        likeStatus,
        currentUserPostReaction.userId,
        currentUserPostReaction.postId,
      ],
    );
    return;
  }
}
