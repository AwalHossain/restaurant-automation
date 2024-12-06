import { Request } from "express";

export function getCurrentUser(req: Request) {
  return req.user;
}

export function getUserId(req: Request): string {
  if (!req.user?.userId) throw new Error("User ID not found");
  return req.user.userId;
}
