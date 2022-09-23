import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema()
export class PostReaction extends Document {
  @Prop()
  addedAt: string;
  @Prop()
  userId: string;
  @Prop()
  login: string;

  @Prop()
  postId: string;
  @Prop()
  likeStatus: string;
}

export const PostReactionSchema = SchemaFactory.createForClass(PostReaction);
