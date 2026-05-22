import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import {
  type PDFDocument,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  rgb,
} from "pdf-lib";

export const pdfTheme = {
  primary: rgb(0.8, 0, 0),
  primarySoft: rgb(0.96, 0.88, 0.87),
  accent: rgb(0.12, 0.17, 0.24),
  accentSoft: rgb(0.79, 0.84, 0.89),
  cream: rgb(0.97, 0.95, 0.92),
  paper: rgb(0.99, 0.98, 0.96),
  white: rgb(1, 1, 1),
  ink: rgb(0.18, 0.19, 0.21),
  muted: rgb(0.39, 0.44, 0.48),
};

export type BrandedPdfAssets = {
  displayFont: PDFFont;
  bodyFont: PDFFont;
  logoImage?: PDFImage;
};

export async function loadBrandedPdfAssets(
  pdfDoc: PDFDocument,
): Promise<BrandedPdfAssets> {
  pdfDoc.registerFontkit(fontkit);

  const [displayFontBytes, bodyFontBytes, logoBytes] = await Promise.all([
    readFile(path.join(process.cwd(), "public", "fonts", "Bevan-Regular.ttf")),
    readFile(
      path.join(
        process.cwd(),
        "public",
        "fonts",
        "WDXLLubrifontTC-Regular.ttf",
      ),
    ),
    readFile(path.join(process.cwd(), "public", "lauda-logo.png")).catch(
      () => null,
    ),
  ]);

  return {
    displayFont: await pdfDoc.embedFont(displayFontBytes),
    bodyFont: await pdfDoc.embedFont(bodyFontBytes),
    logoImage: logoBytes ? await pdfDoc.embedPng(logoBytes) : undefined,
  };
}

export function centerTextX(
  text: string,
  font: PDFFont,
  size: number,
  pageWidth: number,
) {
  return (pageWidth - font.widthOfTextAtSize(text, size)) / 2;
}

export function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function drawRoundedRect(
  page: PDFPage,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    color?: ReturnType<typeof rgb>;
    borderColor?: ReturnType<typeof rgb>;
    borderWidth?: number;
    opacity?: number;
    borderOpacity?: number;
  },
) {
  const { x, y, width, height, radius } = options;
  const clampedRadius = Math.min(radius, width / 2, height / 2);
  const right = x + width;
  const top = y + height;

  const pathData = [
    `M ${x + clampedRadius} ${y}`,
    `L ${right - clampedRadius} ${y}`,
    `Q ${right} ${y} ${right} ${y + clampedRadius}`,
    `L ${right} ${top - clampedRadius}`,
    `Q ${right} ${top} ${right - clampedRadius} ${top}`,
    `L ${x + clampedRadius} ${top}`,
    `Q ${x} ${top} ${x} ${top - clampedRadius}`,
    `L ${x} ${y + clampedRadius}`,
    `Q ${x} ${y} ${x + clampedRadius} ${y}`,
    "Z",
  ].join(" ");

  page.drawSvgPath(pathData, options);
}

export function drawStripedRail(
  page: PDFPage,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: ReturnType<typeof rgb>;
    step?: number;
    thickness?: number;
    opacity?: number;
  },
) {
  const {
    x,
    y,
    width,
    height,
    color,
    step = 12,
    thickness = 4,
    opacity = 0.22,
  } = options;

  page.drawRectangle({
    x,
    y,
    width,
    height,
    color,
    opacity: 0.05,
  });

  for (let offset = -height; offset < width + height; offset += step) {
    page.drawLine({
      start: { x: x + offset, y },
      end: { x: x + offset + height, y: y + height },
      thickness,
      color,
      opacity,
    });
  }
}

export function drawDisplayHeading(
  page: PDFPage,
  options: {
    text: string;
    x: number;
    y: number;
    size: number;
    font: PDFFont;
    fillColor: ReturnType<typeof rgb>;
    shadowColor?: ReturnType<typeof rgb>;
    shadowOffset?: number;
  },
) {
  const {
    text,
    x,
    y,
    size,
    font,
    fillColor,
    shadowColor = pdfTheme.accent,
    shadowOffset = 1.6,
  } = options;

  page.drawText(text, {
    x: x + shadowOffset,
    y: y - shadowOffset,
    size,
    font,
    color: shadowColor,
  });

  page.drawText(text, {
    x,
    y,
    size,
    font,
    color: fillColor,
  });
}
