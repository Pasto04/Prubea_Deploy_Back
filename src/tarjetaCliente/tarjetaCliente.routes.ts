import { Router } from "express"
import { findAll, findOne, add, sanitizeTarjetaCliente, update, remove } from "./tarjetaCliente.controller.js"
import { verificarToken } from "../shared/authMiddleware.js"
import { verificarRol } from "../shared/verificarRol.js"

export const tarjetaClienteRouter = Router()

tarjetaClienteRouter.get('/:id/tarjetas', verificarToken, verificarRol(['cliente']), findAll)
tarjetaClienteRouter.get('/:id/tarjetas/:idTarjeta', verificarToken,verificarRol(['cliente']), findOne) 
tarjetaClienteRouter.post('/:id/tarjetas', verificarToken,verificarRol(['cliente']), sanitizeTarjetaCliente, add)
tarjetaClienteRouter.put('/:id/tarjetas/:idTarjeta', verificarToken,verificarRol(['cliente']), sanitizeTarjetaCliente,update) 
tarjetaClienteRouter.delete('/:id/tarjetas/:idTarjeta', verificarToken,verificarRol(['cliente']), remove) 