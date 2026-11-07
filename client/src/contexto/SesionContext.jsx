import { createContext, useCallback, useContext, useMemo, useState } from "react";

// Sesión (módulo 6): el token JWT y quién entró, compartidos con toda la app.
// Se guarda en localStorage para no pedir la contraseña en cada recarga. Ojo: cualquier script de la página
// puede leer localStorage; por eso la API nunca confía en el rol que diga el cliente: lo saca del token firmado.
const SesionContext = createContext(null);
const CLAVE = "restaurante.sesion";

// El token trae su fecha de caducidad («exp», en segundos) en la parte del medio, que es JSON en base64.
// Si ya caducó, no se usa: así la barra no muestra «Panel» con una sesión vencida.
function leerGuardada() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE));
    const { exp } = JSON.parse(atob(sesion.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (exp * 1000 > Date.now()) return sesion;
  } catch { /* no había sesión o estaba dañada */ }
  localStorage.removeItem(CLAVE);
  return null;
}

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(leerGuardada);

  const entrar = useCallback(async (email, password) => {
    const respuesta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error);
    localStorage.setItem(CLAVE, JSON.stringify(datos));
    setSesion(datos);
    return datos.usuario;
  }, []);

  const salir = useCallback(() => {
    localStorage.removeItem(CLAVE);
    setSesion(null);
  }, []);

  // fetch con el gafete: agrega «Authorization: Bearer <token>»; si el token ya no sirve (401), cierra la sesión
  const api = useCallback(async (ruta, opciones = {}) => {
    const headers = { ...opciones.headers, Authorization: `Bearer ${sesion?.token}` };
    if (opciones.body && !(opciones.body instanceof FormData)) headers["Content-Type"] = "application/json";
    const respuesta = await fetch(ruta, { ...opciones, headers });
    const datos = await respuesta.json();
    if (respuesta.status === 401) salir();
    if (!respuesta.ok) throw new Error(datos.error);
    return datos;
  }, [sesion, salir]);

  const valor = useMemo(() => ({ usuario: sesion?.usuario ?? null, entrar, salir, api }), [sesion, entrar, salir, api]);
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export const useSesion = () => useContext(SesionContext);
