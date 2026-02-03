import { Request, Response } from 'express'
import { Tarjeta } from './tarjeta.entity.js'
import { orm } from '../shared/db/orm.js'
import { validarTarjeta } from './tarjeta.schema.js'
import { TarjetaAlreadyInUseError, TarjetaNotFoundError, TarjetaUniqueConstraintViolation } from 
'../shared/errors/entityErrors/tarjeta.errors.js'
import { validarFindAll } from '../shared/validarFindAll.js'
import { handleErrors } from '../shared/errors/errorHandler.js'

const em = orm.em

em.getRepository(Tarjeta)

async function findAll(req: Request, res: Response) {
  try {
    const tarjetas = validarFindAll(await em.find(Tarjeta, {}), TarjetaNotFoundError)
    res.status(200).json({ message: 'Todas las tarjetas fueron encontradas', data: tarjetas })
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const idTarjeta = Number.parseInt(req.params.idTarjeta)
    const tarjeta = await em.findOneOrFail(Tarjeta, { idTarjeta }, {failHandler: () => {throw new TarjetaNotFoundError()}})
    res.status(200).json({ message: 'La tarjeta fue encontrada con éxito', data: tarjeta })
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function add(req: Request, res: Response) {
  try {
    const tarjetaValida = validarTarjeta(req.body)
    const tarjeta = em.create(Tarjeta, tarjetaValida)
    await em.flush();
    res.status(201).json({ message: 'La tarjeta fue creada con éxito', data: tarjeta })
  } catch (error: any) {
    if(error.name === 'UniqueConstraintViolationException') {
      error = new TarjetaUniqueConstraintViolation
    }
    handleErrors(error, res)
  }
}

async function update(req: Request, res: Response) {
  try {
    const tarjetaValida = validarTarjeta(req.body)
    const idTarjeta = Number.parseInt(req.params.idTarjeta)
    const tarjeta = await em.findOneOrFail(Tarjeta, { idTarjeta }, {failHandler: () => {throw new TarjetaNotFoundError()}})
    em.assign(tarjeta, tarjetaValida)
    await em.flush()
    res.status(200).json({ message: 'La tarjeta fue actualizada con éxito', data: tarjeta })
  } catch (error: any) {
    if(error.name === 'UniqueConstraintViolationException') {
      error = new TarjetaUniqueConstraintViolation
    }
    handleErrors(error, res)
  }
}

async function remove(req: Request, res: Response) {
  try {
    const idTarjeta = Number.parseInt(req.params.idTarjeta)
    const tarjeta = await em.findOneOrFail(Tarjeta, { idTarjeta }, {populate: ['tarjetaClientes'], failHandler: () => {throw new TarjetaNotFoundError()}})
    if(tarjeta.tarjetaClientes.length > 0) {
      throw new TarjetaAlreadyInUseError
    }

    await em.removeAndFlush(tarjeta);
    res.status(200).json({ message: 'La tarjeta ha sido eliminada con éxito', data: tarjeta })
  } catch (error: any) {
    handleErrors(error, res)
  }
}

export { findAll, findOne, add, update, remove }
