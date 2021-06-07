export const PORT = process.env.PORT;

export const DEV_FEATURE =
  process.env.DEV_FEATURE?.toLowerCase() === 'true' ? true : false;

export const MONGO_DB = process.env.MONGO_DB;
export const MONGO_USER = process.env.MONGO_USER;
export const MONGO_PASS = process.env.MONGO_PASS;

export const JWT_SECRET = process.env.JWT_SECRET;
