import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export function getCurrentUser(req: Request): JwtPayload | null {
  return req.user;
}

export function getUserId(req: Request): string {
  if (!req.user?.userId) {
    throw new Error("User ID not found in request");
  }
  return req.user.userId;
}
