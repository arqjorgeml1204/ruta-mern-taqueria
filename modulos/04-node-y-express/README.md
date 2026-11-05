# Módulo 4 · Node.js y Express: el servidor

La API vive en [`server/`](../../server). Node es la cocina; Express es el mesero que lleva cada pedido a su estación.

```bash
cd server
npm install        # una sola vez
npm test           # pruebas de la API (node --test)
npm run dev        # http://localhost:4000/api/platillos, se reinicia al guardar
```

| Ruta | Qué hace |
|---|---|
| `GET /api/platillos` | El menú (acepta `?categoria=bebidas`) |
| `GET /api/platillos/:id` | Un platillo, o 404 |
| `POST /api/pedidos` | Crea un pedido `{ lineas: [{ id, cantidad }], propina }`; el total lo calcula el servidor |
| `GET /api/pedidos` | Todos los pedidos |
| `PATCH /api/pedidos/:id/estado` | Cambia el estado: `recibido`, `preparando` o `listo` |

| Concepto | Dónde verlo |
|---|---|
| Módulos ESM (`import`/`export`) | todo `server/src` (`"type": "module"` en `package.json`) |
| Variables de entorno | `server/src/index.js` lee `PORT`; `npm start` carga `server/.env` con `--env-file-if-exists` |
| Sistema de archivos (`fs`) | `server/src/rutas/platillos.js` lee `datos/platillos.json` |
| Middleware y su orden | `server/src/app.js` (`express.json()` y el registro de cada petición) |
| Validación | `validarPedido` en `server/src/rutas/pedidos.js` |
| Manejo de errores | el último `app.use` de `app.js` (4 parámetros) |

Quiz del módulo (levanta Express de verdad y le manda el pedido):

```bash
node modulos/04-node-y-express/quiz.mjs
```
