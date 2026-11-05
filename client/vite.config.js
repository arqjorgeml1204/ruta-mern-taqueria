import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite: el servidor de desarrollo de React. Recarga la pantalla al guardar.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
