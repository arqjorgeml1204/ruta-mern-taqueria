import mongoose from "mongoose";
import { Router } from "express";
import { Platillo } from "../modelos/Platillo.js";

// Desde el módulo 5 el menú vive en MongoDB (colección «platillos»); en el módulo 4 era un archivo.
export function rutasPlatillos() {
  const rutas = Router();

  // GET /api/platillos?categoria=bebidas
  rutas.get("/", async (req, res) => {
    const filtro = { disponible: true };
    if (req.query.categoria) filtro.categoria = String(req.query.categoria);
    res.json(await Platillo.find(filtro).sort({ categoria: 1, precio: 1 }));
  });

  // GET /api/platillos/:id
  rutas.get("/:id", async (req, res) => {
    const platillo = mongoose.isValidObjectId(req.params.id) ? await Platillo.findById(req.params.id) : null;
    if (!platillo) return res.status(404).json({ error: "Ese platillo no existe" });
    res.json(platillo);
  });

  return rutas;
}
