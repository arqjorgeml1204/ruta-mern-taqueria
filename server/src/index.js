// Node: la cocina. Se conecta a la despensa (MongoDB) y luego deja el servidor escuchando pedidos.
// Las variables de entorno vienen de server/.env (node --env-file-if-exists=.env), nunca del código.
import { crearApp } from "./app.js";
import { conectar } from "./db.js";

const PUERTO = Number(process.env.PORT) || 4000;

const conexion = await conectar();
console.log(`MongoDB conectado: base «${conexion.name}»`);

crearApp().listen(PUERTO, () => {
  console.log(`API del restaurante en http://localhost:${PUERTO}/api/platillos`);
});
