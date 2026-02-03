import z from 'zod'
import { MesaEstadoError } from '../shared/errors/entityErrors/mesa.errors.js'

const estados = ['Disponible', 'Ocupada']

const isIn = z.function().args(z.string(), z.array(z.string())).implement((a, b) => {
  if(b.find((e) => e.toLowerCase() === a.toLowerCase())){
    return true
  }
})

const mesaSchema = z.object({
  nroMesa: z.number().int().positive().optional(),
  cantPersonasMax: z.number({
                     required_error: 'La cantidad de personas máxima es requerida', 
                     invalid_type_error: 'La cantidad de personas máxima debe ser un número'
                   })
                   .int({message: 'La cantidad de personas máxima debe ser un número entero'})
                   .positive({message: 'La cantidad de personas máxima debe ser un número entero positivo'})
                   .min(2, {message: 'La cantidad máxima de personas debe ser, al menos, 2'}),
  estado: z.string().includes('Disponible', {message: 'El estado de la mesa debe ser Disponible'})
})

const mesaToPatchSchema = z.object({
  nroMesa: z.number().int().positive().optional(),
  cantPersonaMax: z.number({invalid_type_error: 'La cantidad de personas máxima debe ser un número'})
                  .int({message: 'La cantidad de personas máxima debe ser un número entero'})
                  .positive({message: 'La cantidad de personas máxima debe ser un número entero positivo'})
                  .min(2, {message: 'La cantidad de personas máxima debe ser de, al menos, 2 personas'})
                  .optional(),
  estado: z.string({invalid_type_error: 'El estado de la mesa debe ser un string'}).optional(),
          
})

function validarMesa(object: any) {
  try {
    const result = isIn(object.estado, estados)
    if(result) {
      return mesaSchema.parse(object)
    } else {
      throw new MesaEstadoError
    }
  } catch (error: any) {
    throw error
  }
}

function validarMesaToPatch(object: any) {
  try {
    if(object.estado) {
      const result = isIn(object.estado, estados)
      if(result) {
        return mesaToPatchSchema.parse(object)
      } else {
        throw new MesaEstadoError
      }
    } else {
      return mesaToPatchSchema.parse(object)
    }
  } catch (error: any) {
    throw error
  }
}

export { validarMesa, validarMesaToPatch }

