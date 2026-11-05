// Quiz del módulo 3: se monta el componente de verdad con React y se le da UN clic.
// Requisito: haber instalado la app una vez (cd client && npm install).
//
//   function agregarTres() {
//     setCantidad(cantidad + 1);
//     setCantidad(cantidad + 1);
//     setCantidad(cantidad + 1);
//   }
//
// ¿Cuántas enchiladas marca el carrito después del clic?
import { createRequire } from "node:module";

const requerir = createRequire(new URL("../../client/package.json", import.meta.url));
const { JSDOM } = requerir("jsdom");

// Una página falsa para que React tenga dónde dibujar (sin abrir el navegador)
const { window } = new JSDOM("<!doctype html><div id='root'></div>");
globalThis.window = window;
globalThis.document = window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = requerir("react");
const { createRoot } = requerir("react-dom/client");
const { act, createElement: h, useState } = React;

function Carrito({ conFuncion }) {
  const [cantidad, setCantidad] = useState(0);
  function agregarTres() {
    if (conFuncion) {
      // La forma correcta: cada llamada recibe el valor más nuevo
      setCantidad((anterior) => anterior + 1);
      setCantidad((anterior) => anterior + 1);
      setCantidad((anterior) => anterior + 1);
    } else {
      // El código del quiz: las tres líneas leen la MISMA cantidad (0)
      setCantidad(cantidad + 1);
      setCantidad(cantidad + 1);
      setCantidad(cantidad + 1);
    }
  }
  return h("button", { onClick: agregarTres }, `Enchiladas: ${cantidad}`);
}

async function unClic(conFuncion) {
  const contenedor = document.createElement("div");
  const raiz = createRoot(contenedor);
  await act(() => raiz.render(h(Carrito, { conFuncion })));
  const boton = contenedor.querySelector("button");
  await act(() => boton.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
  const texto = boton.textContent;
  await act(() => raiz.unmount());
  return texto;
}

console.log(`React ${React.version}`);
console.log(`Código del quiz      → ${await unClic(false)}`);
console.log(`Con (anterior) => +1 → ${await unClic(true)}`);
console.log("Respuesta B: 1. Las tres líneas usan la misma «foto» de cantidad (0), así que las tres piden 0 + 1.");
