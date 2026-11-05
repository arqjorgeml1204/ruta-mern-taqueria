import { useState } from "react";
import { Link } from "react-router";
import { pesos } from "../componentes/pesos.js";
import { useCarrito } from "../contexto/CarritoContext.jsx";

export default function Pedido() {
  const { lista, subtotal, agregar, quitar } = useCarrito();
  const [propina, setPropina] = useState(0);
  const [aviso, setAviso] = useState("");

  if (lista.length === 0) {
    return (
      <section className="pedido">
        <h2>Tu pedido</h2>
        <p className="estado">Tu pedido está vacío. <Link to="/">Ve al menú</Link></p>
      </section>
    );
  }

  const total = subtotal + propina;

  function enviar(e) {
    e.preventDefault(); // que el formulario no recargue la página
    // En el módulo 4 esto se manda con fetch a POST /api/pedidos.
    setAviso(`Pedido listo por ${pesos.format(total)}. En el módulo 4 lo recibe el servidor.`);
  }

  return (
    <section className="pedido" aria-labelledby="titulo-pedido">
      <h2 id="titulo-pedido">Tu pedido</h2>
      <ul className="lineas">
        {lista.map(({ platillo, cantidad }) => (
          <li key={platillo.id}>
            <span>{cantidad} × {platillo.nombre}</span>
            <span>{pesos.format(platillo.precio * cantidad)}</span>
            <span className="botones">
              <button type="button" aria-label={`Quitar ${platillo.nombre}`} onClick={() => quitar(platillo.id)}>−</button>
              <button type="button" aria-label={`Agregar ${platillo.nombre}`} onClick={() => agregar(platillo)}>+</button>
            </span>
          </li>
        ))}
      </ul>
      <form onSubmit={enviar}>
        <label htmlFor="propina">Propina (MXN)</label>
        {/* Number(): el valor de un input siempre llega como texto (quiz del módulo 1) */}
        <input
          id="propina"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={propina}
          onChange={(e) => setPropina(Number(e.target.value) || 0)}
        />
        <p className="total">Total: <strong>{pesos.format(total)}</strong></p>
        <button type="submit">Hacer pedido</button>
      </form>
      {aviso && <p className="aviso" role="status">{aviso}</p>}
    </section>
  );
}
