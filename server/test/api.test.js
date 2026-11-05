// Pruebas de la API con el corredor de pruebas que trae Node (node --test). Sin instalar nada más.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { crearApp } from "../src/app.js";

process.env.NODE_ENV = "test";
let servidor, base;
before(() => new Promise((listo) => {
  servidor = crearApp().listen(0, () => { base = `http://localhost:${servidor.address().port}/api`; listo(); });
}));
after(() => servidor.close());

const pedir = (ruta, opciones = {}) => fetch(base + ruta, {
  ...opciones,
  headers: { "Content-Type": "application/json" },
  body: opciones.body && JSON.stringify(opciones.body),
});

test("GET /platillos devuelve el menú de 6 platillos", async () => {
  const r = await pedir("/platillos");
  assert.equal(r.status, 200);
  assert.equal((await r.json()).length, 6);
});

test("GET /platillos?categoria=bebidas filtra por categoría", async () => {
  const bebidas = await (await pedir("/platillos?categoria=bebidas")).json();
  assert.deepEqual(bebidas.map((p) => p.nombre), ["Agua de jamaica", "Café de olla"]);
});

test("POST /pedidos calcula el total con los precios del servidor", async () => {
  const r = await pedir("/pedidos", { method: "POST", body: { lineas: [{ id: 1, cantidad: 2 }], propina: 10 } });
  assert.equal(r.status, 201);
  const pedido = await r.json();
  assert.equal(pedido.total, 40);
  assert.equal(pedido.estado, "recibido");
});

test("POST /pedidos rechaza un pedido vacío con 400", async () => {
  const r = await pedir("/pedidos", { method: "POST", body: { lineas: [] } });
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /al menos un platillo/);
});

test("PATCH /pedidos/:id/estado cambia el estado y valida el valor", async () => {
  const { id } = await (await pedir("/pedidos", { method: "POST", body: { lineas: [{ id: 5, cantidad: 1 }] } })).json();
  const cambiado = await (await pedir(`/pedidos/${id}/estado`, { method: "PATCH", body: { estado: "preparando" } })).json();
  assert.equal(cambiado.estado, "preparando");
  assert.equal((await pedir(`/pedidos/${id}/estado`, { method: "PATCH", body: { estado: "volando" } })).status, 400);
});

test("una ruta que no existe responde 404 en JSON", async () => {
  const r = await pedir("/postres-gratis");
  assert.equal(r.status, 404);
  assert.ok((await r.json()).error);
});
