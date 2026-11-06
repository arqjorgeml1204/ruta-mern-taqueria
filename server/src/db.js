// MongoDB: la despensa. Mongoose abre la conexión una vez y la reutiliza en todas las rutas.
// La dirección y la contraseña vienen de server/.env (MONGODB_URI), nunca del código.
import dns from "node:dns";
import mongoose from "mongoose";

export async function conectar({ uri = process.env.MONGODB_URI, dbName = process.env.MONGODB_DB } = {}) {
  if (!uri) throw new Error("Falta MONGODB_URI en server/.env (copia server/.env.example y llena tus datos de Atlas)");
  try {
    await mongoose.connect(uri, { dbName });
  } catch (error) {
    // Las direcciones mongodb+srv:// se resuelven con una consulta DNS «SRV». Algunos módems y DNS locales no la
    // contestan (querySrv ECONNREFUSED): se reintenta una vez con DNS públicos.
    if (error.syscall !== "querySrv") throw error;
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    await mongoose.connect(uri, { dbName });
  }
  return mongoose.connection;
}

export const desconectar = () => mongoose.disconnect();
