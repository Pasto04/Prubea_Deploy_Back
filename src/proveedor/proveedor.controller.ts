import { Request, Response, NextFunction } from 'express'
import { orm } from '../shared/db/orm.js'
import { Proveedor } from './proveedor.entity.js'
import { validarProveedor, validarProveedorPatch } from './proveedor.schema.js'
import { handleErrors } from '../shared/errors/errorHandler.js'
import { ProveedorIsUniqueForIngredienteError, ProveedorNotFoundError, ProveedorUniqueConstraintViolation } from 
'../shared/errors/entityErrors/proveedor.errors.js'
import { validarFindAll } from '../shared/validarFindAll.js'
import { IngredienteDeProveedor } from '../ingrediente/ingredienteDeProveedor/ingredienteDeProveedor.entity.js'
import { Ingrediente } from '../ingrediente/ingrediente.entity.js'
import { Bebida } from '../bebida/bebida.entity.js'
import { ProveedorIsUniqueForBebidaError } from '../shared/errors/entityErrors/bebida.errors.js'
import { BebidaDeProveedor } from '../bebida/bebidaDeProveedor/bebidaDeProveedor.entity.js'

const em = orm.em

em.getRepository(Proveedor)



async function findAll(req: Request, res: Response) {
  try {
    const proveedores = validarFindAll(await em.find(Proveedor, {}), ProveedorNotFoundError)
    res.status(200).json({message: `Los proveedores han sido encontrados con éxito`, data: proveedores})
  } catch(error: any) {
    handleErrors(error, res)
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const proveedor = await em.findOneOrFail(Proveedor, {id}, {failHandler: () => {throw new ProveedorNotFoundError}})
    res.status(200).json({message: `El proveedor ${proveedor.razonSocial} ha sido encontrado con éxito`, data: proveedor})
  } catch(error: any) {
    handleErrors(error, res)
  }
}

async function add(req: Request, res: Response) {
  try {
    const result = validarProveedor(req.body)
    const proveedor = em.create(Proveedor, result)
    await em.flush()
    res.status(201).json({data: proveedor})
  } catch(error: any) {
    if(error.name === 'UniqueConstraintViolationException') {
      error = new ProveedorUniqueConstraintViolation
    }
    handleErrors(error, res)
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const proveedor = await em.findOneOrFail(Proveedor, {id}, {failHandler: () => {throw new ProveedorNotFoundError}})
    let proveedorUpdated
    if (req.method === 'PATCH') {
      proveedorUpdated = validarProveedorPatch(req.body)
    } else {
      proveedorUpdated = validarProveedor(req.body)
    }
    em.assign(proveedor, proveedorUpdated)
    await em.flush()
    res.status(200).json({message: `El proveedor ${proveedor.razonSocial} ha sido actualizado con éxito`, data: proveedor})
  } catch(error: any) {
    if(error.name === 'UniqueConstraintViolationException') {
      error = new ProveedorUniqueConstraintViolation
    }
    handleErrors(error, res)
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const proveedor = await em.findOneOrFail(Proveedor, {id}, {failHandler: () => {throw new ProveedorNotFoundError}})

    const ingredientes = await em.find(Ingrediente, {}, {populate: ['ingredienteDeProveedor']})
    ingredientes.forEach((ingrediente: Ingrediente) => {
      if(Object.keys(ingrediente.ingredienteDeProveedor).length < 11) { 
        ingrediente.ingredienteDeProveedor.getItems().forEach((ingreDeProv) => { 
          if(ingreDeProv.proveedor.id === proveedor.id) {
            throw new ProveedorIsUniqueForIngredienteError    
          }
        })             
      }
    })
    const bebidas = await em.find(Bebida, {}, {populate: ['bebidasDeProveedor']})
    bebidas.forEach((bebida) => {
      if(Object.keys(bebida.bebidasDeProveedor).length < 11) {
        bebida.bebidasDeProveedor.getItems().forEach((bebidaDeProv) => {
          if(bebidaDeProv.proveedor.id === proveedor.id) {
            throw new ProveedorIsUniqueForBebidaError
          }
        })
      }
    })
   
    const ingredientesDeProveedor = await em.find(IngredienteDeProveedor, {proveedor})
    ingredientesDeProveedor.map((ingreDeProveedor) => {
      em.remove(ingreDeProveedor)
    })
    const bebidasDeProveedor = await em.find(BebidaDeProveedor, {proveedor})
    bebidasDeProveedor.map((bebidaDeProv) => {
      em.remove(bebidaDeProv)
    })
    em.remove(proveedor)
    await em.flush()
    
    res.status(200).json({message: `El proveedor ${proveedor.razonSocial} ha sido eliminado con éxito`, data: proveedor})
  } catch(error: any) {
    handleErrors(error, res)
  }
}

export { findAll, findOne, add, update, remove }