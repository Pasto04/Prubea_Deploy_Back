import z from 'zod'
import { Usuario } from '../usuario/usuario.entity.js'
import { Mesa } from '../mesa/mesa.entity.js'
import { PlatoPedido } from '../plato/platoPedido/platoPedido.entity.js'
import { BebidaPedido } from '../bebida/bebidaPedido/bebidaPedido.entity.js'
import { Pago } from './pago/pago.entity.js'
import { Plato } from '../plato/plato.entity.js'
import { orm } from '../shared/db/orm.js'

const pedidoSchema = z.object({
  nroPed: z.number().int().positive().optional(),
  estado: z
    .string()
    .includes('en curso', {
      message: 'El estado del pedido debe ser "en curso"',
    })
    .optional(),
  fecha: z.string().date().optional(),
  hora: z.string().time().optional(),
  cliente: z.number({
      required_error: 'El usuario es requerido',
      invalid_type_error: 'El usuario se representa con un valor numérico'
    }).positive({message: 'El usuario debe ser un número positivo'}),
  mesa: z.number({
      required_error: 'La mesa es requerida',
      invalid_type_error: 'La mesa se representa con un valor numérico'
    }).positive({message: 'La mesa debe ser un número positivo'})
})

const pedidoToCancelSchema = z.object({
  estado: z
    .string()
    .includes('cancelado', {
      message: 'El estado del pedido debe ser "cancelado"',
    })
    .optional(),
  fechaCancelacion: z.string().date().optional(),
  horaCancelacion: z.string().time().optional(),
})

const pedidoToEndSchema = z.object({
  nroPed: z.number().int().positive().optional(),
  estado: z.string().includes('finalizado', {
    message: 'El estado del pedido debe ser "finalizado"',
  }),
  cliente: z.number({
          required_error: 'El usuario es requerido',
          invalid_type_error: 'El usuario debe ser un número',
        })
        .int({ message: 'El usuario debe ser un número entero' })
        .positive({ message: 'El usuario debe ser un número entero positivo'}),
  mesa: z.number({
          required_error: 'La mesa es requerida',
          invalid_type_error: 'La mesa debe ser un número',
        })
        .int({ message: 'La mesa debe ser un número entero' })
        .positive({ message: 'La mesa debe ser un número entero positivo'}),

  pago: z.number({
          required_error: 'El pago es requerido',
          invalid_type_error: 'El pago debe ser un número',
        })
        .int({ message: 'El pago debe ser un número entero' })
        .positive({ message: 'El pago debe ser un número entero positivo'})
})

function validarPedido(object: any) {
  try {
    return pedidoSchema.parse(object)
  } catch (error: any) {
    throw error
  }
}

function validarPedidoCancelar(object: any) {
  try {
    return pedidoToCancelSchema.parse(object)
  } catch (error: any) {
    throw error
  }
}

function validarPedidoFinalizar(object: any) {
  try {
    return pedidoToEndSchema.parse(object)
  } catch (error: any) {
    throw error
  }
}

export { validarPedido, validarPedidoCancelar, validarPedidoFinalizar }
