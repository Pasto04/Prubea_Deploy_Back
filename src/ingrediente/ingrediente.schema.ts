import z from 'zod'
import { ElaboracionPlato } from '../plato/elaboracionPlato/elaboracionPlato.entity.js'
import { IngredienteDeProveedor } from './ingredienteDeProveedor/ingredienteDeProveedor.entity.js'
import { IngredienteUnidadMedidaTypeError } from '../shared/errors/entityErrors/ingrediente.errors.js'


const unidadesMedida = ['kilogramos', 'gramos', 'litros', 'mililitros', 'unidades']

const isIn = z.function().args(z.string(), z.array(z.string())).implement((a, b) => {
  if(b.find((e) => e.toLowerCase() === a.toLowerCase())){
    return true
  }
})

const ingredienteSchema = z.object({
  codigo: z.number().int().positive().optional(),
  descIngre: z.string({
                required_error: 'La descripción del ingrediente es requerida', 
                invalid_type_error: 'La descripción del ingrediente debe ser un string',
              }),
  puntoDePedido: z.number({
                   required_error: 'El punto de pedido es requerido', 
                   invalid_type_error: 'El punto de pedido debe ser un número'
                  })
                  .int({message: 'El punto de pedido debe ser un número entero'})
                  .positive({message: 'El punto de pedido debe ser un número entero positivo'}),
  stock: z.number({required_error: 'El stock es requerido', invalid_type_error: 'El stock debe ser un número'})
         .int({message: 'El stock debe ser un número entero'}).positive({message: 'El stock debe ser un número entero positivo'}),
  unidadMedida: z.string({required_error: 'La unidad de medida es requerida', invalid_type_error: 'La unidad de medida debe ser un string'}),
  aptoCeliacos: z.boolean({message: 'Es necesario informar si el ingrediente es apto para celíacos'}),
  aptoVegetarianos: z.boolean({message: 'Es necesario informar si el ingrediente es apto para vegetarianos'}),
  aptoVeganos: z.boolean({message: 'Es necesario informar si el ingrediente es apto para veganos'}),
  elaboracionesPlato: z.array(z.instanceof(ElaboracionPlato)).optional(),
  ingredienteDeProveedor: z.array(z.instanceof(IngredienteDeProveedor)).optional()
})

const ingredienteToPatchSchema = z.object({
  descIngre: z.string({
                required_error: 'La descripción del ingrediente es requerida', 
                invalid_type_error: 'La descripción del ingrediente debe ser un string'
              })
              .optional(),
  puntoDePedido: z.number({
                   required_error: 'El punto de pedido es requerido', 
                   invalid_type_error: 'El punto de pedido debe ser un número'
                  })
                  .int({message: 'El punto de pedido debe ser un número entero'})
                  .positive({message: 'El punto de pedido debe ser un número entero positivo'}).optional(),
  stock: z.number({required_error: 'El stock es requerido', invalid_type_error: 'El stock debe ser un número'})
         .int({message: 'El stock debe ser un número entero'}).positive({message: 'El stock debe ser un número entero positivo'})
         .optional(),
  unidadMedida: z.string({required_error: 'La unidad de medida es requerida', invalid_type_error: 'La unidad de medida debe ser un string'}).optional(),
  aptoCeliacos: z.boolean({message: 'Es necesario informar si el ingrediente es apto para celíacos'}).optional(),
  aptoVegetarianos: z.boolean({message: 'Es necesario informar si el ingrediente es apto para vegetarianos'}).optional(),
  aptoVeganos: z.boolean({message: 'Es necesario informar si el ingrediente es apto para veganos'}).optional(),
  elaboracionesPlato: z.array(z.instanceof(ElaboracionPlato)).optional(),
  ingredienteDeProveedor: z.array(z.instanceof(IngredienteDeProveedor)).optional()
})

function validarIngrediente(object: any) {
  try {
    const result = isIn(object.unidadMedida, unidadesMedida)
    if (result) {
      return ingredienteSchema.parse(object)
    } else {
      throw new IngredienteUnidadMedidaTypeError
    }
  } catch (error: any) {
    throw error
  }
}

function validarIngredientePatch(object: any) {
  try{
    if(object.unidadMedida){
      const result = isIn(object.unidadMedida, unidadesMedida)
      if(result){
        return ingredienteToPatchSchema.parse(object)
      } else {
        throw new IngredienteUnidadMedidaTypeError
      }
    } else {
      return ingredienteToPatchSchema.parse(object)
    }
  } catch (error: any) {
    throw error
  }
}

export { validarIngrediente, validarIngredientePatch }