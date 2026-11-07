# Guía de diseño · «Carta de fonda»

> Plus del curso Ruta MERN. No hace falta para que la app funcione, pero es lo que hace que alguien quiera usarla. Todo vive en `src/estilos.css`, con CSS puro (sin frameworks).

## 1. La idea en una frase

**Una fonda mexicana impresa en papel.** Cada decisión visual sale de ahí: el fondo color masa, la carta con puntos hasta el precio, el papel picado de la cabecera y las comandas perforadas del panel del dueño.

Antes de elegir colores, escribe tu frase. Si tu negocio es una barbería, quizá sea «un sillón clásico con letras de neón». La frase te dice qué sí y qué no.

## 2. Color: uno manda, uno actúa, el resto acompaña

| Variable | Valor | Para qué |
|---|---|---|
| `--masa` | `#f6ecdc` | Fondo de toda la app |
| `--papel` | `#fffaf1` | Tarjetas, la cuenta y las comandas |
| `--mole` | `#2a1710` | Texto principal |
| `--mole-suave` | `#6e5646` | Texto secundario (contraste 5.8:1 sobre el fondo) |
| `--terracota` | `#b5452a` | **Dominante**: títulos, precios, filtro activo |
| `--salsa` | `#1e6b45` | **Acento**: SOLO botones de acción (Agregar, Hacer pedido, Pasar a…) |
| `--cobalto` | `#1f4f8a` | Detalle de talavera en el borde de los platos |

La regla que más se nota: **el verde solo aparece donde se hace clic para avanzar**. Así el ojo encuentra la acción sin pensar. Si pintas de verde un título, el usuario ya no sabe qué es botón.

Todos los colores son variables en `:root`. Para cambiar la marca entera, cambias 7 líneas.

## 3. Tipografía: una con carácter, otra para leer

- **Fraunces** (títulos, precios): una serif suave con personalidad de carta impresa.
- **Instrument Sans** (texto): limpia y cómoda en pantallas pequeñas.

Se cargan desde Google Fonts en `index.html`. Evita usar la letra del sistema para los títulos: es lo primero que hace que una app parezca plantilla.

## 4. Espacio: todo en múltiplos de 4

`--e1: 4px` · `--e2: 8px` · `--e3: 12px` · `--e4: 16px` · `--e6: 24px` · `--e8: 32px` · `--e12: 48px`

Si dudas entre 14 y 18 px, usa 16. Repetir las mismas medidas es lo que hace que una pantalla se vea «ordenada» aunque nadie sepa explicar por qué.

## 5. Las tres piezas que se recuerdan

| Pieza | Cómo está hecha | Qué enseña |
|---|---|---|
| Papel picado (`.picado`) | Un `repeating-linear-gradient` de 5 colores recortado con `mask`: `conic-gradient` para los picos y `radial-gradient` para los agujeros | Las máscaras de CSS dibujan formas sin imágenes |
| Carta con puntos (`.renglon`) | `display: flex` y un `<span class="puntos">` con `flex: 1` y borde punteado entre el nombre y el precio | Flexbox para alinear como una carta real |
| Comanda perforada (`.pedido`, `.pedidos li`) | `mask` con medios círculos repetidos en el borde de arriba | El mismo truco, reutilizado para dar identidad |

## 6. Movimiento: poco y con intención

- Las tarjetas del menú entran una tras otra (`animation-delay: calc(var(--i) * 60ms)`).
- Al pasar el mouse, la tarjeta se levanta 4 px y gira apenas.
- Nada más. Y quien activó «reducir movimiento» en su sistema no ve animaciones (`prefers-reduced-motion`).

## 7. Accesibilidad: no es opcional

- Contraste mínimo 4.5:1 en texto normal. Medido en esta paleta: texto principal 14.6:1, secundario 5.8:1, precios en terracota 4.7:1, botones verdes 6.5:1 y etiquetas de estado de 4.9 a 5.6:1.
- Todo se puede usar con teclado; el foco se ve con un contorno ámbar de 3 px.
- Las imágenes llevan `alt` con el nombre del platillo; los adornos (papel picado, puntos, emoji del plato) llevan `aria-hidden="true"`.
- Los mensajes que cambian usan `role="status"` o `role="alert"` para que los lectores de pantalla los anuncien.

## 8. Adáptalo a tu negocio en 15 minutos

1. Escribe tu frase (paso 1).
2. Cambia los 7 colores de `:root`. Revisa el contraste en [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
3. Elige dos fuentes en [Google Fonts](https://fonts.google.com): una para títulos y otra para texto. Cambia el `<link>` de `index.html` y `--f-titulo` y `--f-texto`.
4. Cambia la pieza que se recuerda: el papel picado puede ser una franja de azulejos, un patrón de tela o lo que cuente tu frase.
5. Revisa la app en celular (375 px) y en escritorio. Sin scroll horizontal.
