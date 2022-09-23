import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blogger } from '../schemas/blogger.schema';
import { CustomResponseType } from 'src/types';
import { CreateBloggerDto } from './dto/create-blogger.dto';
import { FilterDto } from '../dto/filter.dto';
import { UpdateBloggerDto } from './dto/update-blogger.dto';
import { Post } from '../schemas/post.schema';

@Injectable()
export class BloggersRepository {
  constructor(
    @InjectModel(Blogger.name) private bloggerModel: Model<Blogger>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async getBloggers(filterDto: FilterDto): Promise<CustomResponseType> {
    const { SearchNameTerm, PageNumber = 1, PageSize = 10 } = filterDto;
    let filter =
      SearchNameTerm === null ? {} : { name: { $regex: SearchNameTerm } };
    const bloggers: Blogger[] = await this.bloggerModel
      .find(filter, '-_id -__v')
      .skip((+PageNumber - 1) * +PageSize)
      .limit(+PageSize)
      .exec();
    const totalCount: number = await this.bloggerModel.countDocuments(filter);

    const customResponse = {
      pagesCount: Math.ceil(totalCount / +PageSize),
      page: +PageNumber,
      pageSize: +PageSize,
      totalCount,
      items: bloggers,
    };

    return customResponse;
  }

  async createBlogger(newBlogger: CreateBloggerDto): Promise<Blogger> {
    await this.bloggerModel.create(newBlogger);
    const createdBlogger = await this.bloggerModel.findOne(
      { id: newBlogger.id },
      '-_id -__v',
    );
    return createdBlogger;
  }

  async getBlogger(id: string): Promise<Blogger> {
    const foundBlogger = await this.bloggerModel
      .findOne({ id }, '-_id -__v')
      .exec();
    if (!foundBlogger) throw new NotFoundException({});
    return foundBlogger;
  }
  async updateBlogger(
    id: string,
    updateBloggerDto: UpdateBloggerDto,
  ): Promise<boolean> {
    const { name, youtubeUrl } = updateBloggerDto;
    const blogger = await this.getBlogger(id);

    blogger.name = name;
    blogger.youtubeUrl = youtubeUrl;
    await blogger.save();
    return true;
  }

  async deleteBlogger(id: string): Promise<boolean> {
    const isDeleted = await this.bloggerModel.deleteOne({ id });
    return isDeleted.deletedCount === 1;
  }

  async deleteAllBloggers(): Promise<boolean> {
    await this.bloggerModel.deleteMany({});
    const totalCount: number = await this.bloggerModel.countDocuments({});
    if (totalCount !== 0) return false;
    return true;
  }
}
