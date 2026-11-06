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

  // Módulo 4: el pedido viaja a Express. Solo se mandan ids y cantidades; el total lo calcula el servidor.
  async function enviar(e) {
    e.preventDefault(); // que el formulario no recargue la página
    try {
      const respuesta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineas: lista.map((l) => ({ id: l.platillo.id, cantidad: l.cantidad })), propina }),
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error);
      // Desde el módulo 5 el id lo pone MongoDB (24 caracteres): al cliente le basta con los últimos 6.
      setAviso(`Pedido #${String(datos.id).slice(-6).toUpperCase()} recibido por ${pesos.format(datos.total)}. Estado: ${datos.estado}.`);
    } catch (error) {
      setAviso(`No se pudo enviar el pedido (${error.message}).`);
    }
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
