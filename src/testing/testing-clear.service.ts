import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { DataSource } from 'typeorm';
import { Attempt } from '../schemas/attempt.schema';
import { Blogger } from '../schemas/blogger.schema';
import { CommentReaction } from '../schemas/comment-reaction.schema';
import { Comment } from '../schemas/comment.schema';
import { PostReaction } from '../schemas/post-reaction.schema';
import { Post } from '../schemas/post.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class TestingClearService {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async dropTestBase() {
    try {
      await this.dataSource.query(`
      DELETE FROM public.bloggers
	    WHERE true;
      `);
    } catch {
      console.log('Bloggers collection does not exist');
    }
    try {
      await this.dataSource.query(`
      DELETE FROM public."Posts"
	    WHERE true;
      `);
    } catch {
      console.log('Posts collection does not exist');
    }
    try {
      await this.dataSource.query(`
      DELETE FROM public."Comments"
	    WHERE true;
      `);
    } catch {
      console.log('Comments collection does not exist');
    }
    try {
      await this.dataSource.query(`
      DELETE FROM public."PostReactions"
	    WHERE true;
      `);
    } catch {
      console.log('PostReactions collection does not exist');
    }
    try {
      await this.dataSource.query(`
      DELETE FROM public."Attempts"
	    WHERE true;
      `);
    } catch {
      console.log('Attempts collection does not exist');
    }
    try {
      await this.dataSource.query(`
      DELETE FROM public."CommentReactions"
	    WHERE true;
      `);
    } catch {
      console.log('CommentReactions collection does not exist');
    }
     try {
       await this.dataSource.query(`
      DELETE FROM public."Users"
	    WHERE true;
      `);
     } catch {
       console.log('Users collection does not exist');
     }
    return;
  }
}
