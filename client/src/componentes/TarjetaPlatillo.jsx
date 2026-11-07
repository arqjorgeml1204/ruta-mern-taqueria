import { pesos } from "./pesos.js";

// Componente: el molde de una tarjeta. Se escribe una vez y React lo repite por platillo.
// Props: los datos que recibe (el platillo y qué hacer al agregarlo).
// Diseño (módulo 6): renglón de carta impresa, con puntos entre el nombre y el precio; --i escalona la entrada.
export default function TarjetaPlatillo({ platillo, cantidad, onAgregar, indice = 0 }) {
  return (
    <li className="platillo" style={{ "--i": indice }}>
      {/* si el dueño subió una foto, va la foto; si no, el emoji servido en un plato */}
      {platillo.foto
        ? <img className="foto" src={platillo.foto} alt={platillo.nombre} loading="lazy" />
        : <span className="plato" aria-hidden="true"><span className="emoji">{platillo.emoji}</span></span>}
      <div className="renglon">
        <h3>{platillo.nombre}</h3>
        <span className="puntos" aria-hidden="true" />
        <p className="precio">{pesos.format(platillo.precio)}</p>
      </div>
      <p className="descripcion">{platillo.descripcion}</p>
      <button type="button" className="agregar" onClick={() => onAgregar(platillo)}>
        {/* Renderizado condicional: el texto cambia si ya está en el pedido */}
        {cantidad > 0 ? `Agregar otro (${cantidad})` : "Agregar"}
      </button>
    </li>
  );
}
