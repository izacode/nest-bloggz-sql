import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(
    `Request start ========================================================================================`,
  );
  console.log(`Request method...`, req.method);
  console.log(`Request path...`, req.url);
  console.log(`Request headers...`, req.headers);
  console.log(`Request body...`, req.body);
  
  console.log(
    `Request end ========================================================================================`,
  );
  next();
}
