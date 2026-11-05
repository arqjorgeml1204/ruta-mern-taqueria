# Restaurante en línea · Ruta MERN de Lumière Learning

Sistema de pedidos en línea para un restaurante, construido paso a paso con **MongoDB, Express, React y Node.js**.
Es el proyecto del curso gratuito **Ruta MERN**: [lumiereautomata.com/learning/mern](https://lumiereautomata.com/learning/mern/).

## Qué hace (al terminar el curso)
- Menú con fotos, búsqueda y filtros por categoría.
- Carrito y pedidos guardados en MongoDB.
- API REST con Express: rutas, validación y manejo de errores.
- Inicio de sesión con JWT y roles (cliente y dueño).
- Panel del dueño: alta de platillos y estados del pedido (recibido, preparando, listo).
- Publicado: React en Vercel, API en Render y base de datos en MongoDB Atlas.

## Estructura
```
modulos/   código de práctica de cada módulo (se ejecuta tal cual)
server/    API con Node.js y Express (módulo 4 en adelante)
client/    pantalla con React (módulo 3 en adelante)
```

## Módulo 0 · Qué es MERN
Requisito: Node.js LTS (`node -v` debe decir v22 o superior).

```bash
node modulos/00-que-es-mern/recorrido.mjs   # el viaje completo de un pedido, sin instalar nada
node modulos/00-que-es-mern/quiz.mjs        # la respuesta al quiz del módulo
```

## Módulo 1 · HTML, CSS y JavaScript
La página del menú: HTML semántico, CSS con Flexbox y Grid (se adapta al celular) y JavaScript que carga el menú con `fetch`, arma el pedido y suma el total.

```bash
node modulos/01-html-css-javascript/servir.mjs   # abre http://localhost:5500
node modulos/01-html-css-javascript/quiz.mjs     # la respuesta al quiz del módulo
```

## Módulo 2 · Git y GitHub
Control de versiones del menú: commits, `.gitignore` para los secretos, una rama para el menú de temporada y su fusión. La práctica crea un repositorio de prueba en una carpeta temporal y la borra al terminar (no toca este proyecto).
Requisito: Git instalado (`git --version`).

```bash
node modulos/02-git-y-github/practica.mjs   # commit, rama, merge y volver a una versión anterior
node modulos/02-git-y-github/quiz.mjs       # la respuesta al quiz del módulo
```
Este repositorio sigue el mismo flujo: cada módulo es una rama con su pull request.

## Módulo 3 · React
El mismo menú, ahora con React en `client/`: componentes con props, estado, eventos, listas, `useEffect`, `useRef`, un hook propio que carga el menú, React Router (páginas `/` y `/pedido`) y Context para compartir el carrito.

```bash
cd client
npm install                        # una sola vez
npm run dev                        # abre http://localhost:5173
cd ..
node modulos/03-react/quiz.mjs     # la respuesta al quiz del módulo
```

## Módulo 4 · Node.js y Express
La API en `server/`: rutas de platillos y pedidos, middleware, validación (el total lo calcula el servidor), manejo de errores y pruebas con `node --test`. Los pedidos viven en memoria; en el módulo 5 pasan a MongoDB. La app de React ya pide el menú y manda los pedidos a `/api` (Vite se los pasa a Express).

```bash
cd server
npm install                                # una sola vez
npm test                                   # 6 pruebas de la API
npm run dev                                # http://localhost:4000/api/platillos
# en otra terminal: cd client && npm run dev
node ../modulos/04-node-y-express/quiz.mjs # la respuesta al quiz del módulo
```

## Secretos
Las credenciales viven en `server/.env`, que **nunca** se sube (está en `.gitignore`).
Copia `server/.env.example` como `server/.env` y llena tus datos de MongoDB Atlas.
