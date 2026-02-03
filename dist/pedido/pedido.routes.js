import { Router } from "express";
import { findAll, findOne } from "./pedido.controller.js";
import { verificarToken } from '../shared/authMiddleware.js';
export const pedidoRouter = Router();
pedidoRouter.get('/', verificarToken, findAll);
pedidoRouter.get('/:nroPed', findOne);
//# sourceMappingURL=pedido.routes.js.map