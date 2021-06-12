// packages
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// utils
import CustomError from 'utils/customError';

// global
import { Token } from 'global/types';

// env
import { JWT_SECRET } from 'env_config';

// types
import type { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers?.authorization;

  req.isAuth = false;

  if (!authHeader) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    next();
    return;
  }

  if (!JWT_SECRET) {
    next(new CustomError('JWT error'));
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      const expiredAt = (err as { expiredAt: Date | undefined }).expiredAt;

      next(
        new CustomError('Invalid Token', 401, [
          {
            message: expiredAt ? 'Token expired' : 'Invalid Signature',
            field: 'Authorization'
          }
        ])
      );

      return;
    }

    const decodedToken = decoded as Token;

    if (decodedToken && decodedToken._id) {
      req.isAuth = true;
      req.userId = mongoose.Types.ObjectId(decodedToken._id);
      next();
    } else {
      next();
    }
  });
};
