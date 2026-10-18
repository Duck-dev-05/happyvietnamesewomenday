import type { Sister } from "../data/sisters";

export async function downloadPostcard(sister: Sister) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  const width = 1200;
  const wrap = (text: string, font: string, maxWidth: number) => {
    context.font = font;
    const lines: string[] = [];
    for (const paragraph of text.split("\n")) {
      let line = "";
      for (const character of Array.from(paragraph)) {
        if (context.measureText(line + character).width > maxWidth && line) { lines.push(line); line = ""; }
        line += character;
      }
      lines.push(line);
    }
    return lines;
  };
  const names = wrap(sister.name, "52px Georgia, serif", 980);
  const wishes = wrap(sister.wish, "32px sans-serif", 980);
  const closing = wrap(sister.appreciation, "28px sans-serif", 980);
  canvas.width = width;
  canvas.height = Math.max(1000, 450 + names.length * 70 + wishes.length * 52 + closing.length * 46);
  context.fillStyle = "#fcf8ef"; context.fillRect(0, 0, width, canvas.height);
  context.strokeStyle = "#d9c7bd"; context.lineWidth = 2; context.strokeRect(35, 35, width - 70, canvas.height - 70);
  context.fillStyle = "#94586b"; context.font = "24px sans-serif";
  context.fillText("20 / 10 · NGÀY PHỤ NỮ VIỆT NAM", 110, 135);
  let y = 240;
  const draw = (lines: string[], font: string, color: string, lineHeight: number) => {
    context.font = font; context.fillStyle = color;
    for (const line of lines) { context.fillText(line, 110, y); y += lineHeight; }
  };
  draw(names, "52px Georgia, serif", "#94586b", 70); y += 40;
  draw(wishes, "32px sans-serif", "#423d38", 52); y += 34;
  draw(closing, "28px sans-serif", "#657158", 46);
  context.font = "28px Georgia, serif"; context.fillStyle = "#94586b";
  context.fillText("thương. — Gửi ngàn yêu thương", 110, canvas.height - 100);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Export failed")), "image/png"));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = `loi-chuc-${sister.slug}.png`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
