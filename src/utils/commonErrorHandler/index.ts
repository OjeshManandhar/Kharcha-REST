// utils
import CustomError from 'utils/customError';

// env
import { DEV_FEATURE } from 'env_config';

// types
import { CommonErrorHandler } from './types';

const commonErrorHandler: CommonErrorHandler = (err, msg) => {
  if (err instanceof CustomError) {
    throw err;
  } else {
    console.log('Error:', err);
    throw new CustomError(
      msg,
      500,
      DEV_FEATURE ? [{ message: err.message }] : undefined
    );
  }
};

export default commonErrorHandler;
