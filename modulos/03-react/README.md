# Módulo 3 · React: la pantalla que ve el cliente

La app de React vive en [`client/`](../../client). Es el mismo menú del módulo 1, ahora hecho con componentes.

```bash
cd client
npm install        # una sola vez
npm run dev        # abre http://localhost:5173
```

| Concepto | Dónde verlo |
|---|---|
| Componente y props | `client/src/componentes/TarjetaPlatillo.jsx` |
| Estado (`useState`) y eventos | `client/src/paginas/Menu.jsx` (búsqueda y filtros) |
| Renderizado condicional y listas con `key` | `Menu.jsx` y `Pedido.jsx` |
| `useEffect` y hook personalizado | `client/src/hooks/useMenu.js` |
| `useRef` | el botón «Borrar» del buscador devuelve el foco al input |
| React Router | `client/src/App.jsx` (páginas `/` y `/pedido`) |
| Context | `client/src/contexto/CarritoContext.jsx` |

Quiz del módulo (monta el componente con React y le da un clic):

```bash
node modulos/03-react/quiz.mjs
```
