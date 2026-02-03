import z from 'zod'
import { Pedido } from '../../pedido/pedido.entity.js'
import { Plato } from '../plato.entity.js'

const platoPedidoSchema = z.object({
  pedido: z.number({
        required_error: 'El pedido es requerido',
        invalid_type_error: 'El pedido debe ser un número',
      })
      .int({ message: 'El pedido debe ser un número entero' })
      .positive({ message: 'El pedido debe ser un número entero positivo'}),
  plato: z.number({
        required_error: 'El plato es requerido',
        invalid_type_error: 'El plato debe ser un número',
      })
      .int({ message: 'El plato debe ser un número entero' })
      .positive({ message: 'El plato debe ser un número entero positivo'}),
  cantidad: z
    .number({
      required_error: 'La cantidad de platos es requerida',
      invalid_type_error: 'La cantidad de platos es requerida',
    })
    .int({ message: 'La cantidad de platos debe ser un número entero' })
    .positive({
      message: 'La cantidad de platos debe ser un número entero positivo',
    }),
})

const platoPedidoToPatchSchema = z.object({
  pedido: z.number({
        required_error: 'El pedido es requerido',
        invalid_type_error: 'El pedido debe ser un número',
      })
      .int({ message: 'El pedido debe ser un número entero' })
      .positive({ message: 'El pedido debe ser un número entero positivo'}),
  plato: z.number({
        required_error: 'El plato es requerido',
        invalid_type_error: 'El plato debe ser un número',
      })
      .int({ message: 'El plato debe ser un número entero' })
      .positive({ message: 'El plato debe ser un número entero positivo'}),
  fechaSolicitud: z
    .string({ required_error: 'La fecha de solicitud del plato es requerida' })
    .date('La fecha de solicitud debe tener el formato aaaa-mm-dd'),
  horaSolicitud: z
    .string({ required_error: 'La hora de solicitud del plato es requerida' })
    .time({
      message: 'La hora de solicitud del plato debe tener el formato HH:MM:SS',
    }),
})

function validarPlatoPedido(object: any) {
  try {
    return platoPedidoSchema.parse(object)
  } catch (error: any) {
    throw error
  }
}

function validarPlatoPedidoToPatch(object: any) {
  try {
    return platoPedidoToPatchSchema.parse(object)
  } catch (error: any) {
    throw error
  }
}

export { validarPlatoPedido, validarPlatoPedidoToPatch }
