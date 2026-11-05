// Express: el mesero. Recibe cada petición y la lleva a la ruta que la atiende.
import express from "express";
import { rutasPlatillos } from "./rutas/platillos.js";
import { rutasPedidos } from "./rutas/pedidos.js";

export function crearApp() {
  const app = express();

  // Middleware: corre ANTES de las rutas, en el orden en que se declara (ver el quiz del módulo).
  app.use(express.json()); // convierte el cuerpo JSON de la petición en req.body
  app.use((req, res, next) => {
    const inicio = Date.now();
    res.on("finish", () => {
      if (process.env.NODE_ENV !== "test") console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - inicio} ms)`);
    });
    next(); // sin next() la petición se queda esperando
  });

  app.get("/api/salud", (req, res) => res.json({ ok: true }));
  app.use("/api/platillos", rutasPlatillos());
  app.use("/api/pedidos", rutasPedidos());

  // 404: ninguna ruta respondió
  app.use((req, res) => res.status(404).json({ error: `No existe ${req.method} ${req.originalUrl}` }));

  // Manejo de errores: Express lo reconoce porque recibe 4 parámetros
  app.use((err, req, res, next) => {
    const estado = err.status ?? 500;
    if (estado === 500) console.error(err);
    res.status(estado).json({ error: estado === 500 ? "Error interno del servidor" : err.message });
  });

  return app;
}
