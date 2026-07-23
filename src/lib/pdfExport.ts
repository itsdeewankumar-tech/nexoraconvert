import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import type { Annotation } from '@/types';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return { r: r || 0, g: g || 0, b: b || 0 };
}

function pickFont(ann: Annotation): StandardFonts {
  if (ann.bold && ann.italic) return StandardFonts.HelveticaBoldOblique;
  if (ann.bold) return StandardFonts.HelveticaBold;
  if (ann.italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

export async function exportPdf(
  originalBytes: Uint8Array,
  annotations: Annotation[],
  fileName: string,
): Promise<void> {
  const pdfDoc = await PDFDocument.load(originalBytes);
  const pages = pdfDoc.getPages();

  const fontCache = new Map<StandardFonts, Awaited<ReturnType<PDFDocument['embedFont']>>>();
  const getFont = async (f: StandardFonts) => {
    if (!fontCache.has(f)) fontCache.set(f, await pdfDoc.embedFont(f));
    return fontCache.get(f)!;
  };

  for (const ann of annotations) {
    if (ann.deleted || !ann.text.trim()) continue;
    const page = pages[ann.pageIndex];
    if (!page) continue;

    const font = await getFont(pickFont(ann));
    const { r, g, b } = hexToRgb(ann.color);
    const color = rgb(r, g, b);

    const lines = ann.text.split('\n');
    const lineHeight = ann.fontSize * 1.2;
    const pageHeight = page.getHeight();

    lines.forEach((line, i) => {
      if (!line) return;
      const textWidth = font.widthOfTextAtSize(line, ann.fontSize);
      let drawX = ann.x;
      if (ann.align === 'center') drawX = ann.x - textWidth / 2;
      if (ann.align === 'right') drawX = ann.x - textWidth;

      // y stored as distance from top of page (display coords); convert to PDF (bottom-left origin).
      const drawY = pageHeight - ann.y - ann.fontSize - i * lineHeight;

      page.drawText(line, {
        x: drawX,
        y: drawY,
        size: ann.fontSize,
        font,
        color,
        rotate: degrees(ann.rotation || 0),
      });

      if (ann.underline) {
        page.drawLine({
          start: { x: drawX, y: drawY - 1 },
          end: { x: drawX + textWidth, y: drawY - 1 },
          thickness: Math.max(0.5, ann.fontSize / 14),
          color,
        });
      }
    });
  }

  const out = await pdfDoc.save();
  const blob = new Blob([out as BlobPart], { type: 'application/pdf' });
  triggerDownload(blob, fileName);
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
