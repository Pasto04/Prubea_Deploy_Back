import { Request, Response, NextFunction } from 'express';

export const verificarRol = (rolesPermitidos: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    const usuario = req.usuario; 
    
    if (!usuario || !rolesPermitidos.includes(usuario.tipoUsuario)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes los permisos necesarios para realizar esta acción.',
      });
    }
    
    next();
  };
};