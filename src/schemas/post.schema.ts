import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PostReaction, PostReactionSchema } from './post-reaction.schema';

@Schema()
export class ExtendedLikesInfo extends Document {
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop()
  myStatus: string;
  @Prop({ type: [PostReactionSchema] })
  newestLikes: PostReaction[];
}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);

@Schema()
export class Post extends Document {
  @Prop()
  id: string;
  @Prop()
  title: string;
  @Prop()
  shortDescription: string;
  @Prop()
  content: string;
  @Prop()
  blogId: string;
  @Prop()
  blogName: string;
  @Prop()
  createdAt: string;
  // @Prop({ type: ExtendedLikesInfoSchema })
  // extendedLikesInfo: ExtendedLikesInfo;
}

export const PostSchema = SchemaFactory.createForClass(Post);
