import { Router } from 'express'
import { findAll, findOne, add, update, remove } from './tarjeta.controller.js'
import { verificarToken } from '../shared/authMiddleware.js'
import { verificarRol } from '../shared/verificarRol.js'

export const tarjetaRouter = Router()

tarjetaRouter.get('/', verificarToken, findAll)
tarjetaRouter.get('/:idTarjeta', verificarToken, findOne)
tarjetaRouter.post('/', verificarToken,verificarRol(['empleado']), add)
tarjetaRouter.put('/:idTarjeta', verificarToken,verificarRol(['empleado']), update)
tarjetaRouter.patch('/:idTarjeta', verificarToken,verificarRol(['empleado']), update)
tarjetaRouter.delete('/:idTarjeta', verificarToken,verificarRol(['empleado']), remove)