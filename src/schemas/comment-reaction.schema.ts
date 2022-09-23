import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema()
export class CommentReaction extends Document {
  @Prop()
  commentId: string;
  @Prop()
  userId: string;
  @Prop()
  likeStatus: string;
}

export const CommentReactionSchema = SchemaFactory.createForClass(CommentReaction);
