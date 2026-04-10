import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./mesa.controller.js";
import { verificarToken } from "../shared/authMiddleware.js";
import { verificarRol } from "../shared/verificarRol.js"; 

export const mesaRouter = Router()

mesaRouter.get('/', verificarToken, findAll)
mesaRouter.get('/:nroMesa', verificarToken, findOne) 
mesaRouter.post('/', verificarToken, verificarRol(['empleado']), add)
mesaRouter.put('/:nroMesa', verificarToken, verificarRol(['empleado']), update) 
mesaRouter.patch('/:nroMesa', verificarToken, verificarRol(['empleado']), update) 
mesaRouter.delete('/:nroMesa', verificarToken, verificarRol(['empleado']), remove) 