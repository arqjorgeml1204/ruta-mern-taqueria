// Quiz del módulo 4: el orden del middleware importa.
// Requisito: haber instalado el servidor una vez (cd server && npm install).
//
//   app.post("/api/pedidos", (req, res) => {
//     res.json({ recibido: req.body });
//   });
//   app.use(express.json());
//
// Mandas POST /api/pedidos con {"platillo":"enchiladas"}. ¿Qué responde el servidor?
import { createRequire } from "node:module";

const requerir = createRequire(new URL("../../server/package.json", import.meta.url));
const express = requerir("express");

async function probar(jsonAntes) {
  const app = express();
  if (jsonAntes) app.use(express.json());
  app.post("/api/pedidos", (req, res) => {
    res.json({ recibido: req.body });
  });
  if (!jsonAntes) app.use(express.json()); // el código del quiz: se declara DESPUÉS de la ruta
  const servidor = await new Promise((listo) => { const s = app.listen(0, () => listo(s)); });
  const r = await fetch(`http://localhost:${servidor.address().port}/api/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platillo: "enchiladas" }),
  });
  const texto = await r.text();
  servidor.close();
  return `${r.status} ${texto}`;
}

console.log(`Express ${requerir("express/package.json").version}`);
console.log(`Código del quiz (json después) → ${await probar(false)}`);
console.log(`Con express.json() antes       → ${await probar(true)}`);
console.log("Respuesta C: {}. La ruta respondió antes de que express.json() leyera el cuerpo: req.body es undefined y JSON.stringify quita esa propiedad.");
