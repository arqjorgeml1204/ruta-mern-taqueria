// Node: la cocina. Arranca el servidor y lo deja escuchando pedidos.
// Las variables de entorno vienen de server/.env (node --env-file-if-exists=.env), nunca del código.
import { crearApp } from "./app.js";

const PUERTO = Number(process.env.PORT) || 4000;

crearApp().listen(PUERTO, () => {
  console.log(`API del restaurante en http://localhost:${PUERTO}/api/platillos`);
});
