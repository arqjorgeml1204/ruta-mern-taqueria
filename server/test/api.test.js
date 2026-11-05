// Pruebas de la API con el corredor de pruebas que trae Node (node --test).
// Desde el módulo 5 usan MongoDB: se conectan a la base de server/.env con «_test» al final del nombre
// (p. ej. restaurante_test), así nunca tocan los datos reales. Sin MONGODB_URI, se saltan.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { crearApp } from "../src/app.js";
import { conectar, desconectar } from "../src/db.js";
import { Platillo } from "../src/modelos/Platillo.js";
import { Pedido } from "../src/modelos/Pedido.js";

process.env.NODE_ENV = "test";
const sinBase = !process.env.MONGODB_URI && "falta MONGODB_URI en server/.env";
let servidor, base, enchilada, cafe;

before(async () => {
  if (sinBase) return;
  await conectar({ dbName: `${process.env.MONGODB_DB || "restaurante"}_test` });
  await Promise.all([Platillo.deleteMany({}), Pedido.deleteMany({})]); // solo la base de prueba
  [enchilada, cafe] = await Platillo.create([
    { nombre: "Enchilada verde", precio: 15, categoria: "platos" },
    { nombre: "Café de olla", precio: 30, categoria: "bebidas" },
  ]);
  await new Promise((listo) => {
    servidor = crearApp().listen(0, () => { base = `http://localhost:${servidor.address().port}/api`; listo(); });
  });
});
after(async () => {
  if (sinBase) return;
  servidor.close();
  await Promise.all([Platillo.deleteMany({}), Pedido.deleteMany({})]);
  await desconectar();
});

const pedir = (ruta, opciones = {}) => fetch(base + ruta, {
  ...opciones,
  headers: { "Content-Type": "application/json" },
  body: opciones.body && JSON.stringify(opciones.body),
});

test("GET /platillos devuelve el menú de la base con «id»", { skip: sinBase }, async () => {
  const menu = await (await pedir("/platillos")).json();
  assert.equal(menu.length, 2);
  assert.ok(menu[0].id && !menu[0]._id);
});

test("GET /platillos?categoria=bebidas filtra por categoría", { skip: sinBase }, async () => {
  const bebidas = await (await pedir("/platillos?categoria=bebidas")).json();
  assert.deepEqual(bebidas.map((p) => p.nombre), ["Café de olla"]);
});

test("POST /pedidos guarda el pedido con el total calculado en el servidor", { skip: sinBase }, async () => {
  const r = await pedir("/pedidos", { method: "POST", body: { lineas: [{ id: enchilada.id, cantidad: 2 }], propina: 10, total: 1 } });
  assert.equal(r.status, 201);
  const pedido = await r.json();
  assert.equal(pedido.total, 40);
  assert.equal(await Pedido.countDocuments({ total: 40 }), 1); // quedó en MongoDB
});

test("POST /pedidos rechaza un pedido vacío o un id inválido con 400", { skip: sinBase }, async () => {
  assert.equal((await pedir("/pedidos", { method: "POST", body: { lineas: [] } })).status, 400);
  assert.equal((await pedir("/pedidos", { method: "POST", body: { lineas: [{ id: "abc", cantidad: 1 }] } })).status, 400);
});

test("PATCH /pedidos/:id/estado cambia el estado y valida el valor", { skip: sinBase }, async () => {
  const { id } = await (await pedir("/pedidos", { method: "POST", body: { lineas: [{ id: cafe.id, cantidad: 1 }] } })).json();
  const cambiado = await (await pedir(`/pedidos/${id}/estado`, { method: "PATCH", body: { estado: "preparando" } })).json();
  assert.equal(cambiado.estado, "preparando");
  assert.equal((await pedir(`/pedidos/${id}/estado`, { method: "PATCH", body: { estado: "volando" } })).status, 400);
});

test("GET /pedidos/resumen agrupa por estado", { skip: sinBase }, async () => {
  const resumen = await (await pedir("/pedidos/resumen")).json();
  assert.deepEqual(resumen.map((r) => r.estado), ["preparando", "recibido"]);
  assert.equal(resumen.find((r) => r.estado === "recibido").total, 40);
});

test("una ruta que no existe responde 404 en JSON", { skip: sinBase }, async () => {
  const r = await pedir("/postres-gratis");
  assert.equal(r.status, 404);
  assert.ok((await r.json()).error);
});
