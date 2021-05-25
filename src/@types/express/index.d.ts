// pcakages
import 'express';

// types
import type { Mongoose } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      userId?: Mongoose.ObjectId;
      isAuth: boolean;
    }
  }
}
