// Siembra el menú en MongoDB: lee src/datos/platillos.json y crea o actualiza cada platillo por su nombre.
// Se puede correr las veces que quieras; no duplica. Uso: npm run sembrar
import { readFile } from "node:fs/promises";
import { conectar, desconectar } from "../src/db.js";
import { Platillo } from "../src/modelos/Platillo.js";

const menu = JSON.parse(await readFile(new URL("../src/datos/platillos.json", import.meta.url), "utf8"));
const conexion = await conectar();

const operaciones = menu.map(({ id, ...platillo }) => ({
  updateOne: { filter: { nombre: platillo.nombre }, update: { $set: platillo }, upsert: true },
}));
const resultado = await Platillo.bulkWrite(operaciones);
console.log(`Base «${conexion.name}»: ${resultado.upsertedCount} platillos nuevos, ${resultado.modifiedCount} actualizados, ${await Platillo.countDocuments()} en total.`);

await desconectar();
