// Crea (o actualiza) la cuenta del dueño con DUENO_EMAIL y DUENO_PASSWORD de server/.env.
// El registro público (/api/auth/registro) solo crea clientes: así nadie se hace dueño desde la app.
// Uso: npm run crear-dueno
import bcrypt from "bcryptjs";
import { conectar, desconectar } from "../src/db.js";
import { Usuario } from "../src/modelos/Usuario.js";

const { DUENO_EMAIL: email, DUENO_PASSWORD: password, DUENO_NOMBRE: nombre = "Dueño" } = process.env;
if (!email || !password || password.length < 8) {
  console.error("Pon DUENO_EMAIL y DUENO_PASSWORD (8 caracteres o más) en server/.env");
  process.exit(1);
}

const conexion = await conectar();
const hash = await bcrypt.hash(password, 10);
const resultado = await Usuario.updateOne({ email: email.toLowerCase().trim() }, { $set: { nombre, hash, rol: "dueno" } }, { upsert: true });
console.log(`Base «${conexion.name}»: cuenta del dueño ${resultado.upsertedCount ? "creada" : "actualizada"} (${email}).`);
await desconectar();
