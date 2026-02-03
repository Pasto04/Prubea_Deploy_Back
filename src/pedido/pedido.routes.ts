import { Router } from "express"
import { sanitizePedidoInput, findAll, findOne } from "./pedido.controller.js"
import { verificarToken } from '../shared/authMiddleware.js'

export const pedidoRouter = Router()

pedidoRouter.get('/', verificarToken, findAll)
pedidoRouter.get('/:nroPed', findOne) 
