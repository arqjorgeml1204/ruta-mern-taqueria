import { NavLink, Route, Routes } from "react-router";
import { useCarrito } from "./contexto/CarritoContext.jsx";
import { useSesion } from "./contexto/SesionContext.jsx";
import RutaProtegida from "./componentes/RutaProtegida.jsx";
import Menu from "./paginas/Menu.jsx";
import Pedido from "./paginas/Pedido.jsx";
import Entrar from "./paginas/Entrar.jsx";
import Panel from "./paginas/Panel.jsx";

// React Router: cada ruta es una página, sin recargar el navegador.
// Desde el módulo 6, /dueno es una ruta protegida: sin sesión de dueño, manda a /entrar.
export default function App() {
  const { piezas } = useCarrito();
  const { usuario, salir } = useSesion();
  return (
    <>
      <header className="cabecera">
        <div className="picado" aria-hidden="true" />
        <p className="sello">Cocina de casa · pide en línea</p>
        <h1>Restaurante en línea</h1>
        <nav className="navegacion" aria-label="Secciones">
          <NavLink to="/" end>Menú</NavLink>
          <NavLink to="/pedido">Tu pedido ({piezas})</NavLink>
          {usuario?.rol === "dueno" && <NavLink to="/dueno">Panel</NavLink>}
          {usuario
            ? <button type="button" className="enlace" onClick={salir}>Salir</button>
            : <NavLink to="/entrar">Entrar</NavLink>}
        </nav>
      </header>
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/pedido" element={<Pedido />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/dueno" element={<RutaProtegida rol="dueno"><Panel /></RutaProtegida>} />
          <Route path="*" element={<p className="estado">Esta página no existe.</p>} />
        </Routes>
      </main>
    </>
  );
}
