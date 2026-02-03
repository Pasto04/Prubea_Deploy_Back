import { Request, Response, NextFunction } from 'express'
import { Resena } from './reseña.entity.js'
import { Pedido } from './pedido.entity.js'
import { orm } from '../shared/db/orm.js'
import { handleErrors } from '../shared/errors/errorHandler.js'
import { PedidoNotFoundError } from '../shared/errors/entityErrors/pedido.errors.js'
import { validarResena, validarResenaPatch } from './reseña.schema.js'
import { ResenaAlreadyExists, ResenaAPedidoNoFinalizado, ResenaNotFoundError, ResenaDePedidoAjeno } from '../shared/errors/entityErrors/reseña.errors.js'
import { validarFindAll } from '../shared/validarFindAll.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { UsuarioNotFoundError } from '../shared/errors/entityErrors/usuario.errors.js'


const em = orm.em

function sanitizeResena(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    pedido: req.params.nroPed,
    cuerpo: req.body.cuerpo,
    puntaje: req.body.puntaje
  }
  next()
}


async function findAll(req:Request, res:Response) {
  try{
    const resenas = validarFindAll(await em.find(Resena, {}, {populate: ['pedido']}), ResenaNotFoundError)
    res.status(200).json({message: `Todas las reseñas fueron encontradas`, data: resenas})
  } catch(error: any) {
    handleErrors(error, res)
  }
}

async function findOne(req:Request, res:Response) {
  try{
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed: nroPed }, {failHandler: () => {throw new PedidoNotFoundError}});
    const resena = await em.findOneOrFail(Resena, { pedido }, {failHandler: () => {throw new ResenaNotFoundError}})
    res.status(200).json({message: `La reseña del pedido ${nroPed} fue encontrado con éxito`, data: resena})
  } catch(error: any) {
    handleErrors(error, res)
  }
  
}

async function add(req:Request, res:Response) {
  try{
    const id = Number.parseInt(req.params.id)
    const usuario = await em.findOneOrFail(Usuario, {id}, {failHandler: () => {throw new UsuarioNotFoundError()}})

    const nroPed = Number.parseInt(req.params.nroPed)
    req.body.sanitizedInput.pedido = nroPed
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, {populate: ['cliente'], failHandler: () => {throw new PedidoNotFoundError}})


    if(pedido.estado !== 'finalizado') {
      throw new ResenaAPedidoNoFinalizado()
    }



    const resenaExistente = await em.findOne(Resena, { pedido })
    if(resenaExistente !== null) {
      throw new ResenaAlreadyExists()
    }


    if(pedido.cliente !== usuario) {
      throw new ResenaDePedidoAjeno()
    }



    const fecha = new Date()


    validarResena(req.body.sanitizedInput)

    req.body.sanitizedInput.pedido = pedido
    req.body.sanitizedInput.fechaHoraResena = fecha
    req.body.sanitizedInput.fechaHoraModificacion = fecha

    const resena = em.create(Resena, req.body.sanitizedInput)
    await em.flush(),
    res.status(201).json({data: resena})
  } catch(error: any){
    handleErrors(error, res)
  }
}

async function update(req:Request, res:Response) {
  try{
    const id = Number.parseInt(req.params.id)
    const usuario = await em.findOneOrFail(Usuario, {id}, {failHandler: () => {throw new UsuarioNotFoundError()}})

    const nroPed = Number.parseInt(req.params.nroPed)
    req.body.sanitizedInput.pedido = nroPed
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, {populate: ['cliente'], failHandler: () => {throw new PedidoNotFoundError}})
    
    const resena = await em.findOneOrFail(Resena, { pedido }, {populate: ['pedido.cliente'], failHandler: () => {throw new ResenaNotFoundError}})


    if(pedido.cliente !== usuario) {
      throw new ResenaDePedidoAjeno('No puedes modificar una reseña de un pedido que no realizaste')
    }



    req.body.sanitizedInput.fechaHoraModificacion = new Date()

    let resenaUpdated
    if(req.method === 'PATCH'){
      resenaUpdated = validarResenaPatch(req.body.sanitizedInput)
    } else {
      resenaUpdated = validarResena(req.body.sanitizedInput)
    }
    req.body.sanitizedInput.pedido = pedido
    em.assign(resena, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({message: `La reseña del pedido ${nroPed} fue actualizada con éxito`, data: resena})
  } catch(error: any){
    handleErrors(error, res)
  }
}

async function remove (req: Request, res: Response,) {
  try {
    const id = Number.parseInt(req.params.id)
    const usuario = await em.findOneOrFail(Usuario, {id}, {failHandler: () => {throw new UsuarioNotFoundError()}})

    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, {failHandler: () => {throw new PedidoNotFoundError}});
    const deletedResena = await em.findOneOrFail(Resena, { pedido }, {failHandler: () => {throw new ResenaNotFoundError}}) 



    if(pedido.cliente !== usuario) {
      throw new ResenaDePedidoAjeno('No puedes modificar una reseña de un pedido que no realizaste')
    }



    await em.removeAndFlush(deletedResena)
    res.status(200).json({message: `La reseña del pedido ${nroPed} ha sido eliminada con éxito`, data: deletedResena})
  } catch(error: any){
    handleErrors(error, res)
  }
}

export {sanitizeResena, findAll, findOne, add, update, remove }