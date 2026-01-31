import { app } from '../app'; // Importa tu app
import request from 'supertest';
import { describe, expect, it } from 'vitest';

/**TEST UNITARIO*/
function calcularTotalPedido(items: { nombre: string, precio: number, cantidad: number }[]): number {
    let total = 0;
    for (const item of items) {
        if (item.cantidad < 0) continue; 
        total += item.precio * item.cantidad;
    }
    return total;
}


function esEstadoMesaValido(estado: string): boolean {
    const estadosPermitidos = ['Disponible', 'Ocupada', 'Reservada', 'Mantenimiento'];
    return estadosPermitidos.includes(estado);
}


describe('Tests Unitarios: Lógica de Negocio del Restaurante', () => {


    it('Cálculo de Pedidos: Debe sumar correctamente el precio x cantidad', () => {
        const pedido = [
            { nombre: 'Milanesa', precio: 5000, cantidad: 2 }, 
            { nombre: 'Coca Cola', precio: 2000, cantidad: 1 }  
        ];
        
        const total = calcularTotalPedido(pedido);
        expect(total).toBe(12000); 
    });

    it('Cálculo de Pedidos: Debe manejar listas vacías devolviendo 0', () => {
        expect(calcularTotalPedido([])).toBe(0);
    });

    // TEST INTEGRANTE 2
    it('Validación de Mesas: Debe aceptar estados válidos del sistema', () => {
        expect(esEstadoMesaValido('Disponible')).toBe(true);
        expect(esEstadoMesaValido('Ocupada')).toBe(true);
    });

    it('Validación de Mesas: Debe rechazar estados inventados', () => {
        expect(esEstadoMesaValido('Flotando')).toBe(false); 
        expect(esEstadoMesaValido('')).toBe(false);
    });

});




/**TEST DE INTEGRACIÓN*/
describe(' Requisito 2: Test de Integración', () => {
    it('Seguridad: GET /api/proveedores sin token debe rechazar la conexión (401)', async () => {
        const response = await request(app).get('/api/proveedores');
        expect(response.status).toBe(401); 
    });
});