import { Injectable, NotFoundException } from '@nestjs/common';

import { CustomResponseType } from 'src/types';
import { CreateBloggerDto } from './dto/create-blogger.dto';
import { FilterDto } from '../dto/filter.dto';
import { UpdateBloggerDto } from './dto/update-blogger.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blogger } from './blogger.entity';

@Injectable()
export class BloggersRawSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getBloggers(filterDto: FilterDto): Promise<CustomResponseType> {
    const { SearchNameTerm, PageNumber, PageSize } = filterDto;
    const offset = (+PageNumber - 1) * +PageSize || 0;
    const bloggers = await this.dataSource.query(
      `
     SELECT id, name, "youtubeUrl", "createdAt"
     FROM bloggers
     WHERE bloggers.name LIKE ('%'||$1||'%') 
     LIMIT $2 OFFSET $3
    `,
      [SearchNameTerm, PageSize, offset],
    );

    const totalCount: number = +(
      await this.dataSource.query(`
      SELECT Count(*)
	    FROM public.bloggers`)
    )[0].count;

    const customResponse = {
      pagesCount: Math.ceil(totalCount / +PageSize),
      page: +PageNumber,
      pageSize: +PageSize,
      totalCount,
      items: bloggers,
    };

    return customResponse;
  }

  async createBlogger(newBlogger: any): Promise<Blogger> {
    const { name, youtubeUrl, createdAt } = newBlogger;
    await this.dataSource.query(
      `
    INSERT INTO public.bloggers ("name", "youtubeUrl", "createdAt")
	  VALUES ($1, $2, $3)`,
      [name, youtubeUrl, createdAt],
    );
    const createdBlogger: Blogger = await this.dataSource.query(
      `
    SELECT id, name, "youtubeUrl", "createdAt"
	  FROM public.bloggers
    WHERE name = $1
	  `,
      [name],
    );

    return createdBlogger[0];
  }

  async getBlogger(id: string): Promise<Blogger> {
    const foundBlogger = await this.dataSource.query(
      `
    SELECT id, name, "youtubeUrl", "createdAt"
	  FROM "bloggers"
    WHERE id = $1`,
      [id],
    );
    if (foundBlogger.length === 0) throw new NotFoundException({});
    return foundBlogger[0] as Blogger;
  }

  async updateBlogger(
    id: string,
    updateBloggerDto: UpdateBloggerDto,
  ): Promise<void> {
    const { name, youtubeUrl } = updateBloggerDto;
    // await this.getBlogger(id);
    const result = await this.dataSource.query(
      `
     UPDATE public.bloggers
	   SET name=$2, "youtubeUrl"=$3
	   WHERE id= $1`,
      [id, name, youtubeUrl],
    );
    if (result[1] === 0) throw new NotFoundException({});
    return;
  }

  async deleteBlogger(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public.bloggers
	  WHERE id= $1;`,
      [id],
    );
    if (result[1] === 0) throw new NotFoundException({});
    return;
  }
}
