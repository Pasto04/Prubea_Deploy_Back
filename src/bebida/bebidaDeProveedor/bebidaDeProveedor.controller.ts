import { NextFunction, Request, Response } from "express"
import { orm } from "../../shared/db/orm.js"
import { Bebida } from "../bebida.entity.js"
import { BebidaDeProveedor } from "./bebidaDeProveedor.entity.js"
import { Proveedor } from "../../proveedor/proveedor.entity.js"
import { validarBebidaDeProveedor } from "./bebidaDeProveedor.schema.js"
import { handleErrors } from "../../shared/errors/errorHandler.js"
import { BebidaNotFoundError } from "../../shared/errors/entityErrors/bebida.errors.js"
import { ProveedorNotFoundError } from "../../shared/errors/entityErrors/proveedor.errors.js"

const em = orm.em

function sanitizeBebidaDeProveedor(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    bebida: req.params.codBebida,
    proveedor: req.body.proveedor
  }
  next()
}

async function findOne(req: Request, res: Response) {
  try {
    const codBebida = Number.parseInt(req.params.codBebida)
    const id = Number.parseInt(req.params.id)
    const bebida = await em.findOneOrFail(Bebida, {codBebida})
    const proveedor = await em.findOneOrFail(Proveedor, {id})
    const bebidaDeProv = await em.findOneOrFail(BebidaDeProveedor, {bebida, proveedor}, {populate: ['bebida', 'proveedor']})
    res.status(200).json({message: `El proveedor de cuit "${proveedor.cuit}" de la bebida "${bebida.descripcion}" ha sido encontrado con éxito`, data: bebidaDeProv})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function add(req: Request, res: Response) {
  try {
    const codBebida = Number.parseInt(req.body.sanitizedInput.bebida)
    const bebida = await em.findOneOrFail(Bebida, {codBebida}, {failHandler: () => {throw new BebidaNotFoundError}})
    req.body.sanitizedInput.bebida = bebida
    const id = Number.parseInt(req.body.sanitizedInput.proveedor)
    req.body.sanitizedInput.proveedor = await em.findOneOrFail(Proveedor, {id}, {failHandler: () => {throw new ProveedorNotFoundError}})
    const bebidaDeProvValida = validarBebidaDeProveedor(req.body.sanitizedInput)
    const bebidaDeProv = em.create(BebidaDeProveedor, bebidaDeProvValida)
    await em.flush()
    res.status(201).json({data: bebidaDeProv})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function remove(req: Request, res: Response) {
  try {
    const codBebida = Number.parseInt(req.params.codBebida)
    const id = Number.parseInt(req.params.id)
    const bebida = await em.findOneOrFail(Bebida, {codBebida})
    const proveedor = await em.findOneOrFail(Proveedor, {id})
    const bebidaDeProv = await em.findOneOrFail(BebidaDeProveedor, {bebida, proveedor})
    await em.removeAndFlush(bebidaDeProv)
    res.status(200).json({message: `El proveedor de cuit "${proveedor.cuit}" de la bebida "${bebida.descripcion}" ha sido eliminado con éxito`, data: bebidaDeProv})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

export { findOne, add, sanitizeBebidaDeProveedor, /*update,*/ remove }