// Pruebas de la API con el corredor de pruebas que trae Node (node --test).
// Desde el módulo 5 usan MongoDB: se conectan a la base de server/.env con «_test» al final del nombre
// (p. ej. restaurante_test), así nunca tocan los datos reales. Sin MONGODB_URI, se saltan.
// Desde el módulo 6 crean un dueño y un cliente de prueba, y guardan las fotos en una carpeta temporal.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET ||= "secreto-solo-para-pruebas";
process.env.UPLOADS_DIR = mkdtempSync(join(tmpdir(), "fotos-"));
// se importan después de fijar las variables: la carpeta de fotos se lee al cargar el módulo
const { crearApp } = await import("../src/app.js");
const { conectar, desconectar } = await import("../src/db.js");
const { Platillo } = await import("../src/modelos/Platillo.js");
const { Pedido } = await import("../src/modelos/Pedido.js");
const { Usuario } = await import("../src/modelos/Usuario.js");

const sinBase = !process.env.MONGODB_URI && "falta MONGODB_URI en server/.env";
let servidor, base, enchilada, cafe, tokenDueno, tokenCliente;

before(async () => {
  if (sinBase) return;
  await conectar({ dbName: `${process.env.MONGODB_DB || "restaurante"}_test` });
  await Promise.all([Platillo.deleteMany({}), Pedido.deleteMany({}), Usuario.deleteMany({})]); // solo la base de prueba
  [enchilada, cafe] = await Platillo.create([
    { nombre: "Enchilada verde", precio: 15, categoria: "platos" },
    { nombre: "Café de olla", precio: 30, categoria: "bebidas" },
  ]);
  await Usuario.registrar({ email: "dueno@prueba.test", password: "clave-del-dueno", rol: "dueno" });
  await new Promise((listo) => {
    servidor = crearApp().listen(0, () => { base = `http://localhost:${servidor.address().port}`; listo(); });
  });
  tokenDueno = (await (await pedir("/auth/login", { method: "POST", body: { email: "dueno@prueba.test", password: "clave-del-dueno" } })).json()).token;
  tokenCliente = (await (await pedir("/auth/registro", { method: "POST", body: { email: "cliente@prueba.test", password: "clave-del-cliente" } })).json()).token;
});
after(async () => {
  if (sinBase) return;
  servidor.close();
  await Promise.all([Platillo.deleteMany({}), Pedido.deleteMany({}), Usuario.deleteMany({})]);
  await desconectar();
  rmSync(process.env.UPLOADS_DIR, { recursive: true, force: true });
});

function pedir(ruta, { token, body, ...opciones } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  return fetch(`${base}/api${ruta}`, { ...opciones, headers, body: body instanceof FormData ? body : body && JSON.stringify(body) });
}

test("GET /platillos devuelve el menú de la base con «id»", { skip: sinBase }, async () => {
  const menu = await (await pedir("/platillos")).json();
  assert.equal(menu.length, 2);
  assert.ok(menu[0].id && !menu[0]._id);
});

