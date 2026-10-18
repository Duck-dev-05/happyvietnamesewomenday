import type { Sister } from "../data/sisters";

/** Render locally so the private message never leaves the browser for export. */
export async function createPostcard(sister: Sister): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  const width = 1200;
  const inset = 140;
  const textWidth = width - inset * 2;
  const pageFonts = getComputedStyle(document.documentElement);
  const serif = pageFonts.getPropertyValue("--font-playfair").trim() || 'Georgia, serif';
  const sans = pageFonts.getPropertyValue("--font-jakarta").trim() || 'Arial, sans-serif';
  const sample = `${sister.name} ${sister.wish} ${sister.appreciation} Gửi đến người thương quý Ngày Phụ nữ Việt Nam`.normalize("NFC");
  // Canvas does not load web fonts automatically before measuring or drawing.
  await Promise.all([
    document.fonts.load(`400 56px ${serif}`, sample),
    document.fonts.load(`italic 400 27px ${serif}`, sample),
    document.fonts.load(`400 16px ${sans}`, sample),
  ]);
  const bodyFont = `32px ${serif}`;
  const nameFont = `56px ${serif}`;
  const closingFont = `italic 27px ${serif}`;
  const wrap = (text: string, font: string) => {
    context.font = font;
    const lines: string[] = [];
    for (const paragraph of text.normalize("NFC").split("\n")) {
      let line = "";
      for (const word of paragraph.trim().split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && context.measureText(candidate).width > textWidth) {
          lines.push(line);
          line = "";
        }
        // Preserve long URLs or unbroken text without clipping the card.
        if (context.measureText(word).width > textWidth) {
          for (const character of Array.from(word)) {
            if (line && context.measureText(line + character).width > textWidth) {
              lines.push(line);
              line = "";
            }
            line += character;
          }
        } else line = line ? `${line} ${word}` : word;
      }
      lines.push(line);
    }
    return lines;
  };
  const names = wrap(sister.name, nameFont);
  const wishes = wrap(sister.wish, bodyFont);
  const closing = sister.appreciation.trim() ? wrap(sister.appreciation, closingFont) : [];
  const messageTop = 310 + names.length * 76 + 105;
  const messageBottom = messageTop + wishes.length * 54 + (closing.length ? 40 + closing.length * 44 : 0);
  canvas.width = width;
  canvas.height = Math.max(940, messageBottom + 210);
  const height = canvas.height;
  context.fillStyle = "#fbf7f1";
  context.fillRect(0, 0, width, height);
  const glow = context.createRadialGradient(width, 0, 30, width, 0, 700);
  glow.addColorStop(0, "#ead6d080"); glow.addColorStop(1, "#ead6d000");
  context.fillStyle = glow; context.fillRect(0, 0, width, height);
  context.fillStyle = "#eadcd1";
  context.fillRect(0, 0, 12, height);
  context.strokeStyle = "#dfcfc3"; context.lineWidth = 1;
  context.strokeRect(30.5, 30.5, width - 61, height - 61);
  context.strokeStyle = "#e9ded4";
  context.strokeRect(40.5, 40.5, width - 81, height - 81);

  // An understated botanical ornament, drawn with native canvas paths.
  context.save(); context.translate(600, 210);
  context.strokeStyle = "#b78c8d"; context.lineWidth = 1.5;
  for (let petal = 0; petal < 6; petal++) {
    context.save(); context.rotate(petal * Math.PI / 3);
    context.beginPath(); context.ellipse(0, -27, 12, 23, 0, 0, Math.PI * 2); context.stroke(); context.restore();
  }
  context.fillStyle = "#b78c8d"; context.beginPath(); context.arc(0, 0, 5, 0, Math.PI * 2); context.fill();
  context.restore();
  context.textBaseline = "top";
  context.fillStyle = "#94586b"; context.font = `30px ${serif}`;
  context.fillText("thương.", 90, 82);
  context.textAlign = "right"; context.font = `24px ${serif}`;
  context.fillText("20 / 10", width - 90, 85);
  context.textAlign = "center";
  context.font = `13px ${sans}`; context.fillStyle = "#9b8274";
  context.fillText("NGÀY PHỤ NỮ VIỆT NAM", 600, 118);
  context.font = `italic 22px ${serif}`; context.fillStyle = "#a08476";
  context.fillText("Gửi đến người thương quý", 600, 270);
  let y = 310;
  const draw = (lines: string[], font: string, color: string, lineHeight: number) => {
    context.font = font; context.fillStyle = color;
    for (const line of lines) { context.fillText(line, context.textAlign === "center" ? width / 2 : inset, y); y += lineHeight; }
  };
  draw(names, nameFont, "#895466", 76);
  context.strokeStyle = "#c5a49b"; context.beginPath(); context.moveTo(560, y + 33); context.lineTo(640, y + 33); context.stroke();
  y += 105;
  context.textAlign = "left";
  context.font = `82px ${serif}`; context.fillStyle = "#d9bdb4";
  context.fillText("“", 82, y - 26);
  draw(wishes, bodyFont, "#4b443e", 54);
  if (closing.length) { y += 40; draw(closing, closingFont, "#8b7465", 44); }
  context.textAlign = "center";
  context.strokeStyle = "#dfcfc3";
  context.beginPath(); context.moveTo(440, height - 157); context.lineTo(760, height - 157); context.stroke();
  context.font = `italic 25px ${serif}`; context.fillStyle = "#94586b";
  context.fillText("Một chút thương, dành riêng cho bạn.", 600, height - 125);
  context.font = `12px ${sans}`; context.fillStyle = "#a18b7e";
  context.fillText("GỬI NGÀN YÊU THƯƠNG", 600, height - 80);
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Export failed")), "image/png"));
}

export async function downloadPostcard(sister: Sister) {
  const blob = await createPostcard(sister);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = `loi-chuc-${sister.slug}.png`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

