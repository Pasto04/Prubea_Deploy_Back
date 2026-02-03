import { Request, Response, NextFunction } from 'express'
import { Pedido } from './pedido.entity.js'
import { orm } from '../shared/db/orm.js'
import { Usuario } from '../usuario/usuario.entity.js'
import { handleErrors } from '../shared/errors/errorHandler.js'
import { PedidoAlreadyEndedError, PedidoAlreadyExistsError, PedidoAlreadyInUseError, PedidoNotFoundError, PedidoPreconditionFailed, 
  PedidoUniqueConstraintViolationError } from '../shared/errors/entityErrors/pedido.errors.js'
import { validarPedido, validarPedidoCancelar, validarPedidoFinalizar } from './pedido.schema.js'
import { Mesa } from '../mesa/mesa.entity.js'
import { UsuarioNotFoundError } from '../shared/errors/entityErrors/usuario.errors.js'
import { MesaAllBusyError, MesaNotFoundError} from '../shared/errors/entityErrors/mesa.errors.js'
import { validarFindAll } from '../shared/validarFindAll.js'
import { validarMesa } from '../mesa/mesa.schema.js'
import { Pago } from './pago/pago.entity.js'
import { PagoNotFoundError } from '../shared/errors/entityErrors/pago.errors.js'
import { PlatoPedido } from '../plato/platoPedido/platoPedido.entity.js'
import { PlatoPedidoNotFoundError } from '../shared/errors/entityErrors/platoPedido.errors.js'
import { BebidaPedido } from '../bebida/bebidaPedido/bebidaPedido.entity.js'
import { BebidaPedidoNotFoundError } from '../shared/errors/entityErrors/bebidaPedido.errors.js'

const em = orm.em;

