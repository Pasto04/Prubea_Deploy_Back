import { verificarToken } from '../shared/authMiddleware.js'
import { findAll, findOne, add, sanitizeIngrediente, update, remove } from './ingrediente.controller.js'
import { Router } from 'express'
import { verificarRol } from '../shared/verificarRol.js'

export const ingredienteRouter = Router()

ingredienteRouter.get('/', findAll)
ingredienteRouter.get('/:cod', findOne)
ingredienteRouter.post('/', verificarToken, verificarRol(['empleado']), sanitizeIngrediente, add)
ingredienteRouter.put('/:cod', verificarToken, verificarRol(['empleado']), sanitizeIngrediente, update)
ingredienteRouter.patch('/:cod', verificarToken, verificarRol(['empleado']), sanitizeIngrediente, update)
ingredienteRouter.delete('/:cod', verificarToken, verificarRol(['empleado']), remove)