import { Proveedor } from "../proveedor/proveedor.entity.js"
import { orm } from "../shared/db/orm.js"
import { Ingrediente } from "./ingrediente.entity.js"
import { NextFunction, Request, Response } from "express"
import { validarIngrediente, validarIngredientePatch } from "./ingrediente.schema.js"
import { IngredienteAlreadyInUseError, IngredienteHasNoProveedor, IngredienteNotFoundError, IngredientePreconditionFailed, 
  IngredienteUniqueConstraintViolation } from "../shared/errors/entityErrors/ingrediente.errors.js"
import { handleErrors } from "../shared/errors/errorHandler.js"
import { ProveedorNotFoundError } from "../shared/errors/entityErrors/proveedor.errors.js"
import { IngredienteDeProveedor } from "./ingredienteDeProveedor/ingredienteDeProveedor.entity.js"
import { validarFindAll } from "../shared/validarFindAll.js"
import { Plato } from "../plato/plato.entity.js"
import { ElaboracionPlato } from "../plato/elaboracionPlato/elaboracionPlato.entity.js"

const em = orm.em

function sanitizeIngrediente(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    codigo: req.body.codigo,
    descIngre: req.body.descIngre,
    puntoDePedido: req.body.puntoDePedido,
    stock: req.body.stock,
    unidadMedida: req.body.unidadMedida,
    aptoCeliacos: req.body.aptoCeliacos,
    aptoVegetarianos: req.body.aptoVegetarianos,
    aptoVeganos: req.body.aptoVeganos,
  }
  Object.keys(req.body.sanitizedInput).forEach((keys) => {
    if(req.body.sanitizedInput[keys] === undefined) {
      delete req.body.sanitizedInput[keys]
    }
  })
  next()
}


function sanitizeQuery(req: Request){
  const queryResult: any = {
    descIngre: req.query.descripcionParcial,
    aptoCeliacos: req.query.aptoCeliacos,
    aptoVegetarianos: req.query.aptoVegetarianos,
    aptoVeganos: req.query.aptoVeganos
  }

  Object.keys(queryResult).forEach((keys) => {
    if(queryResult[keys] === undefined) {
      delete queryResult[keys]
    } else if(keys === 'descIngre') {
      queryResult[keys] = {$like: `%${req.query.descripcionParcial}%`}

    } else if(queryResult[keys] === 'true') {
      queryResult[keys] = !!queryResult[keys]

    } else if(queryResult[keys] === 'false') {
      queryResult[keys] = !!!(queryResult[keys])

    } 
  })
  return queryResult
}

async function findAll(req: Request, res: Response) {
  try {
    req.query.sanitizedQuery = sanitizeQuery(req)
    const ingre = validarFindAll(await em.find(Ingrediente, req.query.sanitizedQuery as object), IngredienteNotFoundError)
    res.status(200).json({message: 'Todos los ingredientes fueron encontrados con éxito', data: ingre})
  } catch(error: any) {
    handleErrors(error, res)
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const codigo = Number.parseInt(req.params.cod)
    const ingre = await em.findOneOrFail(Ingrediente, {codigo}, {populate: ['ingredienteDeProveedor'], failHandler: () => {throw new IngredienteNotFoundError}})
    res.status(200).json({message: `El ingrediente ${ingre.descIngre} fue hallado con éxito`, data: ingre})
  } catch(error: any) {
    handleErrors(error, res)
  }
}

async function add(req: Request, res: Response) {
  try {
    if ((await em.find(Proveedor, {})).length === 0) {
      throw new IngredientePreconditionFailed
    } else if (req.body.proveedor === undefined){
      throw new IngredienteHasNoProveedor
    } else {
      const ingredienteValido = validarIngrediente(req.body.sanitizedInput)
      const ingre = em.create(Ingrediente, ingredienteValido)
      // creación de la relación entre ingrediente y proveedor
      const id = Number.parseInt(req.body.proveedor)
      const proveedor = await em.findOneOrFail(Proveedor, {id}, {failHandler: () => {throw new ProveedorNotFoundError}})
      const ingredienteDeProveedor = em.create(IngredienteDeProveedor, {ingrediente: ingre, proveedor})
      await em.flush()
      res.status(201).json({message: `El ingrediente ${ingre.descIngre} fue creado con éxito`, data: ingre})
    }
  } catch(error: any) {
    if(error.name === 'UniqueConstraintViolationException') {
      error = new IngredienteUniqueConstraintViolation
    }
    handleErrors(error, res)
  }
}

async function update(req: Request, res: Response) {
  try {
    const codigo = Number.parseInt(req.params.cod)
    const ingre = await em.findOneOrFail(Ingrediente, {codigo}, {failHandler: () => {throw new IngredienteNotFoundError}})
    let ingreUpdated
    if(req.method === 'PATCH') {
      ingreUpdated = validarIngredientePatch(req.body.sanitizedInput)
    } else {
      ingreUpdated = validarIngrediente(req.body.sanitizedInput)
    }
    em.assign(ingre, ingreUpdated)
    await em.flush()
    res.status(200).json({message: `El ingrediente ${ingre.descIngre} ha sido actualizado con éxito`, data: ingre})
  } catch(error: any) {
    if(error.name === 'UniqueConstraintViolationException') {
      error = new IngredienteUniqueConstraintViolation
    }
    handleErrors(error, res)
  }
}

async function remove(req: Request, res: Response) {
    try {
    const codigo = Number.parseInt(req.params.cod)
    const ingre = await em.findOneOrFail(Ingrediente, {codigo}, {failHandler: () => {throw new IngredienteNotFoundError}})
    if((await em.find(ElaboracionPlato, {ingrediente: ingre})).length > 0) {
      throw new IngredienteAlreadyInUseError
    }
    const ingredienteDeProveedores = await em.find(IngredienteDeProveedor, {ingrediente: ingre})
    ingredienteDeProveedores.map((ingreDeProv) => {
      em.remove(ingreDeProv)
    })
    em.remove(ingre)
    await em.flush()
    res.status(200).json({message: `El ingrediente ${ingre.descIngre} ha sido eliminado con éxito`, data: ingre})
  } catch(error: any) {
    handleErrors(error, res)
  }
}

export { findAll, findOne, add, sanitizeIngrediente, update, remove }