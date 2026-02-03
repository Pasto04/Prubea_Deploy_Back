import { NextFunction, Request, Response } from 'express'
import { orm } from '../../shared/db/orm.js'
import { Pedido } from '../../pedido/pedido.entity.js'
import { PlatoPedido } from './platoPedido.entity.js'
import { Plato } from '../plato.entity.js'
import { validarPlatoPedido, validarPlatoPedidoToPatch} from './platoPedido.schema.js'
import { PedidoAlreadyEndedError, PedidoNotFoundError} from '../../shared/errors/entityErrors/pedido.errors.js'
import { PlatoNotFoundError } from '../../shared/errors/entityErrors/plato.errors.js'
import { PlatoPedidoAlreadyDeliveredError, PlatoPedidoNotEnoughIngredientsError, PlatoPedidoNotFoundError} from 
'../../shared/errors/entityErrors/platoPedido.errors.js'
import { handleErrors } from '../../shared/errors/errorHandler.js'
import { validarFindAll } from '../../shared/validarFindAll.js'
import { Ingrediente } from '../../ingrediente/ingrediente.entity.js'
import { IngredienteNotFoundError } from '../../shared/errors/entityErrors/ingrediente.errors.js'
import { validarIngrediente } from '../../ingrediente/ingrediente.schema.js'
import { ElaboracionPlato } from '../elaboracionPlato/elaboracionPlato.entity.js'
import { ElaboracionPlatoNotFoundError } from '../../shared/errors/entityErrors/elaboracionPlato.errors.js'

const em = orm.em

function sanitizePlatoPedido(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    pedido: Number.parseInt(req.params.nroPed),
    plato: Number.parseInt(req.body.plato),
    cantidad: req.body.cantidad,
    fechaSolicitud: req.params.fecha,
    horaSolicitud: req.params.hora,
    entregado: false,
  }
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if(req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try{
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { failHandler: () => {throw new PedidoNotFoundError()} })
    const platoPedido = await em.find(PlatoPedido, { pedido }, { populate: ['pedido', 'plato'] })
    res.status(200).json({message: `Platos del pedido ${pedido.nroPed} encontrados con éxito`, data: platoPedido})

  } catch(error: any){
    handleErrors(error, res)
  }
}

async function findOne(req: Request, res: Response){
  try{
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { failHandler: () => {throw new PedidoNotFoundError()} })
    const numPlato = Number.parseInt(req.params.nro)
    const plato = await em.findOneOrFail(Plato, { numPlato }, { failHandler: () => {throw new PlatoNotFoundError()} })
    const fechaEntrega = req.params.fecha
    const horaEntrega = req.params.hora
    const platoPedido = await em.findOneOrFail(PlatoPedido, { pedido, plato, fechaEntrega, horaEntrega }, { populate: ['pedido', 'plato'], failHandler: () => {throw new PlatoPedidoNotFoundError()} })
    res.status(200).json({message: `El plato ${plato.descripcion} del pedido ${pedido.nroPed} ha sido encontrado con éxito`, data: platoPedido})

  } catch(error: any){
    handleErrors(error, res)
  }
}

function isAlreadyDelivered(platoPedido: PlatoPedido): void {
  if (platoPedido.entregado === true) {
    throw new PlatoPedidoAlreadyDeliveredError()
  }
}

function alreadyEnded(pedido: Pedido): void {
  if (pedido.estado !== 'en curso') {
    throw new PedidoAlreadyEndedError()
  }
}

async function enoughIngredientes(plato: Plato, cantidad: number) {
  plato.elaboracionesPlato.getItems().forEach((elaboracion) => {
    if (elaboracion.ingrediente.stock < elaboracion.cantidadNecesaria * cantidad) {
      throw new PlatoPedidoNotEnoughIngredientsError()
    }
  });
}

async function adjustIngredientes(plato: Plato, cantidad: number) {
  plato.elaboracionesPlato.getItems().forEach(async (elaboracion) => {
    const codigo = elaboracion.ingrediente.codigo;
    const ingre = await em.findOneOrFail(Ingrediente, { codigo }, { failHandler: () => {throw new IngredienteNotFoundError()} })
    ingre.stock -= elaboracion.cantidadNecesaria * cantidad;
    await em.persistAndFlush(ingre)
  });
}

