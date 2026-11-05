import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite: el servidor de desarrollo de React. Recarga la pantalla al guardar.
// proxy (módulo 4): lo que empiece con /api se lo pasa a Express en el puerto 4000.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:4000" } },
});
