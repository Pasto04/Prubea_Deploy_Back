import { Router } from 'express';
import { findAll, findOne, add, update, remove } from './tipoPlato.controller.js';
import { verificarToken } from '../shared/authMiddleware.js';
import { verificarRol } from '../shared/verificarRol.js';
export const tipoPlatoRouter = Router();
tipoPlatoRouter.get('/', findAll);
tipoPlatoRouter.get('/:numPlato', findOne);
tipoPlatoRouter.post('/', verificarToken, verificarRol(['empleado']), add);
tipoPlatoRouter.put('/:numPlato', verificarToken, verificarRol(['empleado']), update);
tipoPlatoRouter.patch('/:numPlato', verificarToken, verificarRol(['empleado']), update);
tipoPlatoRouter.delete('/:numPlato', verificarToken, verificarRol(['empleado']), remove);
//# sourceMappingURL=tipoPlato.routes.js.map