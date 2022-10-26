import { Injectable } from '@nestjs/common';
import { CustomResponseType } from '../types';
import { CreateBloggerDto } from './dto/create-blogger.dto';
import { FilterDto } from '../dto/filter.dto';
import { UpdateBloggerDto } from './dto/update-blogger.dto';
import { BloggersRawSqlRepository } from './bloggers.raw-sql-repository';


@Injectable()
export class BloggersService {
  constructor(protected bloggersRepository: BloggersRawSqlRepository) {}

  async getBloggers(filterDto: FilterDto): Promise<CustomResponseType> {
    return this.bloggersRepository.getBloggers(filterDto);
  }

  async createBlogger(createBloggerDto: CreateBloggerDto) {
    debugger
    // await validateOrReject(createBloggerDto);
    const { name, youtubeUrl } = createBloggerDto;
    const newBlogger: any = {
      name,
      youtubeUrl,
      createdAt: new Date().toISOString()
    };

    return this.bloggersRepository.createBlogger(newBlogger);
  }

  async getBlogger(id: string) {
    return this.bloggersRepository.getBlogger(id);
  }
  async updateBlogger(
    id: string,
    updateBloggerDto: UpdateBloggerDto,
  ): Promise<void> {
    return this.bloggersRepository.updateBlogger(id, updateBloggerDto);
  }

  async deleteBlogger(id: string): Promise<boolean> {
    return this.bloggersRepository.deleteBlogger(id);
  }
}