async function sanitizePedidoCliente(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nroPed: req.body.nroPed,
    estado: req.body.estado,
    hora: req.body.hora,
    fecha: req.body.fecha,
    fechaCancelacion: req.body.fechaCancelacion,
    horaCancelacion: req.body.horaCancelacion,
    cliente: req.params.id,
    mesa: req.body.mesa,
    pago: req.body.pago,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

function sanitizeQuery(req: Request) {
  const queryResult: any = {
    fecha: req.query.fecha,
    fechaCancelacion: req.query.fechaCancelacion,
  }
  for (let key of Object.keys(queryResult)) {
    if (queryResult[key] === undefined) {
      delete queryResult[key]
    }
  }
  return queryResult
}

async function findAll(req: Request, res: Response) {
  try {
    const sanitizedQuery = sanitizeQuery(req)
    const id = Number.parseInt(req.params.id)
    const cliente = await em.findOneOrFail(Usuario, { id }, { failHandler: () => {throw new UsuarioNotFoundError()} })
    sanitizedQuery.cliente = cliente
    const pedidos = validarFindAll(await em.find(Pedido, sanitizedQuery), PedidoNotFoundError)
    res.status(200).json({message: `Todos los pedidos del cliente ${cliente.nombre} ${cliente.apellido} encontrados con éxito`, 
      data: pedidos})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { populate: ['platosPedido', 'bebidasPedido', 'cliente'], 
      failHandler: () => {throw new PedidoNotFoundError()} })
    res.status(200).json({message: `Pedido ${nroPed} del cliente ${pedido.cliente.nombre} ${pedido.cliente.apellido} encontrado`, data: pedido})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

function pedidoAlreadyExists(cliente: Usuario): void {
  cliente.pedidos.getItems().forEach((pedido) => {
    if (pedido.estado === 'en curso') {
      throw new PedidoAlreadyExistsError()
    }
  })
}

async function allMesasBusy() {
  const mesas = await em.find(Mesa, { estado: 'Disponible' })
  if (mesas.length === 0) {
    throw new MesaAllBusyError()
  }
}

async function add(req: Request, res: Response) {
  try {
    if ((await em.find(Usuario, { tipoUsuario: 'cliente' })).length === 0 || (await em.find(Mesa, {})).length === 0) {
      throw new PedidoPreconditionFailed()
    }
    const id = Number.parseInt(req.params.id)
    req.body.sanitizedInput.cliente = id
    const cliente = await em.findOneOrFail(Usuario, { id }, { populate: ['pedidos'], failHandler: () => {throw new UsuarioNotFoundError()}})
   
    pedidoAlreadyExists(cliente) 
    
    allMesasBusy()
    
    const mesa = await em.findOneOrFail(Mesa, { nroMesa: req.body.sanitizedInput.mesa }, { failHandler: () => {throw new MesaNotFoundError()} })
    
    req.body.sanitizedInput.mesa = Number.parseInt(req.body.sanitizedInput.mesa)
    validarPedido(req.body.sanitizedInput)
    req.body.sanitizedInput.cliente = cliente
    req.body.sanitizedInput.mesa = mesa

    const mesaUpdated = validarMesa(mesa)
    mesaUpdated.estado = 'Ocupada'
    em.assign(mesa, mesaUpdated)

    const pedido = em.create(Pedido, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ data: pedido })
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function fillSanitizedInput(pedido: Pedido, req: Request, pago: Pago) {
  req.body.sanitizedInput.estado = 'finalizado'
  req.body.sanitizedInput.fecha = pedido.fecha
  req.body.sanitizedInput.hora = pedido.hora
  req.body.sanitizedInput.cliente = pedido.cliente.id
  req.body.sanitizedInput.mesa = pedido.mesa.nroMesa
  req.body.sanitizedInput.pago = pago.pedido.nroPed
  req.body.sanitizedInput.platosPedido = pedido.platosPedido.getItems()
  req.body.sanitizedInput.bebidasPedido = pedido.bebidasPedido.getItems()
}

async function update(req: Request, res: Response) {
  try {
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedidoToUpdate = await em.findOneOrFail(Pedido, { nroPed }, { populate: ['platosPedido', 'bebidasPedido', 'cliente'], 
      failHandler: () => {throw new PedidoNotFoundError()} })
    if (pedidoToUpdate.estado === 'finalizado' || pedidoToUpdate.estado === 'cancelado') {
      throw new PedidoAlreadyEndedError()
    }
    const pago = await em.findOneOrFail(Pago, { pedido: pedidoToUpdate }, { failHandler: () => {throw new PagoNotFoundError()} })

    fillSanitizedInput(pedidoToUpdate, req, pago) 

    validarPedidoFinalizar(req.body.sanitizedInput)
    req.body.sanitizedInput.cliente = pedidoToUpdate.cliente
    req.body.sanitizedInput.mesa = pedidoToUpdate.mesa
    req.body.sanitizedInput.pago = pago
    let mesaDesocupada = req.body.sanitizedInput.mesa
    mesaDesocupada.estado = 'Disponible'
    em.assign(req.body.sanitizedInput.mesa, mesaDesocupada)

    em.assign(pedidoToUpdate, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({
      message: `Pedido ${nroPed} del cliente ${pedidoToUpdate.cliente.nombre} ${pedidoToUpdate.cliente.apellido} ha finalizado`,
      data: pedidoToUpdate})

  } catch (error: any) {
    if (error.name === 'UniqueConstraintViolationException') {
      error = new PedidoUniqueConstraintViolationError()
    }
    handleErrors(error, res)
  }
}


async function cancel(req: Request, res: Response) {
  try {
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedidoToUpdate = await em.findOneOrFail(Pedido, { nroPed }, { populate: ['platosPedido', 'bebidasPedido', 'cliente'],
        failHandler: () => {throw new PedidoNotFoundError()} })

    if (pedidoToUpdate.estado === 'finalizado' || pedidoToUpdate.estado === 'cancelado') {
      throw new PedidoAlreadyEndedError()
    } else if (pedidoToUpdate.platosPedido.length > 0 || pedidoToUpdate.bebidasPedido.length > 0) {
      pedidoToUpdate.platosPedido.getItems().forEach((platoPedido) => {
        if (platoPedido.entregado) {
          throw new PedidoAlreadyInUseError()
        }
      })
    }

    pedidoToUpdate.establecerFechaYHoraCancelacion()
    req.body.sanitizedInput.estado = 'cancelado'
    validarPedidoCancelar(req.body.sanitizedInput)
    let newMesa = pedidoToUpdate.mesa
    newMesa.estado = 'Disponible'
    em.assign(pedidoToUpdate.mesa, newMesa)

    em.assign(pedidoToUpdate, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({
      message: `Pedido ${nroPed} del cliente ${pedidoToUpdate.cliente.nombre} ${pedidoToUpdate.cliente.apellido} ha sido actualizado`,
      data: pedidoToUpdate,
    })
  } catch (error: any) {
    handleErrors(error, res)
  }
}


async function remove(req: Request, res: Response) {
  try {
    const nroPed = Number.parseInt(req.params.nroPed)
    const pedido = await em.findOneOrFail(Pedido, { nroPed }, { populate: ['platosPedido', 'bebidasPedido', 'cliente'],
        failHandler: () => {throw new PedidoNotFoundError()} })
    if (pedido.platosPedido.length > 0) {
      pedido.platosPedido.getItems().forEach((platoPedido) => {
        if (platoPedido.entregado) {
          throw new PedidoAlreadyInUseError()
        }
      })
    } else if (pedido.bebidasPedido.length > 0) {
      pedido.bebidasPedido.getItems().forEach((bebidaPedido) => {
        if (bebidaPedido.entregado) {
          throw new PedidoAlreadyInUseError()
        }
      })
    }
    await em.removeAndFlush(pedido)
    res.status(200).json({
      message: `El pedido ${nroPed} del cliente ${pedido.cliente.nombre} ${pedido.cliente.apellido} ha sido eliminado con éxito`,
      data: pedido,
    });
  } catch (error: any) {
    handleErrors(error, res)
  }
}

export { sanitizePedidoCliente, findAll, findOne, add, update, cancel, remove }
