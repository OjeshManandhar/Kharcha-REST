// types
import type { Types } from 'mongoose';
import type { GenerateQuery } from './types';

const generateQuery: GenerateQuery<Types.ObjectId | Date | number> = (
  start,
  end
) => {
  if (start && end) {
    if (start.toString() === end.toString()) {
      return start;
    }

    return { $gte: start, $lte: end };
  } else if (start && !end) {
    return { $gte: start };
  } else if (!start && end) {
    return { $lte: end };
  }

  return null;
};

export default generateQuery;
