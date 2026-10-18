import { copyFile, mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { createPhotoPreviews, supportedPhotoExtensions } from "../app/lib/photoProcessing.ts";

const project = process.cwd();
const originalDirectory = join(project, "public", "photos", "originals");
const previewDirectory = join(project, "public", "photos", "previews");
const thumbnailDirectory = join(project, "public", "photos", "thumbnails");
const manifestPath = join(project, "app", "data", "photo-library.json");
await Promise.all([originalDirectory, previewDirectory, thumbnailDirectory].map((directory) => mkdir(directory, { recursive: true })));

// Optional paths import only the explicitly supplied files, not the whole source folder.
for (const source of process.argv.slice(2)) {
  const absolute = resolve(source);
  const name = basename(absolute);
  if (!supportedPhotoExtensions.has(extname(name).toLowerCase())) throw new Error(`Unsupported photo: ${name}`);
  const destination = join(originalDirectory, name);
  if (absolute.toLowerCase() === destination.toLowerCase()) continue;
  try {
    const existing = await readFile(destination);
    if (!existing.equals(await readFile(absolute))) throw new Error(`A different original already exists: ${name}. Rename the new file before importing.`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await copyFile(absolute, destination);
  }
}

type Entry = { id: number; src: string; thumbnail: string; original: string; filename: string; caption: string; width: number; height: number; fingerprint: string };
let previous: Entry[] = [];
try { previous = JSON.parse(await readFile(manifestPath, "utf8")); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
const entries: Entry[] = [];
const originals = (await readdir(originalDirectory, { withFileTypes: true })).filter((file) => file.isFile() && supportedPhotoExtensions.has(extname(file.name).toLowerCase())).map((file) => file.name).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
for (const filename of originals) {
  const input = await readFile(join(originalDirectory, filename));
  const fingerprint = createHash("sha256").update(input).update("preview-v1").digest("hex");
  const key = `${basename(filename, extname(filename)).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80)}-${fingerprint.slice(0, 10)}`;
  const original = `/photos/originals/${encodeURIComponent(filename)}`;
  const old = previous.find((photo) => photo.original === original && photo.fingerprint === fingerprint);
  if (old) {
    try {
      await Promise.all([readFile(join(project, "public", old.src)), readFile(join(project, "public", old.thumbnail))]);
      entries.push({ ...old, id: entries.length + 1 });
      console.log(`Already prepared: ${filename}`);
      continue;
    } catch { /* Regenerate missing previews. */ }
  }
  console.log(`Preparing: ${filename}`);
  const result = await createPhotoPreviews(input, filename);
  await writeFile(join(previewDirectory, `${key}.webp`), result.preview);
  await writeFile(join(thumbnailDirectory, `${key}.webp`), result.thumbnail);
  entries.push({ id: entries.length + 1, src: `/photos/previews/${key}.webp`, thumbnail: `/photos/thumbnails/${key}.webp`, original, filename, caption: "Đi ăn cùng nhau", width: result.width, height: result.height, fingerprint });
}
// Publish the manifest only after every conversion succeeds.
const temporaryManifest = `${manifestPath}.tmp`;
await writeFile(temporaryManifest, `${JSON.stringify(entries, null, 2)}\n`);
await rename(temporaryManifest, manifestPath);
console.log(`Photo library ready: ${entries.length} original photos with browser previews.`);
