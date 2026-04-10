import { Router } from "express"
import { findAllByTipoUsuario, findOne, updateUsuario, remove, addUsuario, sanitizeUsuario, sanitizeLogIn, logInUsuario, logOutUsuario } 
from "./usuario.controller.js"
import { verificarToken } from "../shared/authMiddleware.js"

export const usuarioRouter = Router()

usuarioRouter.get('/', verificarToken, findAllByTipoUsuario)
usuarioRouter.get('/:id', verificarToken, findOne) 
usuarioRouter.post('/registro', sanitizeUsuario, addUsuario)
usuarioRouter.post('/login', sanitizeLogIn, logInUsuario)
usuarioRouter.post('/logout', logOutUsuario)
usuarioRouter.put('/:id', verificarToken, updateUsuario) 
usuarioRouter.patch('/:id', verificarToken, updateUsuario)
usuarioRouter.delete('/:id', verificarToken, remove) 