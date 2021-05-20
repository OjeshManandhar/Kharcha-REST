// packages
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

// utils
import CustomError from 'utils/customError';

// global
import { Token } from 'global/types';

// env
import { JWT_SECRET } from 'env_config';

export default (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.isAuth = false;
    next();
    return;
  }

  if (!JWT_SECRET) {
    next();
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.isAuth = false;
      next(new CustomError('Token expired', 401));
    }

    const decodedToken = decoded as Token;

    if (decodedToken && decodedToken._id) {
      req.userId = decodedToken._id;
      req.isAuth = true;
      next();
    } else {
      req.isAuth = false;
      next();
    }
  });
};
