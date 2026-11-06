import mongoose from "mongoose";
import { Router } from "express";
import { Platillo } from "../modelos/Platillo.js";
import { Pedido, ESTADOS } from "../modelos/Pedido.js";

// Un error con su código HTTP: el manejador de errores de app.js lo convierte en respuesta.
const errorHttp = (status, message) => Object.assign(new Error(message), { status });

// Validación: nunca se confía en lo que manda el cliente. El total se calcula aquí, con los precios de la base.
async function validarPedido(cuerpo) {
  const { lineas, propina = 0 } = cuerpo ?? {};
  if (!Array.isArray(lineas) || lineas.length === 0) throw errorHttp(400, "El pedido necesita al menos un platillo");
  if (typeof propina !== "number" || propina < 0) throw errorHttp(400, "La propina debe ser un número de 0 o más");
  const ids = lineas.map((l) => l.id);
  if (!ids.every((id) => mongoose.isValidObjectId(id))) throw errorHttp(400, "Hay un platillo que no existe");
  const platillos = await Platillo.find({ _id: { $in: ids }, disponible: true });
  const detalle = lineas.map(({ id, cantidad }) => {
    const platillo = platillos.find((p) => p.id === id);
    if (!platillo) throw errorHttp(400, `El platillo ${id} no existe`);
    if (!Number.isInteger(cantidad) || cantidad < 1) throw errorHttp(400, `Cantidad inválida para ${platillo.nombre}`);
    return { platillo: platillo._id, nombre: platillo.nombre, precio: platillo.precio, cantidad };
  });
  const subtotal = detalle.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
  return { lineas: detalle, subtotal, propina, total: subtotal + propina };
}

export function rutasPedidos() {
  const rutas = Router();

  // los más nuevos primero
  rutas.get("/", async (req, res) => res.json(await Pedido.find().sort({ createdAt: -1 })));

  // Agregación: cuántos pedidos hay en cada estado y cuánto suman
  rutas.get("/resumen", async (req, res) => {
    const resumen = await Pedido.aggregate([
      { $group: { _id: "$estado", pedidos: { $sum: 1 }, total: { $sum: "$total" } } },
      { $project: { _id: 0, estado: "$_id", pedidos: 1, total: 1 } },
      { $sort: { estado: 1 } },
    ]);
    res.json(resumen);
  });

  rutas.get("/:id", async (req, res) => {
    const pedido = mongoose.isValidObjectId(req.params.id) ? await Pedido.findById(req.params.id).populate("lineas.platillo", "nombre categoria") : null;
    if (!pedido) return res.status(404).json({ error: "Ese pedido no existe" });
    res.json(pedido);
  });

  // POST /api/pedidos  { "lineas": [{ "id": "<id del platillo>", "cantidad": 2 }], "propina": 10 }
  rutas.post("/", async (req, res) => {
    const pedido = await Pedido.create(await validarPedido(req.body));
    res.status(201).json(pedido);
  });

  // PATCH /api/pedidos/:id/estado  { "estado": "preparando" }
  rutas.patch("/:id/estado", async (req, res) => {
    if (!ESTADOS.includes(req.body?.estado)) throw errorHttp(400, `El estado debe ser: ${ESTADOS.join(", ")}`);
    const pedido = mongoose.isValidObjectId(req.params.id)
      ? await Pedido.findByIdAndUpdate(req.params.id, { estado: req.body.estado }, { returnDocument: "after", runValidators: true })
      : null;
    if (!pedido) return res.status(404).json({ error: "Ese pedido no existe" });
    res.json(pedido);
  });

  return rutas;
}
