import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { CarritoProvider } from "./contexto/CarritoContext.jsx";
import App from "./App.jsx";
import "./estilos.css";

// El punto de entrada: React toma el <div id="root"> y dibuja <App /> adentro.
// BrowserRouter da las páginas (/ y /pedido) y CarritoProvider comparte el carrito con todas.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CarritoProvider>
        <App />
      </CarritoProvider>
    </BrowserRouter>
  </StrictMode>
);
