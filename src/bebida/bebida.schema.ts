import z from 'zod'
import { BebidaUnidadMedidaTypeError } from '../shared/errors/entityErrors/bebida.errors.js'

const unidadesMedida = ['litros', 'mililitros']

const isIn = z
  .function()
  .args(z.string(), z.array(z.string()))
  .implement((a, b) => {
    if (b.find((e) => e.toLowerCase() === a.toLowerCase())) {
      return true
    }
  });

const bebidaSchema = z.object({
  codBebida: z
    .number({
      required_error: 'El código de la bebida es requerido',
      invalid_type_error: 'El código de la bebida debe ser un número',
    })
    .int({ message: 'El código de la bebida debe ser un número entero' })
    .positive({
      message: 'El código de la bebida debe ser un número entero positivo',
    })
    .optional(),
  descripcion: z.string({
    required_error: 'La descripción de la bebida es requerida',
    invalid_type_error: 'La descripción de la bebida debe ser un texto',
  }),
  stock: z
    .number({
      required_error: 'El stock de la bebida es requerido',
      invalid_type_error: 'El stock de la bebida debe ser un número',
    })
    .int({ message: 'El stock de la bebida debe ser un número entero' })
    .positive({
      message: 'El stock de la bebida debe ser un número entero positivo',
    }),
  unidadMedida: z.string({
    required_error: 'La unidad de medida es requerida',
    invalid_type_error: 'La unidad de medida debe ser un string',
  }),
  contenido: z
    .number({
      required_error: 'El contenido de la bebida es requerido',
      invalid_type_error: 'El contenido de la bebida debe ser un número',
    })
    .positive({
      message: 'El contenido de la bebida debe ser un número positivo',
    }),
  precio: z
    .number({
      required_error: 'El precio de la bebida es requerido',
      invalid_type_error: 'El precio de la bebida debe ser un número',
    })
    .positive({
      message: 'El precio de la bebida debe ser un número positivo',
    }),
  alcohol: z
    .string({
      required_error: 'El porcentaje de alcohol es requerido',
      invalid_type_error: 'El porcentaje de alcohol debe ser un string',
    })
    .optional(), // El alcohol ahora es un string
  imagen: z
    .string({
      invalid_type_error: 'La imagen debe ser un string',
    })
    .url({ message: 'La imagen debe ser una URL válida' })
    .optional()
    .nullable(),
})

const bebidaToPatchSchema = z.object({
  descripcion: z
    .string({
      required_error: 'La descripción de la bebida es requerida',
      invalid_type_error: 'La descripción de la bebida debe ser un texto',
    })
    .optional(),
  unidadMedida: z
    .string({
      required_error: 'La unidad de medida es requerida',
      invalid_type_error: 'La unidad de medida debe ser un string',
    })
    .optional(),
  stock: z
    .number({
      required_error: 'El stock de la bebida es requerido',
      invalid_type_error: 'El stock de la bebida debe ser un número',
    })
    .int({ message: 'El stock de la bebida debe ser un número entero' })
    .positive({
      message: 'El stock de la bebida debe ser un número entero positivo',
    })
    .optional(),

  contenido: z
    .number({
      required_error: 'El contenido de la bebida es requerido',
      invalid_type_error: 'El contenido de la bebida debe ser un número',
    })
    .positive({
      message: 'El contenido de la bebida debe ser un número entero positivo',
    })
    .optional(),
  precio: z
    .number({
      required_error: 'El precio de la bebida es requerido',
      invalid_type_error: 'El precio de la bebida debe ser un número',
    })
    .positive({ message: 'El precio de la bebida debe ser un número positivo' })
    .optional(),
  alcohol: z
    .string({
      invalid_type_error: 'El alcohol debe ser un string',
    })
    .optional(),
  imagen: z
    .string({
      invalid_type_error: 'La imagen debe ser un string',
    })
    .url({ message: 'La imagen debe ser una URL válida' })
    .optional()
    .nullable(),
})

function validarBebida(object: any) {
  try {
    const result = isIn(object.unidadMedida, unidadesMedida)
    if (result) {
      return bebidaSchema.parse(object)
    } else {
      throw new BebidaUnidadMedidaTypeError()
    }
  } catch (error: any) {
    throw error
  }
}

function validarBebidaPatch(object: any) {
  try {
    if (object.unidadMedida) {
      const result = isIn(object.unidadMedida, unidadesMedida);
      if (!result) {
        throw new BebidaUnidadMedidaTypeError()
      } else {
        return bebidaToPatchSchema.parse(object)
      }
    } else {
      return bebidaToPatchSchema.parse(object)
    }
  } catch (error: any) {
    throw error
  }
}

export { validarBebida, validarBebidaPatch }

