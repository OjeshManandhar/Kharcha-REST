// packages
import { model, Types, Schema } from 'mongoose';

// types
import type { IRecord } from './types';

const schema = new Schema<IRecord>({
  userId: {
    type: Types.ObjectId,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: new Date()
  },
  amount: {
    type: Number,
    require: true,
    default: 0.0
  },
  type: {
    type: String,
    enum: ['DEBIT', 'CREDIT'],
    default: 'DEBIT'
  },
  tags: {
    type: [String],
    required: true,
    default: []
  },
  description: {
    type: String,
    required: true,
    default: '',
    trim: true
  }
});

export default model<IRecord>('Record', schema);
