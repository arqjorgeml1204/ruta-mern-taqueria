// recorrido.mjs — el viaje completo de un pedido, solo con Node (sin instalar nada).
// El servidor hace de Express + MongoDB; el fetch del final hace de React.
import http from "node:http";

const pedidos = []; // por ahora, la "despensa" vive en memoria

const servidor = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/pedidos") {
    let cuerpo = "";
    req.on("data", (trozo) => (cuerpo += trozo));
    req.on("end", () => {
      const pedido = { id: pedidos.length + 1, ...JSON.parse(cuerpo), estado: "recibido" };
      pedidos.push(pedido);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(pedido));
    });
    return;
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
});

servidor.listen(3000, async () => {
  console.log("Cocina abierta en http://localhost:3000");
  const respuesta = await fetch("http://localhost:3000/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platillo: "Tacos al pastor", cantidad: 3 }),
  });
  console.log(respuesta.status, await respuesta.json());
  servidor.close();
});
