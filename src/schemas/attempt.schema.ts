import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Attempt extends Document {
  @Prop()
  ip: string;
  @Prop()
  attemptDate: string;
  @Prop()
  url: string;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
