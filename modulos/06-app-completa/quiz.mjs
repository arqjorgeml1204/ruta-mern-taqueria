// Quiz del módulo 6: un JWT está FIRMADO, no cifrado.
// Requisito: cd server && npm install. No usa la base de datos ni tu .env.
//
//   const token = jwt.sign({ rol: "dueno" }, "mi-secreto-largo");
//   const medio = token.split(".")[1];
//   console.log(JSON.parse(atob(medio)).rol);
//
// ¿Qué imprime?  A) texto cifrado ilegible   B) dueno   C) Error: falta el secreto   D) undefined
import { createRequire } from "node:module";

const requerir = createRequire(new URL("../../server/package.json", import.meta.url));
const jwt = requerir("jsonwebtoken");

const token = jwt.sign({ rol: "dueno" }, "mi-secreto-largo");
const medio = token.split(".")[1];
console.log(`jsonwebtoken ${requerir("jsonwebtoken/package.json").version}`);
console.log(`Código del quiz → ${JSON.parse(atob(medio)).rol}`);

// lo que SÍ protege la firma: si alguien cambia el rol, el servidor lo detecta
const falso = [token.split(".")[0], btoa(JSON.stringify({ rol: "dueno", nombre: "intruso" })).replace(/=+$/, ""), token.split(".")[2]].join(".");
try {
  jwt.verify(falso, "mi-secreto-largo");
} catch (error) {
  console.log(`Token alterado    → ${error.name}: ${error.message}`);
}
console.log("Respuesta B: dueno. La parte del medio de un JWT es JSON en base64: cualquiera la lee. La firma no lo oculta, solo impide cambiarlo. Nunca guardes contraseñas ni datos privados en un token.");
