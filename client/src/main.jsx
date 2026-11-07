import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { CarritoProvider } from "./contexto/CarritoContext.jsx";
import { SesionProvider } from "./contexto/SesionContext.jsx";
import App from "./App.jsx";
import "./estilos.css";

// El punto de entrada: React toma el <div id="root"> y dibuja <App /> adentro.
// BrowserRouter da las páginas, SesionProvider la sesión del dueño (módulo 6) y CarritoProvider el carrito.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider>
        <CarritoProvider>
          <App />
        </CarritoProvider>
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>
);