async function add(req: Request, res: Response) {
  try {
    const nroPed = Number.parseInt(req.params.nroPed);
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { failHandler: () => {throw new PedidoNotFoundError()} });
    const numPlato = req.body.sanitizedInput.plato;
    const plato = await em.findOneOrFail(Plato, { numPlato }, { populate: ['elaboracionesPlato.ingrediente'], failHandler: () => {throw new PlatoNotFoundError()} })
    alreadyEnded(pedido); 
    validarPlatoPedido(req.body.sanitizedInput)

    req.body.sanitizedInput.pedido = pedido
    req.body.sanitizedInput.plato = plato

    enoughIngredientes(req.body.sanitizedInput.plato, req.body.sanitizedInput.cantidad) 
    adjustIngredientes(req.body.sanitizedInput.plato, req.body.sanitizedInput.cantidad) 
    const platoPedido = em.create(PlatoPedido, req.body.sanitizedInput)
    em.persist(platoPedido)
    await em.flush()
    res.status(201).json({message: `El plato [${platoPedido.plato.descripcion}] ha sido agregado al pedido [${platoPedido.pedido.nroPed}] con éxito`, data: platoPedido})
  
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function update(req: Request, res: Response) {
  try {
    const numPlato = Number.parseInt(req.params.nro)
    const plato = await em.findOneOrFail(Plato, { numPlato }, { failHandler: () => {throw new PlatoNotFoundError()} })
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { populate: ['cliente'], failHandler: () => { throw new PedidoNotFoundError() } })
    req.body.sanitizedInput.plato = numPlato
    validarPlatoPedidoToPatch(req.body.sanitizedInput)
    req.body.sanitizedInput.plato = plato
    req.body.sanitizedInput.pedido = pedido
    const fechaSolicitud = req.body.sanitizedInput.fechaSolicitud
    const horaSolicitud = req.body.sanitizedInput.horaSolicitud
    const platoPed = await em.findOneOrFail(PlatoPedido, { plato, pedido, fechaSolicitud, horaSolicitud }, { failHandler: () => { throw new PlatoPedidoNotFoundError() } })
    isAlreadyDelivered(platoPed) 
    platoPed.establecerFechaYHoraEntrega()
    req.body.sanitizedInput.entregado = true
    req.body.sanitizedInput.cantidad = platoPed.cantidad
    em.assign(platoPed, req.body.sanitizedInput)
    await em.flush();
    res.status(200).json({message: `El plato [${platoPed.plato.descripcion}] ha sido entregado con éxito`, data: platoPed})

  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function returnIngredientes(plato: Plato, cantidad: number) {
  plato.elaboracionesPlato.getItems().forEach(async (elaboracion) => {
    const codigo = elaboracion.ingrediente.codigo
    const ingre = await em.findOneOrFail(Ingrediente, { codigo }, { failHandler: () => { throw new IngredienteNotFoundError() } })
    ingre.stock += elaboracion.cantidadNecesaria * cantidad;
    await em.persistAndFlush(ingre)
  });
}

async function remove(req: Request, res: Response) {
  try {
    const numPlato = Number.parseInt(req.params.nro)
    const nroPed = Number.parseInt(req.params.nroPed)
    const plato = await em.findOneOrFail(Plato, { numPlato }, { failHandler: () => { throw new PlatoNotFoundError() } })
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { failHandler: () => { throw new PedidoNotFoundError() } })
    const fechaSolicitud = req.params.fecha
    const horaSolicitud = req.params.hora
    const platoPed = await em.findOneOrFail(PlatoPedido, { plato, pedido, fechaSolicitud, horaSolicitud }, 
      { populate: ['plato.elaboracionesPlato.ingrediente'], failHandler: () => { throw new PlatoPedidoNotFoundError() } })

    isAlreadyDelivered(platoPed) 
    returnIngredientes(platoPed.plato, platoPed.cantidad) 
    await em.removeAndFlush(platoPed)
    res.status(200).json({message: `El plato [${platoPed.plato.descripcion}] ha sido eliminado del pedido`, data: platoPed})

  } catch (error: any) {
    handleErrors(error, res)
  }
}

export { findAll, findOne, add, update, remove, sanitizePlatoPedido };
