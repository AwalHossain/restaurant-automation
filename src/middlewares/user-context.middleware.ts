import { NextFunction, Request, Response } from "express";
import { AsyncLocalStorage } from 'node:async_hooks';
const asyncLocalStorage = new AsyncLocalStorage();

export const userContext = new AsyncLocalStorage<{
  userId: string;
  role: string;
  user: any;
}>();

export const userContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const context = {
    userId: req.user.userId,
    role: req.user.role,
    user: req.user
  };

  userContext.run(context, next);
};

export const getCurrentUserId = () => {
  const context = userContext.getStore();
  console.log(context, "context from getCurrentUserId");
  if (!context) {
    throw new Error("User context not available");
  }
  return context.userId;
};
