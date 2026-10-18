import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import sharp from "sharp";
import { createPhotoPreviews, supportedPhotoExtensions } from "../app/lib/photoProcessing.ts";
import type { Photo } from "../app/data/photos.ts";

const photos: Photo[] = JSON.parse(await readFile("app/data/photo-library.json", "utf8"));

test("all imported photos have valid optimized previews, thumbnails, and originals", async () => {
  const originals = (await readdir("public/photos/originals")).filter((name) => supportedPhotoExtensions.has(extname(name).toLowerCase()));
  assert(photos.length > 0);
  assert.deepEqual(photos.map((photo) => photo.filename).sort(), originals.sort());
  assert.equal(new Set(photos.map((photo) => photo.src)).size, photos.length);
  for (const photo of photos) {
    const original = await readFile(join("public", decodeURIComponent(photo.original)));
    const preview = await sharp(join("public", photo.src)).metadata();
    const thumbnail = await sharp(join("public", photo.thumbnail)).metadata();
    assert(original.byteLength > 0);
    assert.equal(preview.format, "webp");
    assert.equal(preview.width, photo.width);
    assert.equal(preview.height, photo.height);
    assert(Math.max(preview.width!, preview.height!) <= 1920);
    assert(Math.max(thumbnail.width!, thumbnail.height!) <= 240);
    assert.equal(preview.exif, undefined);
  }
});

test("HEIC library decodes a supplied HEIC photo to browser-readable WebP", async () => {
  const photo = photos.find((entry) => entry.filename.endsWith(".HEIC"))!;
  const input = await readFile(join("public", photo.original));
  const result = await createPhotoPreviews(input, photo.filename);
  assert.equal((await sharp(result.preview).metadata()).format, "webp");
  assert(result.width > 0 && result.height > 0);
  assert(result.thumbnail.byteLength < result.preview.byteLength);
});

test("unsupported and corrupt files fail without generating pretend previews", async () => {
  await assert.rejects(createPhotoPreviews(Buffer.from("invalid"), "file.txt"), /Unsupported photo format/);
  await assert.rejects(createPhotoPreviews(Buffer.from("invalid"), "broken.heic"));
});
