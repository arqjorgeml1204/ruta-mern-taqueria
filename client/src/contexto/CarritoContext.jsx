import { createContext, useContext, useState } from "react";

// Context: el carrito vive aquí y cualquier componente lo puede leer, sin pasarlo de mano en mano.
const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  // Estado: lo que la pantalla recuerda. id del platillo → { platillo, cantidad }
  const [lineas, setLineas] = useState({});

  // Se usa la forma con función (anterior => …) porque el nuevo valor depende del anterior.
  // Es justo el truco del quiz de este módulo.
  function agregar(platillo) {
    setLineas((anterior) => {
      const cantidad = (anterior[platillo.id]?.cantidad ?? 0) + 1;
      return { ...anterior, [platillo.id]: { platillo, cantidad } };
    });
  }

  function quitar(id) {
    setLineas((anterior) => {
      const { [id]: linea, ...resto } = anterior;
      if (!linea || linea.cantidad <= 1) return resto;
      return { ...resto, [id]: { ...linea, cantidad: linea.cantidad - 1 } };
    });
  }

  const lista = Object.values(lineas);
  const piezas = lista.reduce((suma, l) => suma + l.cantidad, 0);
  const subtotal = lista.reduce((suma, l) => suma + l.platillo.precio * l.cantidad, 0);

  return (
    <CarritoContext.Provider value={{ lista, piezas, subtotal, agregar, quitar }}>
      {children}
    </CarritoContext.Provider>
  );
}

// Hook personalizado para leer el carrito desde cualquier componente.
export function useCarrito() {
  const carrito = useContext(CarritoContext);
  if (!carrito) throw new Error("useCarrito necesita estar dentro de <CarritoProvider>");
  return carrito;
}
