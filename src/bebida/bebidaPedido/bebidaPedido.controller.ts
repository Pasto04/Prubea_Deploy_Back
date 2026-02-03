import { Request, Response, NextFunction } from 'express'
import { orm } from '../../shared/db/orm.js'
import { Pedido } from '../../pedido/pedido.entity.js'
import { BebidaPedido } from './bebidaPedido.entity.js'
import { Bebida } from '../bebida.entity.js'
import { validarBebidaPedido, validarBebidaPedidoToPatch} from './bebidaPedido.schema.js'
import { handleErrors } from '../../shared/errors/errorHandler.js'
import {PedidoAlreadyEndedError, PedidoNotFoundError} from '../../shared/errors/entityErrors/pedido.errors.js'
import { BebidaNotFoundError } from '../../shared/errors/entityErrors/bebida.errors.js'
import { BebidaPedidoAlreadyDeliveredError, BebidaPedidoNotEnoughStockError, BebidaPedidoNotFoundError} from '../../shared/errors/entityErrors/bebidaPedido.errors.js'
import { validarFindAll } from '../../shared/validarFindAll.js'

const em = orm.em

function sanitizeBebidaPedido(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    bebida: Number.parseInt(req.body.bebida),
    pedido: Number.parseInt(req.params.nroPed),
    cantidad: req.body.cantidad,
    entregado: false,
    fechaSolicitud: req.params.fecha,
    horaSolicitud: req.params.hora,
  }
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { failHandler: () => { throw new PedidoNotFoundError() } })
    const bebidasPedido = validarFindAll(await em.find(BebidaPedido, { pedido }, { populate: ['bebida', 'pedido'] }), BebidaPedidoNotFoundError)
    res.status(200).json({message: `Bebidas del pedido ${pedido.nroPed} encontradas con éxito`, data: bebidasPedido})

  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { failHandler: () => {throw new PedidoNotFoundError()} })
    const codBebida = Number.parseInt(req.params.codBebida)
    const bebida = await em.findOneOrFail(Bebida, { codBebida }, { failHandler: () => { throw new BebidaNotFoundError() } })
    const fechaEntrega = req.params.fecha
    const horaEntrega = req.params.hora
    const bebidaPedido = await em.findOneOrFail(BebidaPedido, { pedido, bebida, fechaEntrega, horaEntrega }, { failHandler: () => { throw new BebidaPedidoNotFoundError() } })
    res.status(200).json({message: `Bebida ${bebida.descripcion} del pedido ${pedido.nroPed} encontrada con éxito`, data: bebidaPedido})

  } catch (error: any) {
    handleErrors(error, res)
  }
}

function isAlreadyDelivered(bebidaPedido: BebidaPedido): void {
  if (bebidaPedido.entregado === true) {
    throw new BebidaPedidoAlreadyDeliveredError()
  }
}

function alreadyEnded(pedido: Pedido): void {
  if (pedido.estado !== 'en curso') {
    throw new PedidoAlreadyEndedError()
  }
}

type BebidaPedidoToValidate = {
  bebida: Bebida
  pedido: Pedido
  cantidad: number
}

function enoughBebidas(bebida: Bebida, cantidad: number) {
  if (bebida.stock < cantidad) {
    throw new BebidaPedidoNotEnoughStockError()
  }
}

async function adjustBebidas(bebidaPedido: BebidaPedidoToValidate) {
  const bebida = await em.findOneOrFail(Bebida, {
    codBebida: bebidaPedido.bebida.codBebida,
  })
  const cantidad = bebidaPedido.cantidad
  bebida.stock -= cantidad
  await em.persistAndFlush(bebida)
}

async function add(req: Request, res: Response) {
  try {
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { failHandler: () => {throw new PedidoNotFoundError()} })
    const codBebida = req.body.sanitizedInput.bebida
    const bebida = await em.findOneOrFail(Bebida, { codBebida }, { failHandler: () => {throw new BebidaNotFoundError()} })
    alreadyEnded(pedido) 
    validarBebidaPedido(req.body.sanitizedInput)

    req.body.sanitizedInput.pedido = pedido
    req.body.sanitizedInput.bebida = bebida

    enoughBebidas(req.body.sanitizedInput.bebida, req.body.sanitizedInput.cantidad) // Validamos que haya stock de la bebida

    adjustBebidas(req.body.sanitizedInput) 

    const bebidaPedido = em.create(BebidaPedido, req.body.sanitizedInput)
    em.persist(bebidaPedido)
    await em.flush()
    res.status(201).json({message: `La bebida ${bebidaPedido.bebida.descripcion} ha sido agregada al pedido 
      ${bebidaPedido.pedido.nroPed} con éxito`, data: bebidaPedido})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function update(req: Request, res: Response) {
  try {
    const nroPed = Number.parseInt(req.params.nroPed);
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { failHandler: () => {throw new PedidoNotFoundError()} })
    const codBebida = Number.parseInt(req.params.codBebida)
    const bebida = await em.findOneOrFail(Bebida, { codBebida }, { failHandler: () => {throw new BebidaNotFoundError()} })
    req.body.sanitizedInput.bebida = codBebida
    validarBebidaPedidoToPatch(req.body.sanitizedInput)
    req.body.sanitizedInput.pedido = pedido
    req.body.sanitizedInput.bebida = bebida
    const fechaSolicitud = req.body.sanitizedInput.fechaSolicitud
    const horaSolicitud = req.body.sanitizedInput.horaSolicitud
    const bebidaPedido = await em.findOneOrFail(BebidaPedido, { pedido, bebida, fechaSolicitud, horaSolicitud }, { failHandler: () => {throw new BebidaPedidoNotFoundError()} })
    isAlreadyDelivered(bebidaPedido) //Validamos que la bebida no haya sido entregada
    req.body.sanitizedInput.entregado = true
    req.body.sanitizedInput.cantidad = bebidaPedido.cantidad
    bebidaPedido.establecerFechaYHoraEntrega()
    em.assign(bebidaPedido, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({message: `La bebida ${bebidaPedido.bebida.descripcion} del pedido ${bebidaPedido.pedido.nroPed} 
      ha sido entregada con éxito`, data: bebidaPedido})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function returnBebidas(bebidaPedido: BebidaPedidoToValidate) {
  const bebida = await em.findOneOrFail(Bebida, {codBebida: bebidaPedido.bebida.codBebida})  
  const cantidad = bebidaPedido.cantidad
  bebida.stock += cantidad
  await em.persistAndFlush(bebida)
}

async function remove(req: Request, res: Response) {
  try {
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, {populate: ['cliente', 'mesa'], failHandler: () => {throw new PedidoNotFoundError()} })
    const codBebida = Number.parseInt(req.params.codBebida)
    const bebida = await em.findOneOrFail(Bebida, { codBebida }, { failHandler: () => {throw new BebidaNotFoundError()} })
    const fechaSolicitud = req.params.fecha
    const horaSolicitud = req.params.hora
    const bebidaPedido = await em.findOneOrFail(BebidaPedido, { pedido, bebida, fechaSolicitud, horaSolicitud }, 
      { failHandler: () => {throw new BebidaPedidoNotFoundError()} })
    isAlreadyDelivered(bebidaPedido) 
    returnBebidas(bebidaPedido) 
    await em.removeAndFlush(bebidaPedido)
    res.status(200).json({message: `La bebida ${bebida.descripcion} del pedido ${pedido.nroPed} ha sido eliminada con éxito`,
      data: bebidaPedido})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

export { sanitizeBebidaPedido, findAll, findOne, add, update, remove };
