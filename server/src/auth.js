// Autenticación (¿quién eres?) y autorización (¿qué puedes hacer?) con JWT: el gafete digital.
// Al entrar, el servidor firma un token con el id y el rol; el cliente lo manda en cada petición
// (Authorization: Bearer <token>) y el servidor comprueba la firma con JWT_SECRET, que vive en .env.
import jwt from "jsonwebtoken";

const errorHttp = (status, message) => Object.assign(new Error(message), { status });

function secreto() {
  if (!process.env.JWT_SECRET) throw new Error("Falta JWT_SECRET en server/.env");
  return process.env.JWT_SECRET;
}

export const firmarToken = (usuario) => jwt.sign({ sub: usuario.id, rol: usuario.rol }, secreto(), { expiresIn: "8h" });

// Middleware: deja pasar solo si el token es válido y no ha caducado.
export function requiereLogin(req, res, next) {
  const [tipo, token] = (req.get("Authorization") ?? "").split(" ");
  if (tipo !== "Bearer" || !token) throw errorHttp(401, "Inicia sesión para continuar");
  try {
    const { sub, rol } = jwt.verify(token, secreto());
    req.usuario = { id: sub, rol };
  } catch {
    throw errorHttp(401, "Tu sesión no es válida o ya caducó");
  }
  next();
}

// Middleware: además del login, pide uno de estos roles. 401 = no sé quién eres; 403 = sé quién eres y no puedes.
export const soloRol = (...roles) => [
  requiereLogin,
  (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) throw errorHttp(403, "No tienes permiso para esto");
    next();
  },
];
