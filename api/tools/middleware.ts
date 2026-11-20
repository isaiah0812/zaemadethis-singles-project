import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import 'dotenv/config';

export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).send('Authorization header required');
    return;
  }

  if (!token.startsWith('Bearer ')) {
    res.status(401).send('Bearer token required for Authorizatio header');
  }

  try {
    jwt.verify(token.split(' ')[1]!, process.env.JWT_SECRET!);
    next();
  } catch (err) {
    res.status(401);

    if (err instanceof TokenExpiredError) {
      res.send('Token expired');
    } else {
      res.send('Invalid Token');
    }
  }

  return;
}