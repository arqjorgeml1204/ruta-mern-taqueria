import { Router } from "express";
import { Usuario } from "../modelos/Usuario.js";
import { firmarToken, requiereLogin } from "../auth.js";

export function rutasAuth() {
  const rutas = Router();

  // POST /api/auth/registro  { nombre, email, password } → siempre crea clientes; el dueño se crea con npm run crear-dueno
  rutas.post("/registro", async (req, res) => {
    const { nombre, email, password } = req.body ?? {};
    if (await Usuario.exists({ email: String(email ?? "").toLowerCase().trim() })) return res.status(409).json({ error: "Ese correo ya tiene cuenta" });
    const usuario = await Usuario.registrar({ nombre, email, password });
    res.status(201).json({ token: firmarToken(usuario), usuario });
  });

  // POST /api/auth/login  { email, password }
  rutas.post("/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    const usuario = await Usuario.findOne({ email: String(email ?? "").toLowerCase().trim() }).select("+hash");
    // mismo mensaje si el correo no existe o la contraseña está mal: no le digas a un intruso cuál acertó
    if (!usuario || !(await usuario.comparar(password))) return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    res.json({ token: firmarToken(usuario), usuario });
  });

  // GET /api/auth/yo → quién soy según mi token
  rutas.get("/yo", requiereLogin, async (req, res) => {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) return res.status(401).json({ error: "Tu cuenta ya no existe" });
    res.json(usuario);
  });

  return rutas;
}
