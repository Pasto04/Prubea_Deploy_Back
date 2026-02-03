import { Request, Response, NextFunction } from "express"
import { orm } from "../shared/db/orm.js"
import { Usuario } from "../usuario/usuario.entity.js"
import { TarjetaCliente } from "./tarjetaCliente.entity.js"
import { validarTarjetaCliente } from "./tarjetaCliente.schema.js"
import { handleErrors } from "../shared/errors/errorHandler.js"
import { validarFindAll } from "../shared/validarFindAll.js"
import { TarjetaClienteNotFoundError, TarjetaClientePreconditionFailed, TarjetaClienteUniqueConstraintViolation } from 
"../shared/errors/entityErrors/tarjetaCliente.errors.js"
import { UsuarioIsNotAllowedError, UsuarioNotFoundError, UsuarioUnauthorizedError } from 
"../shared/errors/entityErrors/usuario.errors.js"
import { Tarjeta } from "./tarjeta.entity.js"
import { TarjetaNotFoundError } from "../shared/errors/entityErrors/tarjeta.errors.js"

const em = orm.em

function sanitizeTarjetaCliente(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    idTarjeta: req.body.idTarjeta,
    nroTarjeta: req.body.nroTarjeta,
    tipoTarjeta: req.body.tipoTarjeta,
    bancoTarjeta: req.body.bancoTarjeta,
    titular: req.body.titular,
    vencimiento: req.body.vencimiento,
    codSeguridad: req.body.codSeguridad,
    tarjeta: req.body.tarjeta,
    cliente: req.params.id
  }
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if(req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req:Request,res:Response) {
  try{
    const token = req.cookies.access_token

    const id = Number.parseInt(req.params.id)
    const cliente = await em.findOneOrFail(Usuario, {id}, {failHandler: () => {throw new UsuarioNotFoundError}})
    const tarjetasCliente = validarFindAll(await em.find(TarjetaCliente, {cliente}, {populate: ['tarjeta', 'cliente']}), TarjetaClienteNotFoundError)
    res.status (200).json({message: 'Todos las tarjetas encontradas', data: tarjetasCliente})
  } catch (error:any){
    handleErrors(error, res)
  }
}

async function findOne(req:Request,res:Response) {
  try{
    const token = req.cookies.access_token
    const idTarjeta = Number.parseInt(req.params.idTarjeta)
    const id = Number.parseInt(req.params.id)
    const cliente = await em.findOneOrFail(Usuario, {id}, {failHandler: () => {throw new UsuarioNotFoundError}})
    const tarjetaCliente = await em.findOneOrFail(TarjetaCliente, {idTarjeta, cliente}, {populate: ['tarjeta', 'cliente'], failHandler: () => {throw new TarjetaClienteNotFoundError}})
    res.status(200).json({message: 'Tarjeta encontrada', data: tarjetaCliente})
  } catch (error:any){
    handleErrors(error, res)
  }
}

async function add(req:Request,res:Response) {
  try{
    const token = req.cookies.accessToken
  if((await em.find(Tarjeta, {})).length === 0 || (await em.find(Usuario, {tipoUsuario: 'cliente'})).length === 0) {
      throw new TarjetaClientePreconditionFailed
    } 
    const id = Number.parseInt(req.params.id)
    const cliente = await em.findOneOrFail(Usuario, {id}, {failHandler: () => {throw new UsuarioNotFoundError}})
    if(cliente.tipoUsuario === 'empleado') {
      throw new UsuarioIsNotAllowedError
    }
    req.body.sanitizedInput.cliente = cliente
    req.body.sanitizedInput.tarjeta = await em.findOneOrFail(Tarjeta, {idTarjeta: Number.parseInt(req.body.tarjeta)}, {failHandler: () => {throw new TarjetaNotFoundError}})
    const tarjetaClienteValida = validarTarjetaCliente(req.body.sanitizedInput)
    const tarjetaCliente = em.create(TarjetaCliente, tarjetaClienteValida)
    await em.flush()
    res.status(201).json({message: 'Tarjeta agregada', data: tarjetaCliente})
  } catch (error:any){
    if(error.name === 'UniqueConstraintViolationException') {
      error = new TarjetaClienteUniqueConstraintViolation
    }
    handleErrors(error, res)
  }
}


async function update(req:Request,res:Response) {
  try{
    const idTarjeta = Number.parseInt(req.params.idTarjeta)
    const id = Number.parseInt(req.params.id)
    const cliente = await em.findOneOrFail(Usuario, {id})
    const tarjetaCliente = await em.findOneOrFail(TarjetaCliente, {idTarjeta, cliente}, {populate: ['tarjeta'], failHandler: () => {throw new TarjetaClienteNotFoundError}})
    req.body.sanitizedInput.tarjeta = tarjetaCliente.tarjeta
    req.body.sanitizedInput.cliente = cliente
    validarTarjetaCliente(req.body.sanitizedInput)
    em.assign(tarjetaCliente, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({message: 'La tarjeta ha sido actualizada exitosamente', data: tarjetaCliente})
  } catch (error:any){
    res.status(500).json({message:error.message})
  }
}

async function remove(req:Request, res:Response) {
  try {
    const token = req.cookies.access_token
    const idTarjeta = Number.parseInt(req.params.idTarjeta)
    const id = Number.parseInt(req.params.id)
    const cliente = await em.findOneOrFail(Usuario, {id}, {populate: [], failHandler: () => {throw new UsuarioNotFoundError}})
    const tarjetaCliente = await em.findOneOrFail(TarjetaCliente, {idTarjeta, cliente}, {failHandler: () => {throw new TarjetaClienteNotFoundError}})
    await em.removeAndFlush(tarjetaCliente)
    res.status(200).json({message: 'El plato ha sido eliminado con éxito', data: tarjetaCliente})
  } catch(error: any) {
    handleErrors(error, res)
  }
}

export{ findAll, findOne, add, sanitizeTarjetaCliente, update, remove }


