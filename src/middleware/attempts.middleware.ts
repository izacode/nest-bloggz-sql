import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Attempt } from '../schemas/attempt.schema';
import * as datefns from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// TODO --- >> Rate limiting,throtteling inside security chapter 
// this isnstead of express version which is below

@Injectable()
export class AttemptsMiddleware implements NestMiddleware {
  @InjectDataSource() protected dataSource: DataSource;
  async use(req: Request, res: Response, next: NextFunction) {
    const ip: string = req.ip;
    const attemptDate: Date = new Date();
    const url: string = req.url;
   
    try {
      await this.dataSource.query(
        `
    INSERT INTO public."Attempts"
    (id, "attemptDate", url)
	  VALUES ($1, $2, $3);
    `,
        [ip, attemptDate, url],
      );
    } catch (e) {
      console.log('failed to create attempt from ' + ip);
    }
    const tenSecAgo = datefns.sub(new Date(), { seconds: 100 });

    const result = await this.dataSource.query(
      `
    SELECT COUNT(*) 
    FROM public."Attempts"
    WHERE ip = $1 AND 'attemptDate' > $2 AND url = $3
    (id, "attemptDate", url)
	  VALUES ($1, $2, $3);
    `,
      [ip, tenSecAgo, url],
    );

    if (result > 5) return res.sendStatus(429);
    next();
  }
}
