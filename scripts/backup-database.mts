import { DatabaseSync } from "node:sqlite";
import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [mode = "backup", inputPath, outputPath] = process.argv.slice(2);
if (!["backup", "restore"].includes(mode)) throw new Error("Use backup [destination] or restore <backup> <new-database-path>");
if (mode === "restore" && (!inputPath || !outputPath)) throw new Error("Restore requires a backup and a NEW destination. Stop the server before switching DATABASE_PATH.");
const source = resolve(mode === "backup" ? process.env.DATABASE_PATH || "data/wishes.sqlite" : inputPath!);
const destination = resolve(mode === "backup" ? inputPath || `data/backups/wishes-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite` : outputPath!);
if (!existsSync(source)) throw new Error("Source database does not exist.");
if (existsSync(destination)) throw new Error("Destination already exists; refusing to overwrite data.");
mkdirSync(dirname(destination), { recursive: true });
const database = new DatabaseSync(source, { readOnly: true });
try {
  const check = database.prepare("PRAGMA quick_check").get() as { quick_check: string };
  if (check.quick_check !== "ok") throw new Error("Source database integrity check failed.");
  database.prepare("VACUUM INTO ?").run(destination);
  const snapshot = new DatabaseSync(destination, { readOnly: true });
  try {
    const verified = snapshot.prepare("PRAGMA quick_check").get() as { quick_check: string };
    if (verified.quick_check !== "ok") throw new Error("Snapshot integrity check failed; do not use this snapshot.");
  } finally { snapshot.close(); }
  console.log(`${mode === "restore" ? "Restored" : "Backup created"}: ${destination}`);
} finally { database.close(); }
