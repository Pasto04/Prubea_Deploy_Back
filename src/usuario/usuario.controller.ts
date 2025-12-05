import { Request,Response,NextFunction } from "express"
import { publicUser, Usuario } from "./usuario.entity.js"
import { orm } from "../shared/db/orm.js"
import { validarUsuario, validarUsuarioLogIn, validarUsuarioPatch } from "./usuarios.schema.js"
import { validarFindAll } from "../shared/validarFindAll.js"
import { ClienteAlreadyHasPedido, UsuarioBadRequestError, UsuarioIsNotAllowedError, UsuarioNotFoundError, UsuarioUnauthorizedError, UsuarioUniqueConstraintViolation } from "../shared/errors/entityErrors/usuario.errors.js"
import { handleErrors } from "../shared/errors/errorHandler.js"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import { SECRET_JWT_KEY } from "../shared/config.js"

/*
HABILITAR LUEGO LOS PERMISOS DE USUARIO
*/

const em = orm.em

function sanitizeUsuario(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    email: req.body.email,
    contrasenia: req.body.contrasenia,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    telefono: req.body.telefono,
    tipoUsuario: req.body.tipoUsuario
  }
  Object.keys(req.body.sanitizedInput).forEach((keys) => {
    if(req.body.sanitizedInput[keys] === undefined) {
      delete req.body.sanitizedInput[keys]
    }
  })
  next()
}

function sanitizeLogIn(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedLogIn = {
    email: req.body.email,
    contrasenia: req.body.contrasenia
  }
  next()
}

async function findAllByTipoUsuario(req:Request, res:Response) {
  try{
    const token = req.cookies.accessToken
    /*if(!token) {
      throw new UsuarioUnauthorizedError
    }*/
    const { tipoUsuario } = req.query
    if(tipoUsuario){
      const tipoUsuario = (req.query.tipoUsuario as string).toLowerCase()
      const usuarios = validarFindAll(await em.find(Usuario, {tipoUsuario}), UsuarioNotFoundError)
      res.status(200).json({message: `Todos los ${tipoUsuario}s encontrados`, data: usuarios})
    } 
  } catch (error:any){
    handleErrors(error, res)
  }
}

async function findOne(req:Request,res:Response) {
  try{
    const token = req.cookies.accessToken
    /*if(!token) {
      throw new UsuarioUnauthorizedError
    }*/
    const id = Number.parseInt(req.params.id)
    const usuario = await em.findOneOrFail(Usuario, {id},)
    res.status(200).json({message: 'Usuario encontrado', data: usuario})
  } catch (error:any){
    handleErrors(error, res)
  }
}

async function addUsuario(req: Request, res: Response){
  try {
    const usuarioValido = validarUsuario(req.body.sanitizedInput)

    usuarioValido.contrasenia = await bcrypt.hash(req.body.sanitizedInput.contrasenia, 10)

    const usuario = em.create(Usuario, usuarioValido)
    await em.flush()
    res.status(201).json({message: 'Usuario creado con éxito', data: usuario})
  } catch (error: any){
    if(error.name === 'UniqueConstraintViolationException') {
      error = new UsuarioUniqueConstraintViolation
    }
    handleErrors(error, res)
  }
}

//Recibo mail y contraseña del usuario, lo busco por su mail. Si lo encuentro, valido la contraseña. Si es válida, 
async function logInUsuario(req: Request, res: Response) {
  try { 
    const emailYContraseniaValidos = validarUsuarioLogIn(req.body.sanitizedLogIn)
    const usuario = await em.findOneOrFail(Usuario, {email: emailYContraseniaValidos.email}, {failHandler: () => {throw new UsuarioNotFoundError('El mail ingresado no se encuentra registrado')}})
    
    const esUsuarioValido = await bcrypt.compare( emailYContraseniaValidos.contrasenia, usuario.contrasenia )
    
    if(!esUsuarioValido) {
      throw new UsuarioBadRequestError('La contraseña ingresada es incorrecta')
    }
    
    const usuarioPublico = usuario.asPublicUser()
    const token = jwt.sign({id: usuarioPublico.id, email: usuarioPublico.email}, SECRET_JWT_KEY, {
      expiresIn: '3h'
    })

    // --- LÓGICA DE PRODUCCIÓN VS DESARROLLO ---
    // Detectamos si estamos en Producción (Render setea NODE_ENV a 'production' por defecto)
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', token, {
      httpOnly: true, // Siempre true por seguridad (JS no puede leerla)
      
      // En Prod (Render) debe ser true porque usas HTTPS. 
      // En Local (localhost) debe ser false porque usas HTTP.
      secure: isProduction, 

      // En Prod (Netlify -> Render) son dominios distintos, NECESITAS 'none'.
      // En Local (localhost -> localhost) 'lax' funciona mejor y da menos problemas.
      sameSite: isProduction ? 'none' : 'lax',
      
      // OJO: Tenías "3000 * ..." que son 3 segundos. Corregido a 1 hora x 3
      maxAge: 1000 * 60 * 60 * 3 
    })
    .status(200).json({message: 'Sesión iniciada con éxito', data: usuarioPublico})
    
  } catch(error: any) {
    handleErrors(error, res)
  }
}

// ... resto del archivo ...

function logOutUsuario(req: Request, res: Response) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  })
  .status(200).json({message: 'Sesión cerrada con éxito'})
}

async function updateUsuario (req:Request,res:Response){
  try {
    const token = req.cookies.accessToken
    /*if(!token) {
      throw new UsuarioUnauthorizedError
    }*/
    const id = Number.parseInt(req.params.id)
    const usuarioToUpdate = await em.findOneOrFail(Usuario, {id})
    let usuarioUpdated
    if(req.method === 'PATCH'){
      usuarioUpdated = validarUsuarioPatch(req.body)
    } else {
      usuarioUpdated = validarUsuario(req.body)
    }
    em.assign(usuarioToUpdate, usuarioUpdated)
    await em.flush()
    res.status(200).json({message: 'Usuario actualizado', data: usuarioToUpdate})
  } catch (error:any){
    if(error.name === 'UniqueConstraintViolationException') {
      error = new UsuarioUniqueConstraintViolation
    }
    handleErrors(error, res)
  }
}

async function remove (req:Request,res:Response) {
  try {
    const token = req.cookies.accessToken
    /*if(!token) {
      throw new UsuarioUnauthorizedError
    }*/
    const id = Number.parseInt(req.params.id)
    const cliente = await em.findOneOrFail(Usuario, {id})
    await em.removeAndFlush(cliente)
    res.status(200).json({message: 'El cliente ha sido eliminado con éxito', data: cliente})
  } catch(error: any) {
    if(error.name === 'UniqueConstraintViolationException') {
      error = new ClienteAlreadyHasPedido
    }
    handleErrors(error, res)
  }
}

export {findAllByTipoUsuario, findOne, addUsuario, sanitizeUsuario, logInUsuario, sanitizeLogIn, logOutUsuario, updateUsuario, remove}