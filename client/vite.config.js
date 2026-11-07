import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite: el servidor de desarrollo de React. Recarga la pantalla al guardar.
// proxy (módulo 4): lo que empiece con /api se lo pasa a Express en el puerto 4000; desde el módulo 6, también las fotos (/uploads).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:4000", "/uploads": "http://localhost:4000" } },
});
