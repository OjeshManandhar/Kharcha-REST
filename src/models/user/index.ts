// packages
import { model, Schema } from 'mongoose';

// types
import type { IUser } from './types';
import type { Model } from 'mongoose';

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

let User: Model<IUser>;

try {
  User = model<IUser>('User');
} catch {
  User = model<IUser>('User', schema);
}

export default User;
export type { IUser };
