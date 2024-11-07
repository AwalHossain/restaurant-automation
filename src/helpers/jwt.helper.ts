

import jwt from "jsonwebtoken";
import env from "../config";
import { TokenPayload } from "../interfaces/auth";



export class JwtUtils {

    private static readonly ACCESS_TOKEN_SECRET = env.JWT_SECRET;
    private static readonly ACCESS_TOKEN_EXPIRES_IN = env.JWT_EXPIRES_IN;
    private static readonly REFRESH_TOKEN_SECRET = env.JWT_REFRESH_SECRET;
    private static readonly REFRESH_TOKEN_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;

    static generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN });
    }

    static generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN });
    }

    static verifyAccessToken(token: string): TokenPayload {
        return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
    }

    static verifyRefreshToken(token: string): TokenPayload {
        return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
    }
}
