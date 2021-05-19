// packages
import { Schema, model } from 'mongoose';

// types
import type { IUser } from './types';

const schema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minLength: [4, 'Must be at least 4, got {VALUE}'],
    maxLength: [15, 'Can be at most 15, got {VALUE}']
  },
  password: { type: String, required: true, trim: true },
  tags: { type: [String], required: true, default: [] }
});

export default model<IUser>('User', schema);
