import { NextFunction, Request, Response } from 'express';

const catchAsync =<T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) =>{

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };

}

export default catchAsync;
