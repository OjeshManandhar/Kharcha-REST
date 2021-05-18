// types
import { ErrorData } from './types';

class CustomError extends Error {
  status: number;
  data: ErrorData;

  constructor(message: string, status: number, data: ErrorData) {
    super(message);

    this.status = status || 500;
    this.data = data || [];
  }
}

export type { ErrorData };
export default CustomError;
