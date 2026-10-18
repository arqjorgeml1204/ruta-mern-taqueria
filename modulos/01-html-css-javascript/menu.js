// JavaScript: el comportamiento. Lee el menú, lo dibuja y suma el pedido.
const pesos = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

let menu = [];             // los platillos que llegan de platillos.json
const pedido = new Map();  // id del platillo → cantidad

const $ = (selector) => document.querySelector(selector);

// async/await: pedir el menú sin congelar la página.
// En el módulo 4 esta misma línea pedirá /api/platillos a Express.
async function cargarMenu() {
  try {
    const respuesta = await fetch("platillos.json");
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    menu = await respuesta.json();
    $("#estado").hidden = true;
    dibujarMenu("todas");
  } catch (error) {
    $("#estado").textContent = `No se pudo cargar el menú (${error.message}). Abre la página con: node servir.mjs`;
  }
}

// DOM: copiar el molde una vez por platillo y llenarlo
function dibujarMenu(categoria) {
  const lista = $("#platillos");
  lista.replaceChildren();
  const visibles = menu.filter((p) => categoria === "todas" || p.categoria === categoria);
  for (const platillo of visibles) {
    const tarjeta = $("#molde-platillo").content.cloneNode(true);
    tarjeta.querySelector(".emoji").textContent = platillo.emoji;
    tarjeta.querySelector(".nombre").textContent = platillo.nombre;
    tarjeta.querySelector(".descripcion").textContent = platillo.descripcion;
    tarjeta.querySelector(".precio").textContent = pesos.format(platillo.precio);
    tarjeta.querySelector(".agregar").addEventListener("click", () => agregar(platillo.id));
    lista.append(tarjeta);
  }
}

function agregar(id) {
  pedido.set(id, (pedido.get(id) ?? 0) + 1);
  dibujarPedido();
}

function quitar(id) {
  const cantidad = pedido.get(id) - 1;
  cantidad > 0 ? pedido.set(id, cantidad) : pedido.delete(id);
  dibujarPedido();
}

// El valor de un <input> SIEMPRE es texto: hay que convertirlo con Number()
// (ver el quiz del módulo: 45 + "10" da "4510").
function calcularTotal() {
  let subtotal = 0;
  for (const [id, cantidad] of pedido) {
    subtotal += menu.find((p) => p.id === id).precio * cantidad;
  }
  const propina = Number($("#propina").value) || 0;
  return subtotal + propina;
}

function dibujarPedido() {
  const lineas = $("#lineas");
  lineas.replaceChildren();
  for (const [id, cantidad] of pedido) {
    const platillo = menu.find((p) => p.id === id);
    const li = document.createElement("li");
    li.textContent = `${cantidad} × ${platillo.nombre}`;
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = "Quitar";
    boton.setAttribute("aria-label", `Quitar una ${platillo.nombre}`);
    boton.addEventListener("click", () => quitar(id));
    li.append(boton);
    lineas.append(li);
  }
  $("#total").textContent = pesos.format(calcularTotal());
}

// Eventos: los filtros, la propina y el botón de pedir
$(".filtros").addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-categoria]");
  if (!boton) return;
  for (const b of document.querySelectorAll(".filtros button")) b.setAttribute("aria-pressed", b === boton);
  dibujarMenu(boton.dataset.categoria);
});

$("#propina").addEventListener("input", dibujarPedido);

$("#form-pedido").addEventListener("submit", (evento) => {
  evento.preventDefault(); // sin servidor todavía: no recargamos la página
  if (pedido.size === 0) {
    $("#aviso").textContent = "Agrega al menos un platillo.";
    return;
  }
  const cuerpo = {
    platillos: [...pedido].map(([id, cantidad]) => ({ id, cantidad })),
    total: calcularTotal(),
  };
  // En el módulo 4 esto viaja a Express con fetch("/api/pedidos", { method: "POST", ... })
  console.log("Pedido listo para enviar:", JSON.stringify(cuerpo));
  $("#aviso").textContent = `Pedido listo: ${pesos.format(cuerpo.total)}. En el módulo 4 lo recibirá la cocina.`;
});

cargarMenu();
