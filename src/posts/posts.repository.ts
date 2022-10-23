// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Blogger } from '../schemas/blogger.schema';
// import { ExtendedLikesInfo, Post } from '../schemas/post.schema';
// import { CustomResponseType } from '../types';
// import { CreatePostDto } from './dto/create-post.dto';
// import { FilterDto } from '../dto/filter.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
// import { ReactionsRepository } from '../likes/reactions.repository';
// import { PostReaction } from 'src/schemas/post-reaction.schema';

// @Injectable()
// export class PostsRepository {
//   constructor(private reactionsRepository: ReactionsRepository) {}

//   @InjectModel(Post.name) private postModel: Model<Post>;
 
//   async getPosts(
//     filterDto: FilterDto,
//     userInfo?: any,
//     bloggerId?: string,
//   ): Promise<CustomResponseType> {
//     const { SearchNameTerm, PageNumber = 1, PageSize = 10 } = filterDto;
  
//     let filter: any;
//     if (SearchNameTerm === null && bloggerId === undefined) filter = {};
//     if (SearchNameTerm === null && bloggerId !== undefined)
//       filter = { bloggerId };
//     if (SearchNameTerm !== null && bloggerId === undefined)
//       filter = { title: { $regex: SearchNameTerm } };
//     if (SearchNameTerm !== null && bloggerId !== undefined)
//       filter = { bloggerId, title: { $regex: SearchNameTerm } };

//     const returnFilter = {
//       _id: 0,
//       __v: 0,
//       'extendedLikesInfo._id': 0,
//       'extendedLikesInfo.newestLikes': { _id: 0, postId: 0, likeStatus: 0 },
//     };

//     let posts: Post[];

   
//     if (
//       !userInfo ||
//       !(await this.reactionsRepository.getUserAllPostsReactions(userInfo.sub))
//     ) {
//       posts = await this.postModel
//         .find(filter, returnFilter)
//         .skip((+PageNumber - 1) * +PageSize)
//         .limit(+PageSize)
//         .lean();

//       if (posts.length !== 0) {
//         posts.map(async (p) => {
//           p.extendedLikesInfo.myStatus = 'None';
         
//           if (p.extendedLikesInfo.newestLikes.length > 3)
//             p.extendedLikesInfo.newestLikes.splice(
//               3,
//               p.extendedLikesInfo.newestLikes.length - 3,
//             );
//         });
//       }
//     } else {
//       const userPostReactions =
//         await this.reactionsRepository.getUserAllPostsReactions(userInfo.sub);
    

//       posts = await this.postModel
//         .find(filter, returnFilter)
//         .skip((+PageNumber - 1) * +PageSize)
//         .limit(+PageSize)
//         .lean();

//       posts.map(async (p) => {
//         p.extendedLikesInfo.myStatus = 'None';

//         userPostReactions.forEach((r) => {
//           if (r.postId === p.id) {
//             p.extendedLikesInfo.myStatus = r.likeStatus;
//           }
//         });

//         if (p.extendedLikesInfo.newestLikes.length > 3)
//           p.extendedLikesInfo.newestLikes.splice(
//             3,
//             p.extendedLikesInfo.newestLikes.length - 3,
//           );
     
//         return p;
//       });
//     }

    

//     const totalCount: number = await this.postModel.countDocuments(filter);
//     const customResponse = {
//       pagesCount: Math.ceil(totalCount / +PageSize),
//       page: +PageNumber,
//       pageSize: +PageSize,
//       totalCount,
//       items: posts,
//     };

//     return customResponse;
//   }

//   async createPost(newPost: CreatePostDto): Promise<Post | null> {
//     await this.postModel.create(newPost);

//     const createdPost = await this.postModel.findOne(
//       { id: newPost.id },
//       { _id: 0, __v: 0, 'extendedLikesInfo._id': 0 },
//     );


//     return createdPost;
//   }

//   async getPost(id: string, userInfo?: any): Promise<Post> {
//     let post = await this.postModel
//       .findOne({ id }, { _id: 1, __v: 0, 'extendedLikesInfo._id': 0 })
//       .exec();

