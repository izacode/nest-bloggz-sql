// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { UpdateCommentDto } from './dto/update-comment.dto';
// import { Comment } from '../schemas/comment.schema';
// import { FilterDto } from '../dto/filter.dto';
// import { CustomResponseType } from '../types';
// import { ReactionsRepository } from '../likes/reactions.repository';
// import { CommentReaction } from 'src/schemas/comment-reaction.schema';

// @Injectable()
// export class CommentsRepository {
//   constructor(
//     private reactionsRepository: ReactionsRepository,
//     @InjectModel(Comment.name) private commentModel: Model<Comment>,
//   ) {}

//   async getCommentById(id: string, userInfo?: any): Promise<Comment> {
//     let comment = await this.commentModel.findOne({ id }, '-__v');
//     if (!comment) throw new NotFoundException();
//     if (
//       !userInfo ||
//       !(await this.reactionsRepository.getUsersCommentReaction(
//         id,
//         userInfo.sub,
//       ))
//     ) {
//       comment.likesInfo.myStatus = 'None';
//     } else {
//       const userCommentReaction =
//         await this.reactionsRepository.getUsersCommentReaction(
//           id,
//           userInfo.sub,
//         );

//       comment.likesInfo.myStatus = userCommentReaction.likeStatus;
//     }
//     await comment.save();
//     const commentToReturn = await this.commentModel.findOne(
//       { id },
//       { _id: 0, __v: 0, 'likesInfo._id': 0, postId: 0 },
//     );
//     const commentToDefaultLikestatus = await this.commentModel.findOne(
//       { id },
//       '-__v',
//     );
//     // new added
//     commentToDefaultLikestatus.likesInfo.myStatus = 'None';
//     await comment.save();

//     return commentToReturn;
//   }

//   async createComment(newComment: any): Promise<Comment> {
//     await this.commentModel.create(newComment);
//     const comment = this.commentModel.findOne(
//       { id: newComment.id },
//       { _id: 0, __v: 0, 'likesInfo._id': 0, postId: 0 },
//     );
//     return comment;
//   }

//   async getPostComments(
//     id: string,
//     filterDto: FilterDto,
//     userInfo?: any,
//   ): Promise<CustomResponseType> {
//     const { PageNumber, PageSize } = filterDto;

//     let postComments: Comment[];

//     const restrictProperties = '-_id -postId -__v -likesInfo._id';
//     if (
//       !userInfo ||
//       !(await this.reactionsRepository.getUsersAllCommentsReactions(
//         userInfo.sub,
//       ))
//     ) {
//       postComments = await this.commentModel
//         .find({ postId: id }, restrictProperties)
//         .skip((+PageNumber - 1) * +PageSize)
//         .limit(+PageSize)
//         .exec();

//       if (postComments.length !== 0) {
//         postComments.map((c) => (c.likesInfo.myStatus = 'None'));
//       }
//     } else {
//       const userCommentsReactions =
//         await this.reactionsRepository.getUsersAllCommentsReactions(
//           userInfo.sub,
//         );

//       postComments = (
//         await this.commentModel
//           .find({ postId: id }, restrictProperties)
//           .skip((+PageNumber - 1) * +PageSize)
//           .limit(+PageSize)
//           .exec()
//       ).map((c) => {
//         c.likesInfo.myStatus = 'None';
//         userCommentsReactions.forEach((r) => {
//           if (r.commentId === c.id)
//             return (c.likesInfo.myStatus = r.likeStatus);
//         });

//         return c;
//       });
//     }

//     const totalCount: number = await this.commentModel.countDocuments({
//       postId: id,
//     });

//     const customResponse: CustomResponseType = {
//       pagesCount: Math.ceil(totalCount / +PageSize),
//       page: +PageNumber,
//       pageSize: +PageSize,
//       totalCount,
//       items: postComments,
//     };
//     return customResponse;
//   }

//   async updateComment(
//     id: string,
//     updateCommentDto: UpdateCommentDto,
//   ): Promise<boolean> {
//     const { content } = updateCommentDto;
//     const commentToUpdate = await this.getCommentById(id);

//     commentToUpdate.content = content;
//     await commentToUpdate.save();
//     return true;
//   }

//   async deleteComment(id: string): Promise<boolean> {
//     const isDeleted = await this.commentModel.deleteOne({ id });
//     return isDeleted.deletedCount === 1;
//   }

//   async getCommentByIdForReaction(
//     id: string,
//     userInfo?: any,
//   ): Promise<Comment> {
//     let comment = await this.commentModel.findOne({ id }, '-__v');
//     if (!comment) throw new NotFoundException();
//     if (
//       !userInfo ||
//       !(await this.reactionsRepository.getUsersAllCommentsReactions(
//         userInfo.sub,
//       ))
//     ) {
//       comment.likesInfo.myStatus = 'None';
//     } else {
//       const userCommentReaction =
//         await this.reactionsRepository.getUsersCommentReaction(
//           id,
//           userInfo.sub,
//         );

//       comment.likesInfo.myStatus = userCommentReaction.likeStatus;
//     }
//     comment.save();
//     const commentToReturn = await this.commentModel.findOne(
//       { id },
//       { _id: 1, __v: 0, 'likesInfo._id': 0, postId: 0 },
//     );

//     return commentToReturn;
//   }

//   async reactOnComment(reaction: CommentReaction, comment: any) {
//     // ???
//     comment.likesInfo.myStatus = reaction.likeStatus;
//     // ???
//     if (reaction.likeStatus === 'Like') {
//       comment.likesInfo.likesCount++;
//     } else if (reaction.likeStatus === 'Dislike') {
//       comment.likesInfo.dislikesCount++;
//     }
//     comment.save();
//     return;
//   }
//   async reactOnCommentAgain(
//     currentUserCommentReaction: CommentReaction,
//     comment: any,
//     likeStatus: string,
//   ) {
//     if (likeStatus === 'Like') {
//       if (currentUserCommentReaction.likeStatus === 'Like') return;
//       comment.likesInfo.likesCount++;
//       if (currentUserCommentReaction.likeStatus === 'Dislike')
//         comment.likesInfo.dislikesCount--;
//       comment.save();
//       currentUserCommentReaction.likeStatus = 'Like';
//       currentUserCommentReaction.save();
//       return;
//     } else if (likeStatus === 'Dislike') {
//       if (currentUserCommentReaction.likeStatus === 'Dislike') return;
//       comment.likesInfo.dislikesCount++;
//       if (currentUserCommentReaction.likeStatus === 'Like')
//         comment.likesInfo.likesCount--;
//       comment.save();
//       currentUserCommentReaction.likeStatus = 'Dislike';
//       currentUserCommentReaction.save();
//       return;
//     } else {
//       if (currentUserCommentReaction.likeStatus === 'Dislike')
//         comment.likesInfo.dislikesCount--;

//       if (currentUserCommentReaction.likeStatus === 'Like')
//         comment.likesInfo.likesCount--;
//       currentUserCommentReaction.likeStatus = 'None';
//       currentUserCommentReaction.save();
//       comment.save();
//       return;
//     }
//     return;
//   }
// }
