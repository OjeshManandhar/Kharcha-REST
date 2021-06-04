// utils
import CustomError from 'utils/customError';

// types
import { CommonErrorHandler } from './types';

const commonErrorHandler: CommonErrorHandler = (err, msg) => {
  if (err instanceof CustomError) {
    throw err;
  } else {
    console.log('Error:', err);
    throw new CustomError(msg, 500, [{ message: err.message }]);
  }
};

export default commonErrorHandler;
