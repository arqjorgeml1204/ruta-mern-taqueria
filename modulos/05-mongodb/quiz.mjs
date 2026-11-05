// Quiz del módulo 5: las validaciones del esquema no corren solas en una actualización.
// Requisito: cd server && npm install, y server/.env con tus datos de MongoDB Atlas.
// Usa la base «<MONGODB_DB>_test» y borra lo que crea: no toca tus datos.
//
//   const esquema = new Schema({ precio: { type: Number, min: 0 } });
//   await Platillo.findByIdAndUpdate(id, { precio: -5 });
//
// La enchilada costaba $15. ¿Qué precio queda guardado?
//   A) -5   B) Error de validación   C) 0   D) 15
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const servidor = new URL("../../server/", import.meta.url);
const env = fileURLToPath(new URL(".env", servidor));
if (existsSync(env)) process.loadEnvFile(env);
const requerir = createRequire(new URL("package.json", servidor));
const mongoose = requerir("mongoose");
const { conectar, desconectar } = await import(new URL("src/db.js", servidor));

await conectar({ dbName: `${process.env.MONGODB_DB || "restaurante"}_test` });
const Quiz = mongoose.model("QuizPrecio", new mongoose.Schema({ nombre: String, precio: { type: Number, min: 0 } }));

const enchilada = await Quiz.create({ nombre: "Enchilada verde", precio: 15 });
await Quiz.findByIdAndUpdate(enchilada._id, { precio: -5 });
console.log(`Mongoose ${mongoose.version}`);
console.log(`Código del quiz             → precio guardado: ${(await Quiz.findById(enchilada._id)).precio}`);

await Quiz.findByIdAndUpdate(enchilada._id, { precio: 15 });
try {
  await Quiz.findByIdAndUpdate(enchilada._id, { precio: -5 }, { runValidators: true });
} catch (error) {
  console.log(`Con { runValidators: true } → ${error.name}: ${error.errors.precio.message}`);
}

await Quiz.deleteMany({}); // solo lo que creó este quiz
await desconectar();
console.log("Respuesta A: -5. Las validaciones del esquema corren al crear (create/save), pero en findByIdAndUpdate solo si pides runValidators: true.");
