import 'dotenv/config'

export const PORT = process.env.PORT || 3000;
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY || '@$@this_|_is@$@|@$@my_|_powerfull@$@|@$@secret_|_key@$@|@$@363_|_456@$@|@$@****_|_{}[]@$|$@^^^^';

export const ACCEPTED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:4200,http://localhost:9876')
  .split(',')
  .map(origin => origin.trim());