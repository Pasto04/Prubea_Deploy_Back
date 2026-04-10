import { Router } from "express"
import { findAll, findOne, add, update, remove, sanitizeBebida} from './bebida.controller.js'
import { verificarToken } from "../shared/authMiddleware.js"
import { verificarRol } from "../shared/verificarRol.js"

export const bebidaRouter = Router()

bebidaRouter.get('/', findAll)
bebidaRouter.get('/:codBebida', findOne)
bebidaRouter.post('/', verificarToken, verificarRol(['empleado']), sanitizeBebida, add)
bebidaRouter.put('/:codBebida', verificarToken, verificarRol(['empleado']), sanitizeBebida, update )
bebidaRouter.patch('/:codBebida', verificarToken, verificarRol(['empleado']), sanitizeBebida, update )
bebidaRouter.delete('/:codBebida', verificarToken, verificarRol(['empleado']), remove)