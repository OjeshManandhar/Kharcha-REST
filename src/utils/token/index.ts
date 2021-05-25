// packages
import jwt from 'jsonwebtoken';

// utils
import CustomError from 'utils/customError';

// env
import { JWT_SECRET } from 'env_config';

// types
import type { Token } from 'global/types';
import type { EncodeIdToJwt } from './types';

export const encodeIdToJwt: EncodeIdToJwt = _id => {
  if (!JWT_SECRET) {
    throw new CustomError('JWT error');
  }

  const tokenObj: Token = { _id };

  const token = jwt.sign(tokenObj, JWT_SECRET, {
    expiresIn: '1d'
  });

  return token;
};
