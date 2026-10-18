import heicConvert from "heic-convert";
import sharp from "sharp";
import { extname } from "node:path";

export const supportedPhotoExtensions = new Set([".heic", ".heif", ".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/** Local/server utility. Keep HEIC decoding out of the browser bundle. */
export async function createPhotoPreviews(input: Buffer, filename: string) {
  const extension = extname(filename).toLowerCase();
  if (!supportedPhotoExtensions.has(extension)) throw new Error(`Unsupported photo format: ${extension}`);
  const decoded = extension === ".heic" || extension === ".heif"
    ? Buffer.from(await heicConvert({ buffer: input, format: "PNG" }))
    : input;
  // HEIF's decoder applies its container rotation; rotate() handles JPEG EXIF.
  // Output previews omit metadata; original files remain untouched.
  const preview = await sharp(decoded).rotate().resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer({ resolveWithObject: true });
  const thumbnail = await sharp(preview.data).resize({ width: 240, height: 240, fit: "inside", withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
  return { preview: preview.data, thumbnail, width: preview.info.width, height: preview.info.height };
}
