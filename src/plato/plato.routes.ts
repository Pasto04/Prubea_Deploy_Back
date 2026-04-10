import { Router} from "express"
import { findAll, findOne, add, update, remove, sanitizePlato } from "./plato.controller.js"
import { verificarToken } from "../shared/authMiddleware.js"
import { verificarRol } from "../shared/verificarRol.js"

export const platoRouter = Router()

platoRouter.get('/', findAll)
platoRouter.get('/:numPlato', findOne)
platoRouter.post('/', verificarToken, verificarRol(['empleado']), sanitizePlato, add)
platoRouter.put('/:numPlato', verificarToken, verificarRol(['empleado']), sanitizePlato, update)
platoRouter.patch('/:numPlato', verificarToken,verificarRol(['empleado']), sanitizePlato, update)
platoRouter.delete('/:numPlato', verificarToken,verificarRol(['empleado']), remove)



