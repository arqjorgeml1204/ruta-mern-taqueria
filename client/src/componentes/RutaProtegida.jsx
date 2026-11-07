import { Navigate, useLocation } from "react-router";
import { useSesion } from "../contexto/SesionContext.jsx";

// Ruta protegida: si no hay sesión, manda a /entrar (y recuerda a dónde ibas); si el rol no alcanza, lo dice.
// Es comodidad para la pantalla: la protección de verdad está en la API (soloRol en el servidor).
export default function RutaProtegida({ rol, children }) {
  const { usuario } = useSesion();
  const ubicacion = useLocation();
  if (!usuario) return <Navigate to="/entrar" replace state={{ desde: ubicacion.pathname }} />;
  if (rol && usuario.rol !== rol) return <p className="estado">Esta sección es solo para el dueño.</p>;
  return children;
}
