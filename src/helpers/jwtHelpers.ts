import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string
): string => {
  return jwt.sign(payload, secret, {
    expiresIn: expireTime,
  });
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  console.log(token, secret, 'token, secret');
  
  const result = jwt.verify(token, secret) as JwtPayload;
  console.log(result, 'result');
  return result;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
