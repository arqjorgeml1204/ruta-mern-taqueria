import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSesion } from "../contexto/SesionContext.jsx";

// Formulario de login: manda correo y contraseña a /api/auth/login y guarda el token que regresa.
export default function Entrar() {
  const { entrar } = useSesion();
  const navegar = useNavigate();
  const { state } = useLocation();
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setEnviando(true);
    setError("");
    try {
      await entrar(datos.get("email"), datos.get("password"));
      navegar(state?.desde ?? "/dueno", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="pedido">
      <h2>Entrar</h2>
      <form className="formulario" onSubmit={enviar}>
        <label>Correo <input name="email" type="email" autoComplete="username" required /></label>
        <label>Contraseña <input name="password" type="password" autoComplete="current-password" required minLength={8} /></label>
        <button type="submit" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
        {error && <p className="aviso error" role="alert">{error}</p>}
      </form>
    </section>
  );
}
