import { NextFunction, Request, Response } from "express";
import { AsyncLocalStorage } from "node:async_hooks";

export const userContext = new AsyncLocalStorage<{
  userId: string;
  user: any;
}>();

export const userContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.user, "req.user");
  const context = {
    userId: req.user?.userId ?? "",
    user: req.user
  };

  userContext.run(context, () => {
    next();
  });
};
