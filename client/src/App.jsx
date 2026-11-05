import { NavLink, Route, Routes } from "react-router";
import { useCarrito } from "./contexto/CarritoContext.jsx";
import Menu from "./paginas/Menu.jsx";
import Pedido from "./paginas/Pedido.jsx";

// React Router: cada ruta es una página, sin recargar el navegador.
export default function App() {
  const { piezas } = useCarrito();
  return (
    <>
      <header className="cabecera">
        <h1>Restaurante en línea</h1>
        <nav className="navegacion" aria-label="Secciones">
          <NavLink to="/" end>Menú</NavLink>
          <NavLink to="/pedido">Tu pedido ({piezas})</NavLink>
        </nav>
      </header>
      <main className="contenido">
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/pedido" element={<Pedido />} />
          <Route path="*" element={<p className="estado">Esta página no existe.</p>} />
        </Routes>
      </main>
    </>
  );
}
