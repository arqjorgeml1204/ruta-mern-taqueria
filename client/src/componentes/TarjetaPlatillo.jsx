import { pesos } from "./pesos.js";

// Componente: el molde de una tarjeta. Se escribe una vez y React lo repite por platillo.
// Props: los datos que recibe (el platillo y qué hacer al agregarlo).
export default function TarjetaPlatillo({ platillo, cantidad, onAgregar }) {
  return (
    <li className="platillo">
      <span className="emoji" aria-hidden="true">{platillo.emoji}</span>
      <h3>{platillo.nombre}</h3>
      <p className="descripcion">{platillo.descripcion}</p>
      <p className="precio">{pesos.format(platillo.precio)}</p>
      <button type="button" className="agregar" onClick={() => onAgregar(platillo)}>
        {/* Renderizado condicional: el texto cambia si ya está en el pedido */}
        {cantidad > 0 ? `Agregar otro (${cantidad})` : "Agregar"}
      </button>
    </li>
  );
}
