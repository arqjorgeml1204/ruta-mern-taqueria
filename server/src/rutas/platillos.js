import { readFile } from "node:fs/promises";
import { Router } from "express";

const ARCHIVO = new URL("../datos/platillos.json", import.meta.url);

// fs (sistema de archivos): por ahora el menú vive en un archivo; en el módulo 5 pasa a MongoDB.
export async function leerMenu() {
  return JSON.parse(await readFile(ARCHIVO, "utf8"));
}

export function rutasPlatillos() {
  const rutas = Router();

  // GET /api/platillos?categoria=bebidas
  rutas.get("/", async (req, res) => {
    const { categoria } = req.query;
    const menu = await leerMenu();
    res.json(categoria ? menu.filter((p) => p.categoria === categoria) : menu);
  });

  // GET /api/platillos/1
  rutas.get("/:id", async (req, res) => {
    const platillo = (await leerMenu()).find((p) => p.id === Number(req.params.id));
    if (!platillo) return res.status(404).json({ error: "Ese platillo no existe" });
    res.json(platillo);
  });

  return rutas;
}
