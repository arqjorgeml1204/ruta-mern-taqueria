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

## Secretos
Las credenciales viven en `server/.env`, que **nunca** se sube (está en `.gitignore`).
Copia `server/.env.example` como `server/.env` y llena tus datos de MongoDB Atlas.
