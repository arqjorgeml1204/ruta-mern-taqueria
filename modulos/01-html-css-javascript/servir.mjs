// servir.mjs — abre esta carpeta en http://localhost:5500 (solo Node, sin instalar nada).
// Hace falta porque el navegador no deja usar fetch() con archivos abiertos con doble clic (file://).
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const carpeta = fileURLToPath(new URL(".", import.meta.url));
const tipos = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json" };

const servidor = http.createServer(async (req, res) => {
  const ruta = new URL(req.url, "http://localhost").pathname;
  const archivo = normalize(join(carpeta, ruta === "/" ? "index.html" : ruta));
  if (!archivo.startsWith(carpeta)) { res.writeHead(403); return res.end(); }
  try {
    const contenido = await readFile(archivo);
    res.writeHead(200, { "Content-Type": tipos[extname(archivo)] ?? "application/octet-stream" });
    res.end(contenido);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("No encontrado");
  }
});

servidor.listen(5500, () => console.log("Menú abierto en http://localhost:5500"));
