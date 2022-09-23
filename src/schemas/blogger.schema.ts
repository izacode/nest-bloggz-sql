import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Blogger extends Document {
    @Prop()
    id: string;
    @Prop()
    name: string;
    @Prop()
    youtubeUrl: string
}

export const BloggerSchema = SchemaFactory.createForClass(Blogger)

// export type BloggerDocument = Blogger & Document