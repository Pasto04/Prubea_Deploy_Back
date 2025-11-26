import 'dotenv/config'

// Extraemos las variables, dando prioridad a process.env (Render)
// Si no existen, usa los valores por defecto (Local)
export const PORT = process.env.PORT || 3000;
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

// CLAVE CRÍTICA: Debe leerse de Render. 
// El valor por defecto es solo para desarrollo local.
export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY || '@$@this_|_is@$@|@$@my_|_powerfull@$@|@$@secret_|_key@$@|@$@363_|_456@$@|@$@****_|_{}[]@$|$@^^^^';

// ORIGENES PERMITIDOS: Lee la lista separada por comas de Render
export const ACCEPTED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:4200,http://localhost:9876')
  .split(',')
  .map(origin => origin.trim());