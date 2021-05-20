// pcakages
import 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      isAuth: boolean;
    }
  }
}
