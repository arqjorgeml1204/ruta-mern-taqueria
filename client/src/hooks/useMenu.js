import { useEffect, useState } from "react";

// Hook personalizado: carga el menú una vez y avisa si está cargando o si falló.
// En el módulo 4 esta URL cambia por /api/platillos (Express).
export function useMenu(url = "/platillos.json") {
  const [platillos, setPlatillos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // useEffect: código que corre DESPUÉS de dibujar. El [url] dice: solo cuando cambie la URL.
  useEffect(() => {
    let vigente = true;
    fetch(url)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return respuesta.json();
      })
      .then((datos) => vigente && setPlatillos(datos))
      .catch((e) => vigente && setError(e.message))
      .finally(() => vigente && setCargando(false));
    return () => { vigente = false; }; // limpieza: si la pantalla se cierra antes, no se actualiza
  }, [url]);

  return { platillos, cargando, error };
}
