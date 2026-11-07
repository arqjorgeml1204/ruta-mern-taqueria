import { mkdirSync } from "node:fs";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import multer from "multer";
import { Router } from "express";
import { Platillo } from "../modelos/Platillo.js";
import { soloRol } from "../auth.js";

const errorHttp = (status, message) => Object.assign(new Error(message), { status });
// para buscar texto que escribe el cliente dentro de una expresión regular sin que sus símbolos cambien la búsqueda
const escapar = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Fotos (módulo 6): multer recibe el archivo del formulario y lo guarda en server/uploads/.
// Solo imágenes JPG, PNG o WebP de hasta 2 MB; el nombre lo pone el servidor, nunca el usuario.
export const CARPETA_FOTOS = process.env.UPLOADS_DIR ?? fileURLToPath(new URL("../../uploads/", import.meta.url));
const TIPOS = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const subir = multer({
  storage: multer.diskStorage({
    destination: (req, archivo, listo) => { mkdirSync(CARPETA_FOTOS, { recursive: true }); listo(null, CARPETA_FOTOS); },
    filename: (req, archivo, listo) => listo(null, `${req.params.id}-${Date.now()}${TIPOS[archivo.mimetype] ?? extname(archivo.originalname)}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, archivo, listo) => (TIPOS[archivo.mimetype] ? listo(null, true) : listo(errorHttp(400, "La foto debe ser JPG, PNG o WebP"))),
});

// Desde el módulo 5 el menú vive en MongoDB (colección «platillos»); en el módulo 4 era un archivo.
export function rutasPlatillos() {
  const rutas = Router();

  // GET /api/platillos?categoria=bebidas&q=enchi  (búsqueda por nombre desde el módulo 6)
  rutas.get("/", async (req, res) => {
    const filtro = { disponible: true };
    if (req.query.categoria) filtro.categoria = String(req.query.categoria);
    if (req.query.q) filtro.nombre = { $regex: escapar(String(req.query.q)), $options: "i" };
    res.json(await Platillo.find(filtro).sort({ categoria: 1, precio: 1 }));
  });

  // GET /api/platillos/:id
  rutas.get("/:id", async (req, res) => {
    const platillo = mongoose.isValidObjectId(req.params.id) ? await Platillo.findById(req.params.id) : null;
    if (!platillo) return res.status(404).json({ error: "Ese platillo no existe" });
    res.json(platillo);
  });

  // Solo el dueño cambia el menú (módulo 6)
  rutas.post("/", soloRol("dueno"), async (req, res) => {
    const { nombre, descripcion, precio, categoria, emoji } = req.body ?? {};
    res.status(201).json(await Platillo.create({ nombre, descripcion, precio, categoria, emoji }));
  });

  rutas.patch("/:id", soloRol("dueno"), async (req, res) => {
    // solo los campos permitidos que sí vienen en la petición (nunca req.body completo: alguien podría mandar «foto» o «_id»)
    const cambios = Object.fromEntries(["nombre", "descripcion", "precio", "categoria", "emoji", "disponible"]
      .filter((campo) => req.body?.[campo] !== undefined).map((campo) => [campo, req.body[campo]]));
    const platillo = mongoose.isValidObjectId(req.params.id)
      ? await Platillo.findByIdAndUpdate(req.params.id, cambios, { returnDocument: "after", runValidators: true }) // runValidators: el quiz del módulo 5
      : null;
    if (!platillo) return res.status(404).json({ error: "Ese platillo no existe" });
    res.json(platillo);
  });

  // POST /api/platillos/:id/foto  (formulario multipart con el campo «foto»)
  rutas.post("/:id/foto", soloRol("dueno"), async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id) || !(await Platillo.exists({ _id: req.params.id }))) throw errorHttp(404, "Ese platillo no existe");
    next();
  }, subir.single("foto"), async (req, res) => {
    if (!req.file) throw errorHttp(400, "Falta la foto (campo «foto»)");
    res.json(await Platillo.findByIdAndUpdate(req.params.id, { foto: `/uploads/${req.file.filename}` }, { returnDocument: "after" }));
  });

  return rutas;
}
