import { Injectable, NotFoundException } from '@nestjs/common';

import { CustomResponseType } from '../types';
import { CreateBloggerDto } from './dto/create-blogger.dto';
import { FilterDto } from '../dto/filter.dto';
import { UpdateBloggerDto } from './dto/update-blogger.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';
import { Blogger } from './blogger.entity';

@Injectable()
export class BloggersQbRepository {
  constructor(
    // @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Blogger)
    protected bloggersRepository: Repository<Blogger>,
  ) {}

  async getBloggers(filterDto: FilterDto): Promise<CustomResponseType> {

    const { SearchNameTerm, PageNumber, PageSize } = filterDto;
    const offset = (+PageNumber - 1) * +PageSize || 0;

    const bloggers = await this.bloggersRepository
      .createQueryBuilder('b')
      .where('b.name = :name', { name: Like(`'%'${SearchNameTerm}'%`) })
      .limit(+PageSize)
      .offset(offset);


    // const bloggers = await this.dataSource.query(
    //   `
    //  SELECT id, name, "youtubeUrl", "createdAt"
    //  FROM bloggers
    //  WHERE bloggers.name LIKE ('%'||$1||'%')
    //  LIMIT $2 OFFSET $3
    // `,
    //   [SearchNameTerm, PageSize, offset],
    // );

    const totalCount: number = (await this.bloggersRepository
      .createQueryBuilder('b')
      .getMany()).length;

    const customResponse = {
      pagesCount: Math.ceil(totalCount / +PageSize),
      page: +PageNumber,
      pageSize: +PageSize,
      totalCount,
      items: bloggers as any as Blogger[],
    };

    return customResponse ;
  }

  async createBlogger(newBlogger: any): Promise<Blogger> {

    await this.bloggersRepository.save(newBlogger);

    return this.bloggersRepository.findOneBy({ name: newBlogger.name });
  }

  async getBlogger(id: string): Promise<Blogger> {
    const blogger = await this.bloggersRepository.findOneBy({ id });

    if (!blogger) throw new NotFoundException({});

    return blogger;
  }

  async updateBlogger(
    id: string,
    updateBloggerDto: UpdateBloggerDto,
  ): Promise<void> {
    // await this.getBlogger(id);

    const result = await this.bloggersRepository.update(id, updateBloggerDto);
    if (result.affected === 0) throw new NotFoundException({});
    return;
  }

  async deleteBlogger(id: string): Promise<boolean> {
    // await this.getBlogger(id);

    const result = await this.bloggersRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException({});
    return;
  }
}
