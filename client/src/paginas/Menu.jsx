import { useRef, useState } from "react";
import Filtros from "../componentes/Filtros.jsx";
import TarjetaPlatillo from "../componentes/TarjetaPlatillo.jsx";
import { useCarrito } from "../contexto/CarritoContext.jsx";
import { useMenu } from "../hooks/useMenu.js";

export default function Menu() {
  const { platillos, cargando, error } = useMenu();
  const { lista, agregar } = useCarrito();
  const [categoria, setCategoria] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const buscador = useRef(null); // useRef: una referencia directa al <input> para darle el foco

  if (cargando) return <p className="estado">Cargando el menú…</p>;
  if (error) return <p className="estado">No se pudo cargar el menú ({error}).</p>;

  const texto = busqueda.trim().toLowerCase();
  const visibles = platillos.filter(
    (p) =>
      (categoria === "todas" || p.categoria === categoria) &&
      p.nombre.toLowerCase().includes(texto)
  );
  const cantidadDe = (id) => lista.find((l) => l.platillo.id === id)?.cantidad ?? 0;

  return (
    <section aria-labelledby="titulo-menu">
      <h2 id="titulo-menu">Menú</h2>
      <div className="busqueda">
        <label htmlFor="buscar">Buscar</label>
        <input
          id="buscar"
          ref={buscador}
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="enchilada, café…"
        />
        {busqueda && (
          <button type="button" onClick={() => { setBusqueda(""); buscador.current.focus(); }}>
            Borrar
          </button>
        )}
      </div>
      <Filtros actual={categoria} onCambiar={setCategoria} />
      {visibles.length === 0 ? (
        <p className="estado">No hay platillos con «{busqueda}».</p>
      ) : (
        <ul className="platillos">
          {/* Listas: cada elemento lleva una key única para que React sepa cuál es cuál */}
          {visibles.map((p, i) => (
            <TarjetaPlatillo key={p.id} platillo={p} indice={i} cantidad={cantidadDe(p.id)} onAgregar={agregar} />
          ))}
        </ul>
      )}
    </section>
  );
}
