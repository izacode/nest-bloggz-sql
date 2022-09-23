import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Attempt } from '../schemas/attempt.schema';
import * as datefns from 'date-fns';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// TODO --- >> Rate limiting,throtteling inside security chapter 
// this isnstead of express version which is below

@Injectable()
export class AttemptsMiddleware implements NestMiddleware {
  @InjectModel(Attempt.name) private attemptModel: Model<Attempt>;
  async use(req: Request, res: Response, next: NextFunction) {
    const ip: string = req.ip;
    const attemptDate: Date = new Date();
    const url: string = req.url;
    const attempt = {
      ip,
      attemptDate,
      url,
    };

    try {
      await this.attemptModel.create(attempt);
    } catch (e) {
      console.log(attempt + 'failed to create');
    }
    const tenSecAgo = datefns.sub(new Date(), { seconds: 100 });
    const result = await this.attemptModel.countDocuments({
      ip,
      attemptDate: { $gt: tenSecAgo },
      url,
    });
    if (result > 5) return res.sendStatus(429);
    next();
  }
}
