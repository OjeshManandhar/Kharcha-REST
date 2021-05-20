// packages
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

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

  if (!JWT_SECRET) {
    next();
    return;
  }

  try {
    const decodedToken: Token = jwt.verify(token, JWT_SECRET) as Token;

    console.log('decoded token:', decodedToken);

    if (decodedToken._id) {
      req.userId = decodedToken._id;
      req.isAuth = true;
      next();
    } else {
      req.isAuth = false;
      next();
      return;
    }
  } catch (err) {
    req.isAuth = false;
    next();
    return;
  }
};
