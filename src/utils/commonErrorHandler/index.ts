// utils
import CustomError from 'utils/customError';

// types
import { CommonErrorHandler } from './types';

const commonErrorHandler: CommonErrorHandler = (err, msg) => {
  if (err instanceof CustomError) {
    throw err;
  } else {
    throw new CustomError(msg);
  }
};

export default commonErrorHandler;