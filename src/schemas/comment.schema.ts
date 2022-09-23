import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


import { Document } from 'mongoose';



@Schema()
export class LikesInfo extends Document {
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop()
  myStatus: string;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);


@Schema()
export class Comment extends Document {
  @Prop()
  id: string;
  @Prop()
  postId: string;
  @Prop()
  content: string;
  @Prop()
  userId: string;
  @Prop()
  userLogin: string;
  @Prop()
  addedAt: string;
  @Prop({type: LikesInfoSchema})
  likesInfo: LikesInfo
}

export const CommentSchema = SchemaFactory.createForClass(Comment)


