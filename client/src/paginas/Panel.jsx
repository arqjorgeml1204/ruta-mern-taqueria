import { useCallback, useEffect, useState } from "react";
import { useSesion } from "../contexto/SesionContext.jsx";
import { useMenu } from "../hooks/useMenu.js";
import { pesos } from "../componentes/pesos.js";

const ESTADOS = ["recibido", "preparando", "listo"];
const SIGUIENTE = { recibido: "preparando", preparando: "listo" };
const hora = (fecha) => new Date(fecha).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

// Panel del dueño (módulo 6): todo lo que se ve aquí sale de rutas que la API protege con el rol «dueno».
export default function Panel() {
  const { api } = useSesion();
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState({ pedidos: [], total: 0, paginas: 1 });
  const [resumen, setResumen] = useState([]);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      const filtro = estado ? `&estado=${estado}` : "";
      const [lista, porEstado] = await Promise.all([api(`/api/pedidos?pagina=${pagina}&limite=5${filtro}`), api("/api/pedidos/resumen")]);
      setDatos(lista);
      setResumen(porEstado);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, [api, estado, pagina]);

  // «en vivo»: vuelve a pedir la lista cada 10 segundos mientras el panel está abierto
  useEffect(() => {
    cargar();
    const reloj = setInterval(cargar, 10_000);
    return () => clearInterval(reloj);
  }, [cargar]);

  async function avanzar(pedido) {
    await api(`/api/pedidos/${pedido.id}/estado`, { method: "PATCH", body: JSON.stringify({ estado: SIGUIENTE[pedido.estado] }) });
    cargar();
  }

  const filtrar = (nuevo) => { setEstado(nuevo); setPagina(1); };

  return (
    <section className="panel" aria-labelledby="titulo-panel">
      <h2 id="titulo-panel">Pedidos</h2>
      <ul className="resumen">
        {ESTADOS.map((e) => {
          const fila = resumen.find((r) => r.estado === e);
          return <li key={e}><strong>{fila?.pedidos ?? 0}</strong> {e} · {pesos.format(fila?.total ?? 0)}</li>;
        })}
      </ul>
      <div className="filtros" role="group" aria-label="Filtrar por estado">
        {["", ...ESTADOS].map((e) => (
          <button key={e || "todos"} type="button" aria-pressed={estado === e} onClick={() => filtrar(e)}>{e || "Todos"}</button>
        ))}
      </div>
      {error && <p className="aviso error" role="alert">{error}</p>}
      {datos.pedidos.length === 0 ? <p className="estado">No hay pedidos {estado && `en «${estado}»`}.</p> : (
        <ul className="pedidos">
          {datos.pedidos.map((p) => (
            <li key={p.id}>
              <div className="cabeza-pedido">
                <strong>#{p.id.slice(-6).toUpperCase()}</strong>
                <span>{hora(p.createdAt)}</span>
                <span className={`etiqueta ${p.estado}`}>{p.estado}</span>
              </div>
              <p>{p.lineas.map((l) => `${l.cantidad} × ${l.nombre}`).join(", ")}</p>
              <div className="pie-pedido">
                <strong>{pesos.format(p.total)}</strong>
                {SIGUIENTE[p.estado] && <button type="button" onClick={() => avanzar(p)}>Pasar a {SIGUIENTE[p.estado]}</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
      <nav className="paginas" aria-label="Páginas">
        <button type="button" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
        <span>Página {datos.pagina ?? pagina} de {datos.paginas}</span>
        <button type="button" disabled={pagina >= datos.paginas} onClick={() => setPagina(pagina + 1)}>Siguiente</button>
      </nav>
      <Fotos />
    </section>
  );
}

// Subir la foto de cada platillo: un formulario multipart con el campo «foto» (multer en el servidor).
function Fotos() {
  const { api } = useSesion();
  const [version, setVersion] = useState(0);
  const { platillos } = useMenu(`/api/platillos?v=${version}`);
  const [aviso, setAviso] = useState("");

  async function subir(platillo, archivo) {
    if (!archivo) return;
    const formulario = new FormData();
    formulario.append("foto", archivo);
    try {
      await api(`/api/platillos/${platillo.id}/foto`, { method: "POST", body: formulario });
      setAviso(`Foto de ${platillo.nombre} guardada.`);
      setVersion((v) => v + 1);
    } catch (e) {
      setAviso(`No se pudo subir la foto (${e.message}).`);
    }
  }

  return (
    <section aria-labelledby="titulo-fotos">
      <h2 id="titulo-fotos">Fotos del menú</h2>
      <ul className="fotos">
        {platillos.map((p) => (
          <li key={p.id}>
            {p.foto ? <img src={p.foto} alt={p.nombre} /> : <span className="emoji" aria-hidden="true">{p.emoji}</span>}
            <span>{p.nombre}</span>
            <label className="subir">
              Subir foto
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => subir(p, e.target.files[0])} />
            </label>
          </li>
        ))}
      </ul>
      {aviso && <p className="aviso" role="status">{aviso}</p>}
    </section>
  );
}
