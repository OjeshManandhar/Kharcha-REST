// packages
import { Schema, model } from 'mongoose';

// types
import type { IUser } from './types';

const schema = new Schema<IUser>({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  avatar: { type: [String], required: true, default: [] }
});

export default model<IUser>('User', schema);
