import { Router } from "express";
import { leerMenu } from "./platillos.js";

export const ESTADOS = ["recibido", "preparando", "listo"];

// Un error con su código HTTP: el manejador de errores de app.js lo convierte en respuesta.
const errorHttp = (status, message) => Object.assign(new Error(message), { status });

// Validación: nunca se confía en lo que manda el cliente. El total se calcula aquí, con los precios del menú.
async function validarPedido(cuerpo) {
  const { lineas, propina = 0 } = cuerpo ?? {};
  if (!Array.isArray(lineas) || lineas.length === 0) throw errorHttp(400, "El pedido necesita al menos un platillo");
  if (typeof propina !== "number" || propina < 0) throw errorHttp(400, "La propina debe ser un número de 0 o más");
  const menu = await leerMenu();
  const detalle = lineas.map(({ id, cantidad }) => {
    const platillo = menu.find((p) => p.id === id);
    if (!platillo) throw errorHttp(400, `El platillo ${id} no existe`);
    if (!Number.isInteger(cantidad) || cantidad < 1) throw errorHttp(400, `Cantidad inválida para ${platillo.nombre}`);
    return { id, nombre: platillo.nombre, precio: platillo.precio, cantidad };
  });
  const subtotal = detalle.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
  return { lineas: detalle, subtotal, propina, total: subtotal + propina };
}

export function rutasPedidos() {
  const rutas = Router();
  const pedidos = []; // en memoria: se borran al apagar el servidor (el módulo 5 los guarda en MongoDB)
  let siguienteId = 1;

  rutas.get("/", (req, res) => res.json(pedidos));

  rutas.get("/:id", (req, res) => {
    const pedido = pedidos.find((p) => p.id === Number(req.params.id));
    if (!pedido) return res.status(404).json({ error: "Ese pedido no existe" });
    res.json(pedido);
  });

  // POST /api/pedidos  { "lineas": [{ "id": 1, "cantidad": 2 }], "propina": 10 }
  // Express 5 pasa al manejador de errores lo que lance una función async (sin try/catch).
  rutas.post("/", async (req, res) => {
    const datos = await validarPedido(req.body);
    const pedido = { id: siguienteId++, ...datos, estado: "recibido", creado: new Date().toISOString() };
    pedidos.push(pedido);
    res.status(201).json(pedido);
  });

  // PATCH /api/pedidos/1/estado  { "estado": "preparando" }
  rutas.patch("/:id/estado", (req, res) => {
    const pedido = pedidos.find((p) => p.id === Number(req.params.id));
    if (!pedido) return res.status(404).json({ error: "Ese pedido no existe" });
    if (!ESTADOS.includes(req.body?.estado)) throw errorHttp(400, `El estado debe ser: ${ESTADOS.join(", ")}`);
    pedido.estado = req.body.estado;
    res.json(pedido);
  });

  return rutas;
}
