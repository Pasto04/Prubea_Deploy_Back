import { Router } from "express"
import { add, findAll, findOne, remove, update } from "./proveedor.controller.js"
import { verificarToken } from "../shared/authMiddleware.js"
import { verificarRol } from "../shared/verificarRol.js"


export const proveedorRouter = Router()

proveedorRouter.get('/', verificarToken, verificarRol(['empleado']), findAll)
proveedorRouter.get('/:id', verificarToken, verificarRol(['empleado']), findOne)
proveedorRouter.post('/', verificarToken, verificarRol(['empleado']), add)
proveedorRouter.put('/:id', verificarToken, verificarRol(['empleado']), update)
proveedorRouter.patch('/:id', verificarToken, verificarRol(['empleado']), update)
proveedorRouter.delete('/:id', verificarToken, verificarRol(['empleado']), remove)