//     if (!post) throw new NotFoundException();

//     if (
//       !userInfo ||
//       !(await this.reactionsRepository.getUsersPostReaction(id, userInfo.sub))
//     ) {
//       post.extendedLikesInfo.myStatus = 'None';
//     } else {
//       const userPostReaction =
//         await this.reactionsRepository.getUsersPostReaction(id, userInfo.sub);

//       post.extendedLikesInfo.myStatus = userPostReaction.likeStatus;
//     }

//     const lastThreePostLikeReactions =
//       await this.reactionsRepository.getLastThreePostLikeReactions(id);
//     post.extendedLikesInfo.newestLikes = lastThreePostLikeReactions;
//     await post.save();
//     post = await this.postModel
//       .findOne(
//         { id },
//         {
//           _id: 0,
//           __v: 0,
//           'extendedLikesInfo._id': 0,
//           'extendedLikesInfo.newestLikes._id': 0,
//         },
//       )
//       .exec();

//     return post;
//   }

//   async updatePost(id: string, updatePostDto: UpdatePostDto): Promise<boolean> {
//     const { title, shortDescription, content, blogId } = updatePostDto;
//     const postToUpdate = await this.getPost(id);

//     postToUpdate.title = title;
//     postToUpdate.shortDescription = shortDescription;
//     postToUpdate.content = content;
//     postToUpdate.blogId = blogId;
//     await postToUpdate.save();
//     return true;
//   }

//   async deletePost(id: string): Promise<boolean> {
//     const isDeleted = await this.postModel.deleteOne({ id });
//     return isDeleted.deletedCount === 1;
//   }

//   async deleteAllPosts(): Promise<boolean> {
//     await this.postModel.deleteMany({});
//     const totalCount: number = await this.postModel.countDocuments();
//     if (totalCount !== 0) return false;
//     return true;
//   }

 
//   async getPostForReact(id: string, userInfo?: any): Promise<Post> {
//     let post = await this.postModel
//       .findOne(
//         { id },
//         {
//           __v: 0,
//         },
//       )
//       .exec();
//     if (!post) throw new NotFoundException();

//     return post;
//   }

//   async reactOnPost(reaction: PostReaction, post: any) {
//     if (reaction.likeStatus === 'Like') {
//       post.extendedLikesInfo.likesCount++;
//       post.extendedLikesInfo.newestLikes;
//       post.extendedLikesInfo.newestLikes.unshift(reaction);
//     } else if (reaction.likeStatus === 'Dislike') {
//       post.extendedLikesInfo.dislikesCount++;
//     }
//     post.save();
//   }
//   async reactOnPostAgain(
//     currentUserPostReaction: PostReaction,
//     post: any,
//     likeStatus: string,
//   ) {
//     if (likeStatus === 'Like') {
//       if (currentUserPostReaction.likeStatus === 'Like') return;
//       post.extendedLikesInfo.likesCount++;

//       post.extendedLikesInfo.newestLikes.unshift(currentUserPostReaction);
//       if (currentUserPostReaction.likeStatus === 'Dislike')
//         post.extendedLikesInfo.dislikesCount--;
//       currentUserPostReaction.likeStatus = 'Like';
//       currentUserPostReaction.save();
//       post.save();
//       return;
//     } else if (likeStatus === 'Dislike') {
//       if (currentUserPostReaction.likeStatus === 'Dislike') return;
//       post.extendedLikesInfo.dislikesCount++;

//       if (currentUserPostReaction.likeStatus === 'Like')
//         post.extendedLikesInfo.likesCount--;
//       currentUserPostReaction.likeStatus = 'Dislike';
//       currentUserPostReaction.save();
//       post.save();
//       return;
//     } else {
//       if (currentUserPostReaction.likeStatus === 'Dislike')
//         post.extendedLikesInfo.dislikesCount--;

//       if (currentUserPostReaction.likeStatus === 'Like')
//         post.extendedLikesInfo.likesCount--;
//       currentUserPostReaction.likeStatus = 'None';
//       currentUserPostReaction.save();
//       post.save();
//       return;
//     }
//   }
// }
