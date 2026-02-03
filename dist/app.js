import 'reflect-metadata';
import 'dotenv/config';
import { RequestContext } from '@mikro-orm/core';
import { orm, syncSchema } from './shared/db/orm.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { ingredienteRouter } from './ingrediente/ingrediente.routes.js';
import { tipoPlatoRouter } from './plato/tipoPlato.routes.js';
import { platoRouter } from './plato/plato.routes.js';
import { usuarioRouter } from './usuario/usuario.routes.js';
import { pedidoRouter } from './pedido/pedido.routes.js';
import { platoPedidoRouter } from './plato/platoPedido/platoPedido.routes.js';
import { getResenaRouter, pedidoResenaRouter, resenaRouter } from './pedido/reseña.routes.js';
import { elabPlatoRouter } from './plato/elaboracionPlato/elaboracionPlato.routes.js';
import { pedidoClienteRouter } from './pedido/pedidoCliente.routes.js';
import { proveedorRouter } from './proveedor/proveedor.routes.js';
import { ingredienteDeProveedorRouter } from './ingrediente/ingredienteDeProveedor/ingredienteDeProveedor.routes.js';
import { tarjetaRouter } from './tarjetaCliente/tarjeta.routes.js';
import { tarjetaClienteRouter } from './tarjetaCliente/tarjetaCliente.routes.js';
import { mesaRouter } from './mesa/mesa.routes.js';
import { bebidaRouter } from './bebida/bebida.routes.js';
import { bebidaPedidoRouter } from './bebida/bebidaPedido/bebidaPedido.routes.js';
import { PedidoPagoRouter } from './pedido/pago/pago.routes.js';
import { bebidaDeProveedorRouter } from './bebida/bebidaDeProveedor/bebidaDeProveedor.routes.js';
const port = process.env.PORT || 3000;
const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:4200')
    .split(',')
    .map(origin => origin.trim());
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.error(`Bloqueado por CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use((req, res, next) => {
    RequestContext.create(orm.em, next);
});
// 6. Definición de Rutas
app.use('/api/usuarios', usuarioRouter);
app.use('/api/ingredientes', ingredienteDeProveedorRouter);
app.use('/api/ingredientes', ingredienteRouter);
app.use('/api/platos/tipos', tipoPlatoRouter);
app.use('/api/platos', elabPlatoRouter);
app.use('/api/platos', platoRouter);
app.use('/api/clientes', tarjetaClienteRouter);
app.use('/api/clientes', pedidoClienteRouter);
app.use('/api/pedidos', PedidoPagoRouter);
app.use('/api/pedidos', platoPedidoRouter);
app.use('/api/pedidos', bebidaPedidoRouter);
app.use('/api/clientes', pedidoResenaRouter);
app.use('/api/pedidos', getResenaRouter);
app.use('/api/pedidos', pedidoRouter);
app.use('/api/resenas', resenaRouter);
app.use('/api/proveedores', proveedorRouter);
app.use('/api/tarjetas', tarjetaRouter);
app.use('/api/mesas', mesaRouter);
app.use('/api/bebidas', bebidaDeProveedorRouter);
app.use('/api/bebidas', bebidaRouter);
app.use((req, res) => {
    res.status(404).json({ message: 'Recurso no encontrado' });
});
const startServer = async () => {
    try {
        await syncSchema();
        app.listen(port, () => {
            console.log(`Server running in: http://localhost:${port}/`);
        });
    }
    catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
};
startServer();
export { app };
//# sourceMappingURL=app.js.map