test("GET /platillos filtra por categoría y busca por nombre", { skip: sinBase }, async () => {
  const bebidas = await (await pedir("/platillos?categoria=bebidas")).json();
  assert.deepEqual(bebidas.map((p) => p.nombre), ["Café de olla"]);
  const busqueda = await (await pedir("/platillos?q=ENCHI")).json();
  assert.deepEqual(busqueda.map((p) => p.nombre), ["Enchilada verde"]);
  assert.equal((await (await pedir("/platillos?q=.*")).json()).length, 0); // los símbolos se buscan como texto
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

test("login: contraseña mala → 401 sin decir qué falló; registro no repite correos ni acepta claves cortas", { skip: sinBase }, async () => {
  const r = await pedir("/auth/login", { method: "POST", body: { email: "dueno@prueba.test", password: "otra-cosa" } });
  assert.equal(r.status, 401);
  assert.equal((await r.json()).error, "Correo o contraseña incorrectos");
  assert.equal((await pedir("/auth/registro", { method: "POST", body: { email: "cliente@prueba.test", password: "12345678" } })).status, 409);
  assert.equal((await pedir("/auth/registro", { method: "POST", body: { email: "nuevo@prueba.test", password: "corta" } })).status, 400);
  const yo = await (await pedir("/auth/yo", { token: tokenDueno })).json();
  assert.equal(yo.rol, "dueno");
  assert.equal(yo.hash, undefined); // la contraseña nunca sale del servidor
});

test("los pedidos de todos: sin token 401, cliente 403, dueño 200 con páginas", { skip: sinBase }, async () => {
  assert.equal((await pedir("/pedidos")).status, 401);
  assert.equal((await pedir("/pedidos", { token: "token-inventado" })).status, 401);
  assert.equal((await pedir("/pedidos", { token: tokenCliente })).status, 403);
  await pedir("/pedidos", { method: "POST", body: { lineas: [{ id: cafe.id, cantidad: 1 }] } });
  const pagina1 = await (await pedir("/pedidos?limite=1", { token: tokenDueno })).json();
  assert.equal(pagina1.pedidos.length, 1);
  assert.equal(pagina1.total, 2);
  assert.equal(pagina1.paginas, 2);
  assert.equal(pagina1.pedidos[0].total, 30); // los más nuevos primero
});

test("PATCH /pedidos/:id/estado: solo el dueño, y valida el valor", { skip: sinBase }, async () => {
  const { id } = await (await pedir("/pedidos", { method: "POST", body: { lineas: [{ id: cafe.id, cantidad: 1 }] } })).json();
  assert.equal((await pedir(`/pedidos/${id}/estado`, { method: "PATCH", body: { estado: "listo" } })).status, 401);
  const cambiado = await (await pedir(`/pedidos/${id}/estado`, { method: "PATCH", token: tokenDueno, body: { estado: "preparando" } })).json();
  assert.equal(cambiado.estado, "preparando");
  assert.equal((await pedir(`/pedidos/${id}/estado`, { method: "PATCH", token: tokenDueno, body: { estado: "volando" } })).status, 400);
});

test("GET /pedidos/resumen agrupa por estado (solo el dueño)", { skip: sinBase }, async () => {
  assert.equal((await pedir("/pedidos/resumen", { token: tokenCliente })).status, 403);
  const resumen = await (await pedir("/pedidos/resumen", { token: tokenDueno })).json();
  assert.deepEqual(resumen.map((r) => r.estado), ["preparando", "recibido"]);
  assert.equal(resumen.find((r) => r.estado === "recibido").total, 70);
});

test("el dueño cambia precios con validación; el cliente no", { skip: sinBase }, async () => {
  assert.equal((await pedir(`/platillos/${cafe.id}`, { method: "PATCH", token: tokenCliente, body: { precio: 1 } })).status, 403);
  assert.equal((await pedir(`/platillos/${cafe.id}`, { method: "PATCH", token: tokenDueno, body: { precio: -5 } })).status, 400);
  const cambiado = await (await pedir(`/platillos/${cafe.id}`, { method: "PATCH", token: tokenDueno, body: { precio: 32 } })).json();
  assert.equal(cambiado.precio, 32);
  assert.equal(cambiado.nombre, "Café de olla"); // lo que no se mandó no cambia
});

test("fotos: el dueño sube un PNG y se sirve en /uploads; otro tipo de archivo → 400", { skip: sinBase }, async () => {
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
  const formulario = new FormData();
  formulario.append("foto", new Blob([png], { type: "image/png" }), "enchilada.png");
  const r = await pedir(`/platillos/${enchilada.id}/foto`, { method: "POST", token: tokenDueno, body: formulario });
  assert.equal(r.status, 200);
  const { foto } = await r.json();
  assert.match(foto, /^\/uploads\/.+\.png$/);
  const servida = await fetch(base + foto);
  assert.equal(servida.status, 200);
  assert.equal(servida.headers.get("content-type"), "image/png");

  const texto = new FormData();
  texto.append("foto", new Blob(["hola"], { type: "text/plain" }), "nota.txt");
  assert.equal((await pedir(`/platillos/${enchilada.id}/foto`, { method: "POST", token: tokenDueno, body: texto })).status, 400);
});

test("seguridad: Helmet pone sus encabezados y CORS solo permite el front", { skip: sinBase }, async () => {
  const r = await fetch(`${base}/api/salud`, { headers: { Origin: "http://localhost:5173" } });
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("access-control-allow-origin"), "http://localhost:5173");
  const ajeno = await fetch(`${base}/api/salud`, { headers: { Origin: "https://sitio-ajeno.example" } });
  assert.equal(ajeno.headers.get("access-control-allow-origin"), null);
});

test("una ruta que no existe responde 404 en JSON", { skip: sinBase }, async () => {
  const r = await pedir("/postres-gratis");
  assert.equal(r.status, 404);
  assert.ok((await r.json()).error);
});
