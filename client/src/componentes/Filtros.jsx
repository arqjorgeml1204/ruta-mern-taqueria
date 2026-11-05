const CATEGORIAS = [
  ["todas", "Todo"],
  ["platos", "Platos"],
  ["bebidas", "Bebidas"],
  ["postres", "Postres"],
];

// Evento: el clic llama a onCambiar, y quien usa este componente decide qué hacer.
export default function Filtros({ actual, onCambiar }) {
  return (
    <nav className="filtros" aria-label="Categorías">
      {CATEGORIAS.map(([valor, texto]) => (
        <button
          key={valor}
          type="button"
          aria-pressed={actual === valor}
          onClick={() => onCambiar(valor)}
        >
          {texto}
        </button>
      ))}
    </nav>
  );
}
