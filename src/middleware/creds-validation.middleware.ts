import {
  Injectable,
  UnauthorizedException,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CredsValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    debugger;
    if (!req.headers.authorization && Object.keys(req.body).length === 0)
      throw new UnauthorizedException();
    next();
  }
}
