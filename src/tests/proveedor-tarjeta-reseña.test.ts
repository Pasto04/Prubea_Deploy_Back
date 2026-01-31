/**
import { app } from '../app'
import request from 'supertest'
import { describe, expect, it } from 'vitest'


//TESTING DEL CRUD DE LA ENTIDAD "PROVEEDOR"
describe('Testing del CRUD de la entidad Proveedor', () => {

  //TESTING DEL MÉTODO "GET"
  it('Solicitamos todos los proveedores y devuelve con código de estado de 200', async () => {
    const response = await request(app).get('/api/proveedores')
    expect(response.status).toBe(200)
  })
  it('Solicitamos un proveedor existente y devuelve un código de estado de 200', async () => {
    const response = await request(app).get('/api/proveedores/1')
    expect(response.status).toBe(200)
  })
  it('Solicitamos un proveedor que no existe y devuelve un código de estado de 404', async () => {
    const response = await request(app).get('/api/proveedores/1000')
    expect(response.status).toBe(404)
  })

  //TESTING DEL MÉTODO "POST"
  it('Solicitamos crear un nuevo proveedor y devuelve un código de estado de 201', async () => {
    const response = await request(app).post('/api/proveedores').send({
      cuit: "20452157393",
      razonSocial: "Judgement",
      direccion: "Invisible Street 123",
      ciudad: "Academic City",
      provincia: "Neverland",
      pais: "Neverland",
      telefono: "81 72 75849123",
      email: "skuroko@gmail.com"
    })
    expect(response.status).toBe(201)
  })
  it('Solicitamos crear un nuevo proveedor con cuil ya registrado y devuelve un código de estado de 400', async () => {
    const response = await request(app).post('/api/proveedores').send({
      cuit: "65784532675",
      razonSocial: "Judgemento",
      direccion: "Invisible Street 1234",
      ciudad: "Academic City",
      provincia: "Neverland",
      pais: "Neverland",
      telefono: "81 72 75849124",
      email: "shkuroko@gmail.com"
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos crear un nuevo proveedor con razón social ya registrada y devuelve un código de estado de 400', async () => {
    const response = await request(app).post('/api/proveedores').send({
      cuit: "20452157394",
      razonSocial: "Red Bull",
      direccion: "Invisible Street 1234",
      ciudad: "Academic City",
      provincia: "Neverland",
      pais: "Neverland",
      telefono: "81 72 75849124",
      email: "shkuroko@gmail.com"
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos crear un nuevo proveedor con teléfono ya registrado y devuelve un código de estado de 400', async () => {
    const response = await request(app).post('/api/proveedores').send({
      cuit: "20452157395",
      razonSocial: "Judgemento",
      direccion: "Invisible Street 1234",
      ciudad: "Academic City",
      provincia: "Neverland",
      pais: "Neverland",
      telefono: "+54 9 3462 522974",
      email: "shkuroko@gmail.com"
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos crear un nuevo proveedor con email ya registrado y devuelve un código de estado de 400', async () => {
    const response = await request(app).post('/api/proveedores').send({
      cuit: "20452157396",
      razonSocial: "Judgemento",
      direccion: "Invisible Street 1234",
      ciudad: "Academic City",
      provincia: "Neverland",
      pais: "Neverland",
      telefono: "81 72 75849124",
      email: "contactHunkel@gmail.com"
    })
    expect(response.status).toBe(400)
  })

  //TESTING DEL MÉTODO "PUT"
  it('Solicitamos modificar los datos de un proveedor existente y devuelve un código de estado de 200', async () => {
    const response = await request(app).put('/api/proveedores/1').send({
      cuit: "20452159982",
      razonSocial: "HunKel S.A",
      direccion: "Dorrego 1265",
      ciudad: "Venado Tuerto",
      provincia: "Santa Fe",
      pais: "Argentina",
      telefono: "+54 9 3462 522974",
      email: "contactHunkel@gmail.com"
    })
    expect(response.status).toBe(200)
  })
  it('Solicitamos modificar los datos de un proveedor inexistente y devuelve un código de estado de 404', async () => {
    const response = await request(app).put('/api/proveedores/1000').send({
      cuit: "20452159982",
      razonSocial: "HunKel S.A.",
      direccion: "Dorrego 1265",
      ciudad: "Venado Tuerto",
      provincia: "Santa Fe",
      pais: "Argentina",
      telefono: "+54 9 3462 522974",
      email: "contactHunkel@gmail.com"
    })
    expect(response.status).toBe(404)
  })
  it('Solicitamos modificar los datos de un proveedor pero falta/n alguno/s de sus datos, por lo que devuelve un código de estado de 400', async () => {
    const response = await request(app).put('/api/proveedores/4').send({
      cuit: "12345678912",
      razonSocial: "Pasto.S.A",
      direccion: "Mendoza 543",
      provincia: "Santa Fe",
      pais: "Argentina",
      telefono: "+54 3462 467503"
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos modificar los datos de un proveedor pero el CUIL ingresado ya se encuentra registrado, por lo que devuelve un código de estado de 400', async () => {
    const response = await request(app).put('/api/proveedores/4').send({
      cuit: "65784532675",
      razonSocial: "Pasto.S.A",
      direccion: "Mendoza 543",
      ciudad: "Rosario",
      provincia: "Santa Fe",
      pais: "Argentina",
      telefono: "+54 3462 467503",
      email: "pasto@gmail.com"
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos modificar los datos de un proveedor pero la razón social ingresada ya se encuentra registrada, por lo que devuelve un código de estado de 400', async () => {
    const response = await request(app).put('/api/proveedores/4').send({
      cuit: "12345678912",
      razonSocial: "Red Bull",
      direccion: "Mendoza 543",
      ciudad: "Rosario",
      provincia: "Santa Fe",
      pais: "Argentina",
      telefono: "+54 3462 467503",
      email: "pasto@gmail.com"
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos modificar los datos de un proveedor pero el teléfono ingresado ya se encuentra registrado, por lo que devuelve un código de estado de 400', async () => {
    const response = await request(app).put('/api/proveedores/4').send({
      cuit: "12345678912",
      razonSocial: "Pasto.S.A",
      direccion: "Mendoza 543",
      ciudad: "Rosario",
      provincia: "Santa Fe",
      pais: "Argentina",
      telefono: "+54 3462 890523",
      email: "pasto@gmail.com"
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos modificar los datos de un proveedor pero el email ingresado ya se encuentra registrado, por lo que devuelve un código de estado de 400', async () => {
    const response = await request(app).put('/api/proveedores/4').send({
      cuit: "12345678912",
      razonSocial: "Pasto.S.A",
      direccion: "Mendoza 543",
      ciudad: "Rosario",
      provincia: "Santa Fe",
      pais: "Argentina",
      telefono: "+54 3462 467503",
      email: "redbull@gmail.com"
    })
    expect(response.status).toBe(400)
  })

  //TESTING DEL MÉTODO "DELETE"
  it('Solicitamos eliminar un proveedor existente y devuelve un código de estado de 200', async () => {
    const getResponse = await request(app).get('/api/proveedores')
    let newId = getResponse.body.data[getResponse.body.data.length - 1].id
    const deleteResponse = await request(app).delete(`/api/proveedores/${newId}`) 
    expect(deleteResponse.status).toBe(200)
  })
  it('Solicitamos eliminar un proveedor existente pero, como existen ingredientes asociados a este proveedor, devuelve un código de estado de 400', async () => {
    const response = await request(app).delete('/api/proveedores/6') 
    expect(response.status).toBe(400)
  })
  it('Solicitamos eliminar un proveedor existente pero, como existen bebidas asociadas a este proveedor, devuelve un código de estado de 400', async () => {
    const response = await request(app).delete('/api/proveedores/4') 
    expect(response.status).toBe(400)
  })

})


//TESTING DEL CRUD DE LA ENTIDAD "TARJETA"
describe('Testing del CRUD de la entidad Tarjeta', () => {

  //TESTING DEL MÉTODO "GET"
  it('Solicitamos todos los proveedores de la entidad Tarjeta, devuelve un código de estado de 200', async () => {
    const response = await request(app).get('/api/tarjetas')
    expect(response.status).toBe(200)
  })
  it('Solicitamos una tarjeta existente, devuelve un código de estado de 200', async () => {
    const response = await request(app).get('/api/tarjetas/2')
    expect(response.status).toBe(200)
  })
  it('Solicitamos una tarjeta no existente, devuelve un código de estado de 404', async () => {
    const response = await request(app).get('/api/tarjetas/1000')
    expect(response.status).toBe(404)
  })

  //TESTING DEL MÉTODO "POST"
  it('Solicitamos crear una nueva tarjeta y devuelve un código de estado de 201', async () => {
    const response = await request(app).post('/api/tarjetas').send({
      descTarjeta: 'Visa Platinum'
    })
    expect(response.status).toBe(201)
  })
  it('Solicitamos crear una nueva tarjeta pero, como el nombre de la misma ya existe, devuelve un código de estado de 400', async () => {
    const response = await request(app).post('/api/tarjetas').send({
      descTarjeta: 'Visa Gold'
    })
    expect(response.status).toBe(400)
  })

  //TESTING DEL MÉTODO "PUT"
  it('Solicitamos modificar los datos de una tarjeta existente y devuelve un código de estado de 200', async () => {
    const response = await request(app).put(`/api/tarjetas/2`).send({
      descTarjeta: 'Mastercard Diamond'
    })
    expect(response.status).toBe(200)
  })
  it('Solicitamos modificar los datos de una tarjeta inexistente y devuelve un código de estado de 404', async () => {
    const response = await request(app).put('/api/tarjetas/1000').send({
      descTarjeta: 'Mastercard Black'
    })
    expect(response.status).toBe(404)
  })
    it('Solicitamos modificar los datos de una tarjeta existente pero, como su nombre está repetido, devuelve un código de estado de 400', async () => {
    const response = await request(app).put('/api/tarjetas/2').send({
      descTarjeta: 'Amex Black'
    })
    expect(response.status).toBe(400)
  })

  //TESTING DEL MÉTODO "DELETE"
  it('Solicitamos eliminar una tarjeta existente y devuelve un código de estado de 200', async () => {
    const getResponse = await request(app).get('/api/tarjetas')
    const idTarjeta = getResponse.body.data[getResponse.body.data.length - 1].idTarjeta
    const response = await request(app).delete(`/api/tarjetas/${idTarjeta}`)
    expect(response.status).toBe(200)
  })
  it('Solicitamos eliminar una tarjeta inexistente y devuelve un código de estado de 404', async () => {
    const response = await request(app).delete('/api/tarjetas/10000')
    expect(response.status).toBe(404)
  })

})


//TESTING DEL CRUD DE LA ENTIDAD "RESEÑA"
describe('Testing del CRUD de la entidad Reseña', () => {

  //TESTING DEL MÉTODO "GET"
  it('Solicitamos todas las reseñas y devuelve un código de estado de 200', async () => {
    const response = await request(app).get('/api/resenas')
    expect(response.status).toBe(200)
  })
  it('Solicitamos una reseña existente y devuelve un código de estado de 200', async () => {
    const response = await request(app).get('/api/pedidos/9/resena')
    expect(response.status).toBe(200)
  })
  it('Solicitamos una reseña inexistente y devuelve un código de estado de 404', async () => {
    const response = await request(app).get('/api/pedidos/29/resena')
    expect(response.status).toBe(404)
  })

  //TESTING DEL MÉTODO "POST"
  it('Solicitamos crear una nueva reseña y devuelve un código de estado de 201', async () => {
    const response = await request(app).post('/api/clientes/8/pedidos/33/resena').send({
      cuerpo: 'Excelente atención',
      puntaje: 4
    })
    expect(response.status).toBe(201)
  })
  it('Solicitamos crear una nueva reseña pero falta/n alguno/s de sus datos, por lo que devuelve un código de estado de 400', async () => {
    const response = await request(app).post('/api/clientes/8/pedidos/34/resena').send({
      cuerpo: 'La comida no ha sido de mi agrado, pero la atención fue muy buena'
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos crear una nueva reseña pero, como el puntaje no es válido, devuelve un codigo de estado de 400', async () => {
    const response = await request(app).post('/api/clientes/8/pedidos/34/resena').send({
      cuerpo: 'La comida no ha sido de mi agrado, pero la atención fue muy buena',
      puntaje: 6
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos crear una nueva reseña pero, como el pedido no ha finalizado, devuelve un código de estado de 409', async () => {
    const response = await request(app).post('/api/clientes/16/pedidos/37/resena').send({
      cuerpo: 'Excelente atención y calidad de productos',
      puntaje: 5
    })
    expect(response.status).toBe(409)
  })
  it('Solicitamos crear una nueva reseña pero, como el pedido ya cuenta con una reseña, devuelve un código de estado de 409', async () => {
    const response = await request(app).post('/api/clientes/2/pedidos/9/resena').send({
      cuerpo: 'Excelente atención y calidad de productos',
      puntaje: 5
    })
    expect(response.status).toBe(409)
  })
  it('Solicitamos crear una nueva reseña pero, como el pedido no corresponde al usuario, devuelve un código de estado de 403', async () => {
    const response = await request(app).post('/api/clientes/16/pedidos/27/resena').send({
      cuerpo: 'Excelente atención y calidad de productos',
      puntaje: 5
    })
    expect(response.status).toBe(403)
  })
  it('Solicitamos crear una nueva reseña pero, como el pedido para el que queremos crearla no existe, devuelve un código de estado de 404', async () => {
    const response = await request(app).post('/api/clientes/16/pedidos/10000').send({
      cuerpo: 'Excelente atención y calidad de productos',
      puntaje: 5
    })
    expect(response.status).toBe(404)
  })

  //TESTING DEL MÉTODO "PUT"
  it('Solicitamos modificar los datos de una reseña existente. Devuelve un código de estado de 200', async () => {
    const response = await request(app).put('/api/clientes/6/pedidos/18/resena').send({
      cuerpo: 'En un principio no me gustó la comida y los precios me parecieron elevados, pero al comparar con otros establecimientos me di cuenta de que fueron acertados',
      puntaje: 4
    })
    console.log(response.body)
    expect(response.status).toBe(200)
  })
  it('Solicitamos modificar los datos de una reseña pero faltan algunos de sus datos. Devuelve un código de estado de 400', async () => {
    const response = await request(app).put('/api/clientes/16/pedidos/36/resena').send({
      cuerpo: 'En un principio no me gustó la comida y los precios me parecieron elevados, pero al comparar con otros establecimientos me di cuenta de que fueron acertados'
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos modificar los datos de una reseña, pero el puntaje ingresado no es válido. Devuelve un código de estado de 400', async () => {
    const response = await request(app).put('/api/clientes/16/pedidos/36/resena').send({
      cuerpo: 'En un principio no me gustó la comida y los precios me parecieron elevados, pero al comparar con otros establecimientos me di cuenta de que fueron acertados',
      puntaje: 8
    })
    expect(response.status).toBe(400)
  })
  it('Solicitamos modificar los datos de una reseña pero el usuario no es el autor de la misma. Devuelve un código de estado de 403', async () => {
    const response = await request(app).put('/api/clientes/6/pedidos/36/resena').send({
      cuerpo: 'En un principio no me gustó la comida y los precios me parecieron elevados, pero al comparar con otros establecimientos me di cuenta de que fueron acertados',
      puntaje: 4
    })
    expect(response.status).toBe(403)
  })
  it('Solicitamos modificar los datos de una reseña pero la misma no existe. Devuelve un código de estado de 404', async () => {
    const response = await request(app).put('/api/clientes/8/pedidos/34/resena').send({
      cuerpo: 'En un principio no me gustó la comida y los precios me parecieron elevados, pero al comparar con otros establecimientos me di cuenta de que fueron acertados',
      puntaje: 4
    })
    expect(response.status).toBe(404)
  })
  it('Solicitamos modificar los datos de una reseña pero el pedido asociado a la misma no existe. Devuelve un código de estado de 404', async () => {
    const response = await request(app).put('/api/clientes/6/pedidos/1000000/resena').send({
      cuerpo: 'En un principio no me gustó la comida y los precios me parecieron elevados, pero al comparar con otros establecimientos me di cuenta de que fueron acertados',
      puntaje: 4
    })
    expect(response.status).toBe(404)
  })


  //TESTING DEL MÉTODO "DELETE"
  it('Solicitamos eliminar una reseña existente y devuelve un código de estado de 200', async () => {
    const deleteResponse = await request(app).delete('/api/clientes/8/pedidos/33/resena')
    expect(deleteResponse.status).toBe(200)
  })
  it('Solicitamos eliminar una reseña pero, como el usuario no es el autor de la misma, devuelve un código de estado de 403', async () => {
    const deleteResponse = await request(app).delete('/api/clientes/16/pedidos/18/resena')
    expect(deleteResponse.status).toBe(403)
  })

})


describe('Testing del CU: Realizar pedido', () => {

  //TESTING AL REALIZAR UN PEDIDO NORMALMENTE
  it('Solicitamos realizar un pedido normalmente y devuelve un código de estado de 200', async () => {

    //1- Buscamos una mesa "Disponible" para iniciar un pedido
    const mesasResponse = await request(app).get('/api/mesas?estado=Disponible')
    const nromesa = mesasResponse.body.data[0].nroMesa

    //2- Creamos un nuevo pedido
    const crearPedidoResponse = await request(app).post('/api/clientes/7/pedidos').send({
      mesa: nromesa
    })
    const nroPed = crearPedidoResponse.body.data.nroPed

    //3- Agregamos comidas y bebidas al pedido

    //Suprema Napolitana con papas fritas
    const supremaResponse = await request(app).post(`/api/pedidos/${nroPed}/platos`).send({
      plato: 16,
      cantidad: 1
    })
    //Gaseosa Coca-cola
    const cocacolaResponse = await request(app).post(`/api/pedidos/${nroPed}/bebidas`).send({
      bebida: 2,
      cantidad: 1
    })

    //4- Confirmamos la recepción de los productos en la mesa

    const checkResponse1 = await request(app).put(`/api/pedidos/${nroPed}/platos/16/fecha/${supremaResponse.body.data.fechaSolicitud}/hora/${supremaResponse.body.data.horaSolicitud}`).send({})
    const checkResponse2 = await request(app).put(`/api/pedidos/${nroPed}/bebidas/2/fecha/${cocacolaResponse.body.data.fechaSolicitud}/hora/${cocacolaResponse.body.data.horaSolicitud}`).send({})

    //5- Procedemos al pago y finalización del pedido

    const pagoResponse = await request(app).post(`/api/pedidos/${nroPed}/pagos`).send({
      tarjetaCliente: 4
    })

    const finalResponse = await request(app).put(`/api/clientes/pedidos/${nroPed}`).send({})

    expect(finalResponse.status).toBe(200)
  })
  
})*/