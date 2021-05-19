// packages
import { Schema, model } from 'mongoose';

// types
import type { IUser } from './types';

const schema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tags: { type: [String], required: true, default: [] }
});

export default model<IUser>('User', schema);
