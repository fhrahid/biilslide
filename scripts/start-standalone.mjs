import { cp, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";

await mkdir(".next/standalone/.next", { recursive: true });
await cp("public", ".next/standalone/public", { recursive: true, force: true });
await cp(".next/static", ".next/standalone/.next/static", { recursive: true, force: true });

const server = spawn(process.execPath, [".next/standalone/server.js"], {
  env: { ...process.env, HOSTNAME: "0.0.0.0", PORT: process.env.PORT || "3000" },
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}

server.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 0 : 1));
});
