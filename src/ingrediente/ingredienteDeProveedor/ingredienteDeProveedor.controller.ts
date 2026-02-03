import { Request, Response, NextFunction } from "express"
import { orm } from "../../shared/db/orm.js"
import { Ingrediente } from "../ingrediente.entity.js"
import { IngredienteDeProveedor } from "./ingredienteDeProveedor.entity.js"
import { Proveedor } from "../../proveedor/proveedor.entity.js"
import { handleErrors } from "../../shared/errors/errorHandler.js"
import { validarIngredienteDeProveedor } from "./ingredienteDeProveedor.schema.js"
import { IngredienteNotFoundError } from "../../shared/errors/entityErrors/ingrediente.errors.js"
import { ProveedorNotFoundError } from "../../shared/errors/entityErrors/proveedor.errors.js"
import { IngredienteDeProveedorNotFoundError } from "../../shared/errors/entityErrors/ingredienteDeProveedor.errors.js"

const em = orm.em

function sanitizeIngredienteDeProveedor(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    ingrediente: req.params.cod,
    proveedor: req.body.proveedor
  }
  next()
}

async function findOne(req: Request, res: Response) {
  try {
    const codigo = Number.parseInt(req.params.cod)
    const id = Number.parseInt(req.params.id)
    const ingrediente = await em.findOneOrFail(Ingrediente, {codigo}, {failHandler: () => {throw new IngredienteNotFoundError}})
    const proveedor = await em.findOneOrFail(Proveedor, {id}, {failHandler: () => {throw new ProveedorNotFoundError}})
    const ingreDeProv = await em.findOneOrFail(IngredienteDeProveedor, {ingrediente, proveedor}, {populate: ['ingrediente', 'proveedor'], failHandler: () => {throw new IngredienteDeProveedorNotFoundError}})
    res.status(200).json({message: `El proveedor de cuit "${proveedor.cuit}" del ingrediente "${ingrediente.descIngre}" ha sido encontrado con éxito`, data: ingreDeProv})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

async function add(req: Request, res: Response) {
  try {
    const codigo = Number.parseInt(req.params.cod)
    const ingrediente = await em.findOneOrFail(Ingrediente, {codigo}, {failHandler: () => {throw new IngredienteNotFoundError}})
    req.body.sanitizedInput.ingrediente = ingrediente
    const id = Number.parseInt(req.body.sanitizedInput.proveedor)
    req.body.sanitizedInput.proveedor = await em.findOneOrFail(Proveedor, {id}, {failHandler: () => {throw new ProveedorNotFoundError}})
    const ingreDeProvValido = validarIngredienteDeProveedor(req.body.sanitizedInput)
    const ingreDeProv = em.create(IngredienteDeProveedor, ingreDeProvValido)
    await em.flush()
    res.status(201).json({data: ingreDeProv})
  } catch (error: any) {
    handleErrors(error, res)
  }
}


async function remove(req: Request, res: Response) {
  try {
    const codigo = Number.parseInt(req.params.cod)
    const id = Number.parseInt(req.params.id)
    const ingrediente = await em.findOneOrFail(Ingrediente, {codigo}, {failHandler: () => {throw new IngredienteNotFoundError}})
    const proveedor = await em.findOneOrFail(Proveedor, {id}, {failHandler: () => {throw new ProveedorNotFoundError}})
    const ingreDeProv = await em.findOneOrFail(IngredienteDeProveedor, {ingrediente, proveedor}, {failHandler: () => {throw new IngredienteDeProveedorNotFoundError}})
    await em.removeAndFlush(ingreDeProv)
    res.status(200).json({message: `El proveedor de cuit "${proveedor.cuit}" del ingrediente "${ingrediente.descIngre}" ha sido eliminado con éxito`, data: ingreDeProv})
  } catch (error: any) {
    handleErrors(error, res)
  }
}

export { sanitizeIngredienteDeProveedor, findOne, add, remove }