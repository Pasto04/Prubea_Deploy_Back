import { NextFunction, Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Bebida } from './bebida.entity.js'
import { Proveedor } from '../proveedor/proveedor.entity.js'
import { validarBebida, validarBebidaPatch } from './bebida.schema.js'
import { BebidaHasNoProveedor, BebidaNotFoundError, BebidaPreconditionFailed, BebidaUniqueConstraintViolation} from '../shared/errors/entityErrors/bebida.errors.js'
import { handleErrors } from '../shared/errors/errorHandler.js'
import { validarFindAll } from '../shared/validarFindAll.js'
import { BebidaDeProveedor } from './bebidaDeProveedor/bebidaDeProveedor.entity.js'
import { ProveedorNotFoundError } from '../shared/errors/entityErrors/proveedor.errors.js'

const em = orm.em

function sanitizeBebida(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    codBebida: req.body.codBebida,
    descripcion: req.body.descripcion,
    stock: req.body.stock,
    unidadMedida: req.body.unidadMedida,
    contenido: req.body.contenido,
    precio: req.body.precio,
    alcohol: req.body.alcohol,
    imagen: req.body.imagen,
  }
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
  try {
    const { descripcionParcial } = req.query
    let bebidas
    if (descripcionParcial) {
      bebidas = validarFindAll(await em.find(Bebida, {descripcion: { $like: `%${descripcionParcial}%` }}), BebidaNotFoundError)
    } else {
      bebidas = validarFindAll(await em.find(Bebida, {}), BebidaNotFoundError)
    }
    res.status(200).json({message: `Todas las bebidas han sido encontradas con éxito`, data: bebidas})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const codBebida = Number.parseInt(req.params.codBebida)
    const bebida = await em.findOneOrFail(Bebida, { codBebida }, { populate: ['bebidasDeProveedor'], failHandler: () => {throw new BebidaNotFoundError()} })
    res.status(200).json({message: `La bebida ${bebida.descripcion} ha sido encontrada con éxito`, data: bebida})
  } catch (error: any) {
    handleErrors(error, res)
  }
}
async function add(req: Request, res: Response) {
  try {
    if ((await em.find(Proveedor, {})).length === 0) {
      throw new BebidaPreconditionFailed()
    } else if (req.body.proveedor === undefined) {
      throw new BebidaHasNoProveedor()
    } else {
      const bebidaValida = validarBebida(req.body.sanitizedInput)
      const bebida = em.create(Bebida, bebidaValida)
      const id = Number.parseInt(req.body.proveedor)
      const proveedor = await em.findOneOrFail(Proveedor, { id }, {failHandler: () => {throw new ProveedorNotFoundError()} })
      const bebidaDeProveedor = em.create(BebidaDeProveedor, { bebida, proveedor })
      await em.flush()
      res.status(201).json({ data: {            
        codBebida: bebida.codBebida,
        descripcion: bebida.descripcion,
        unidadMedida: bebida.unidadMedida,
        contenido: bebida.contenido,
        precio: bebida.precio,
      }})
    }
  } catch (error: any) {
    if (error.name === 'UniqueConstraintViolationException') {
      error = new BebidaUniqueConstraintViolation();
    }
    handleErrors(error, res)
  }
}

async function update(req: Request, res: Response) {
  try {
    const codBebida = Number.parseInt(req.params.codBebida);
    const bebida = await em.findOneOrFail(Bebida, { codBebida }, { failHandler: () => {throw new BebidaNotFoundError()} })
    let bebidaUpdated
    if (req.method === 'PATCH') {
      bebidaUpdated = validarBebidaPatch(req.body.sanitizedInput)
    } else {
      bebidaUpdated = validarBebida(req.body.sanitizedInput)
    }
    console.log(bebida)
    em.assign(bebida, bebidaUpdated)
    console.log(bebida)
    await em.flush()
    res.status(200).json({message: `La bebida ${bebida.descripcion} fue actualizada con éxito`, data: bebida})
  } catch (error: any) {
    if (error.name === 'UniqueConstraintViolationException') {
      error = new BebidaUniqueConstraintViolation();
    }
    handleErrors(error, res);
  }
}

async function remove(req: Request, res: Response) {
  try {
    const codBebida = Number.parseInt(req.params.codBebida)
    const bebida = await em.findOneOrFail(Bebida, { codBebida })
    await em.removeAndFlush(bebida)
    res.status(200).json({message: `La bebida ${bebida.descripcion} ha sido eliminada con éxito`, data: bebida})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

export { findAll, findOne, add, update, remove, sanitizeBebida };
