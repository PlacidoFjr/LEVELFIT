import { spawnSync } from "node:child_process";

const maxAttempts = Number(process.env.DB_DEPLOY_ATTEMPTS ?? 6);
const waitMs = Number(process.env.DB_DEPLOY_RETRY_MS ?? 15000);

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function run(command, args) {
  return spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
}

let migrated = false;

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  console.log(`\n[db:deploy] Prisma migrate deploy tentativa ${attempt}/${maxAttempts}`);
  const result = run("npx", ["prisma", "migrate", "deploy"]);

  if (result.status === 0) {
    migrated = true;
    break;
  }

  if (attempt === maxAttempts) break;
  console.log(`[db:deploy] Migration ocupada ou lenta. Aguardando ${Math.round(waitMs / 1000)}s antes de tentar novamente...`);
  sleep(waitMs);
}

if (!migrated) {
  console.error("[db:deploy] Não foi possível aplicar migrations depois das tentativas.");
  process.exit(1);
}

console.log("\n[db:deploy] Migrations aplicadas. Seeds devem ser executados manualmente e fora do deploy de producao.");
process.exit(0);
