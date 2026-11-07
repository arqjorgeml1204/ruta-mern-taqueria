// Express: el mesero. Recibe cada petición y la lleva a la ruta que la atiende.
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rutasAuth } from "./rutas/auth.js";
import { rutasPlatillos, CARPETA_FOTOS } from "./rutas/platillos.js";
import { rutasPedidos } from "./rutas/pedidos.js";

export function crearApp() {
  const app = express();

  // Seguridad (módulo 6):
  // Helmet agrega encabezados que cierran ataques comunes del navegador. «cross-origin» deja que la app de React,
  // publicada en otro dominio (módulo 7), muestre las fotos de /uploads.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  // CORS: qué sitios pueden llamar a la API desde el navegador. En desarrollo, Vite (5173); al publicar, la URL del front.
  const permitidos = (process.env.CLIENT_URL ?? "http://localhost:5173").split(",").map((u) => u.trim());
  app.use(cors({ origin: permitidos }));

  // Middleware: corre ANTES de las rutas, en el orden en que se declara (ver el quiz del módulo 4).
  app.use(express.json()); // convierte el cuerpo JSON de la petición en req.body
  app.use((req, res, next) => {
    const inicio = Date.now();
    res.on("finish", () => {
      if (process.env.NODE_ENV !== "test") console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - inicio} ms)`);
    });
    next(); // sin next() la petición se queda esperando
  });

  app.get("/api/salud", (req, res) => res.json({ ok: true }));
  app.use("/api/auth", rutasAuth());
  app.use("/api/platillos", rutasPlatillos());
  app.use("/api/pedidos", rutasPedidos());
  app.use("/uploads", express.static(CARPETA_FOTOS, { maxAge: "7d" })); // las fotos del menú

  // 404: ninguna ruta respondió
  app.use((req, res) => res.status(404).json({ error: `No existe ${req.method} ${req.originalUrl}` }));

  // Manejo de errores: Express lo reconoce porque recibe 4 parámetros
  app.use((err, req, res, next) => {
    // culpa de la petición (400): validación del esquema (módulo 5), id con otro formato o archivo que multer rechaza (módulo 6)
    const deLaPeticion = ["ValidationError", "CastError", "MulterError"].includes(err.name);
    const estado = err.status ?? (deLaPeticion ? 400 : 500);
    if (estado === 500) console.error(err);
    const mensaje = err.code === "LIMIT_FILE_SIZE" ? "La foto pesa más de 2 MB" : err.message;
    res.status(estado).json({ error: estado === 500 ? "Error interno del servidor" : mensaje });
  });

  return app;
}
