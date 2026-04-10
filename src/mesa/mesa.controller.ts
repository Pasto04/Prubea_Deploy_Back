import { Request,Response } from "express"
import { Mesa } from "./mesa.entity.js"
import { orm } from "../shared/db/orm.js"
import { validarMesa, validarMesaToPatch } from "./mesa.schema.js"
import { handleErrors } from "../shared/errors/errorHandler.js"
import { MesaAlreadyInUseError, MesaNotFoundError } from "../shared/errors/entityErrors/mesa.errors.js"
import { validarFindAll } from "../shared/validarFindAll.js"

const em = orm.em

async function findAll(req:Request,res:Response) {
  try{
    if (req.query.estado){
      const estado = req.query.estado as string
      const mesas = validarFindAll(await em.find(Mesa, {estado}), MesaNotFoundError)
      res.status(200).json({message: `Todas las mesas con estado ${estado} encontradas`, data: mesas})
    } else {
      const mesas = validarFindAll(await em.find(Mesa, {}), MesaNotFoundError)
      res.status (200).json({message: 'Todas las mesas encontradas', data: mesas})
    }
  } catch (error:any){
    handleErrors(error, res)
  }
}

async function findOne(req:Request,res:Response) {
  try{
    const nroMesa = Number.parseInt(req.params.nroMesa)
    const mesa = await em.findOneOrFail(Mesa, {nroMesa}, {failHandler: () => {throw new MesaNotFoundError}})
    await em.flush()
    res.status(200).json({message: 'Mesa encontrada exitosamente', data: mesa})
  } catch (error:any){
    handleErrors(error, res)
  }
}

async function add(req:Request,res:Response) {
  try{
    const mesaValida = validarMesa(req.body)
    const mesa = em.create(Mesa, mesaValida)
    await em.flush()
    res.status(201).json({message: 'Mesa creada con éxito', data:mesa})
  } catch (error:any){
    handleErrors(error, res)
  }
}


async function update(req:Request,res:Response){
  try{
    const nroMesa = Number.parseInt(req.params.nroMesa)
    const mesaToUpdate = await em.findOneOrFail(Mesa, {nroMesa}, {failHandler: () => {throw new MesaNotFoundError}})
    let mesaUpdated
    if(req.method === 'PATCH'){
      mesaUpdated = validarMesaToPatch(req.body)
    } else {
      mesaUpdated = validarMesa(req.body)
    }
    em.assign(mesaToUpdate, mesaUpdated)
    await em.flush()
    res.status(200).json({message: 'Mesa actualizada con éxito', data: mesaToUpdate})
  } catch (error:any){
    handleErrors(error, res)
  }
}

async function remove(req:Request,res:Response) {
    try {
    const nroMesa = Number.parseInt(req.params.nroMesa)
    const mesa = await em.findOneOrFail(Mesa, {nroMesa}, {populate: ['pedidos'], failHandler: () => {throw new MesaNotFoundError}})
    if(mesa.pedidos.length > 0) {
      throw new MesaAlreadyInUseError
    }
    await em.removeAndFlush(mesa)
    res.status(200).json({message: 'La mesa ha sido eliminada con éxito', data: mesa})
  } catch(error: any) {
    handleErrors(error, res)
  }
}

export {findAll,findOne,add,update,remove}