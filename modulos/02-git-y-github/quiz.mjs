// quiz.mjs — la respuesta al quiz del módulo 2, en un repositorio de prueba.
// Pregunta: haces `git add menu.html` con el precio en $15, cambias el precio a $18 y haces `git commit`.
// ¿Qué precio quedó guardado en el commit?
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const carpeta = mkdtempSync(join(tmpdir(), "restaurante-quiz-"));
const git = (...args) => execFileSync("git", args, { cwd: carpeta, encoding: "utf8" }).trim();

try {
  git("init", "-q", "-b", "main");
  git("config", "user.name", "Restaurante en línea");
  git("config", "user.email", "practica@ejemplo.com");
  git("config", "core.autocrlf", "false");

  writeFileSync(join(carpeta, "menu.html"), "<p>Enchilada verde · $15</p>\n");
  git("add", "menu.html"); // la foto se toma AQUÍ
  writeFileSync(join(carpeta, "menu.html"), "<p>Enchilada verde · $18</p>\n");
  git("commit", "-q", "-m", "Precio de enchiladas");

  console.log("En el commit:   ", git("show", "HEAD:menu.html"));
  console.log("En tu carpeta:  ", readFileSync(join(carpeta, "menu.html"), "utf8").trim());
  console.log("git status:     ", git("status", "--short"));
  console.log("\nRespuesta B: $15. `git add` guarda el archivo como está en ese momento;");
  console.log("el cambio a $18 queda pendiente hasta que vuelvas a hacer `git add`.");
} finally {
  rmSync(carpeta, { recursive: true, force: true });
}
