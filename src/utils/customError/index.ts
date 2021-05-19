// types
import { ErrorData } from './types';

class CustomError extends Error {
  status: number;
  data: ErrorData;

  constructor(
    message = 'An error occured',
    status = 500,
    data: ErrorData = []
  ) {
    super(message);

    this.status = status;
    this.data = data;
  }
}

export type { ErrorData };
export default CustomError;
