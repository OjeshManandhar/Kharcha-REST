export type GenerateQuery<T> = (
  idStart: ?T,
  idEnd: ?T
) =>
  | T
  | {
      $gte: T;
      $lte: T;
    }
  | { $gte: T }
  | { $lte: T }
  | null;
