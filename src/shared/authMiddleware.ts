import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { SECRET_JWT_KEY } from '../shared/config.js'
import { UsuarioUnauthorizedError } from '../shared/errors/entityErrors/usuario.errors.js'

function verificarToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.accessToken

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se encontró el token.' })
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY)
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido.' })
  }
}

export { verificarToken };