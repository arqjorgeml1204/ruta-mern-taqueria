// practica.mjs — el flujo de Git del módulo 2 en un repositorio de prueba (no toca tu proyecto).
// Crea una carpeta temporal, versiona el menú del restaurante, prueba un cambio en una rama y lo fusiona.
// Requisito: Git instalado (`git --version`). Se ejecuta con: node modulos/02-git-y-github/practica.mjs
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const carpeta = mkdtempSync(join(tmpdir(), "restaurante-git-"));
const git = (...args) => execFileSync("git", args, { cwd: carpeta, encoding: "utf8" }).trim();
const paso = (titulo, salida) => console.log(`\n▸ ${titulo}${salida ? `\n${salida}` : ""}`);
const menu = (...platillos) => `<main>\n${platillos.map((p) => `  <p>${p}</p>`).join("\n")}\n</main>\n`;

try {
  git("init", "-q", "-b", "main");
  // identidad solo para este repositorio de prueba (no cambia tu configuración global)
  git("config", "user.name", "Restaurante en línea");
  git("config", "user.email", "practica@ejemplo.com");
  git("config", "core.autocrlf", "false");

  // 1 · la primera foto (commit) del menú
  writeFileSync(join(carpeta, "menu.html"), menu("Enchilada verde · $15"));
  git("add", "menu.html");
  git("commit", "-q", "-m", "Agregué las enchiladas");
  paso("Primer commit", git("log", "--oneline"));

  // 2 · los secretos no se suben: .gitignore antes del primer `git add .`
  writeFileSync(join(carpeta, ".env"), "MONGODB_URI=mongodb+srv://usuario:contraseña@cluster\n");
  writeFileSync(join(carpeta, ".gitignore"), ".env\n");
  git("add", ".");
  git("commit", "-q", "-m", "Ignoro el archivo de secretos");
  paso("Archivos que Git guarda (el .env no aparece)", git("ls-files"));

  // 3 · una rama para probar el menú de temporada sin tocar el de los clientes
  git("switch", "-q", "-c", "menu-temporada");
  writeFileSync(join(carpeta, "menu.html"), menu("Enchilada verde · $15", "Chiles en nogada · $120"));
  git("commit", "-q", "-am", "Menú de temporada: chiles en nogada");
  git("switch", "-q", "main");
  paso("En main el menú de los clientes sigue igual", git("show", "HEAD:menu.html"));

  // 4 · salió bien: se fusiona (en GitHub esto es el botón «Merge pull request»)
  git("merge", "-q", "--no-ff", "-m", "Merge: menú de temporada", "menu-temporada");
  paso("Historial después de fusionar", git("log", "--oneline", "--graph"));
  paso("Menú final", git("show", "HEAD:menu.html"));

  // 5 · volver a cualquier foto: el menú tal como estaba en el primer commit
  const primero = git("rev-list", "--max-parents=0", "HEAD");
  paso("El menú en el primer commit", git("show", `${primero}:menu.html`));
} finally {
  rmSync(carpeta, { recursive: true, force: true });
}
