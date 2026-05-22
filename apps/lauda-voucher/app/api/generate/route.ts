import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { authenticate } from "../../../lib/auth";
import { createVoucherPayload } from "../../../lib/crypto";

export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  let body: { amount?: number; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültiger JSON Body" },
      { status: 400 },
    );
  }

  const { amount, quantity = 1 } = body;

  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Betrag muss eine positive ganze Zahl sein" },
      { status: 400 },
    );
  }

  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity <= 0 ||
    quantity > 500
  ) {
    return NextResponse.json(
      { error: "Anzahl muss zwischen 1 und 500 liegen" },
      { status: 400 },
    );
  }

  const pdfDoc = await PDFDocument.create();
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const primaryColor = rgb(0.8, 0, 0); // #CC0000
  const accentColor = rgb(0.1, 0.1, 0.18); // #1a1a2e (dark accent)
  const textColor = rgb(0.2, 0.2, 0.2);

  const pageWidth = 595.28;

  // Helper to center text
  const centerX = (text: string, font: typeof helvetica, size: number) => {
    const width = font.widthOfTextAtSize(text, size);
    return (pageWidth - width) / 2;
  };

  // Helper to wrap text into lines
  const wrapText = (
    text: string,
    font: typeof helvetica,
    size: number,
    maxWidth: number,
  ): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, size) > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  for (let i = 0; i < quantity; i++) {
    const id = uuidv4();
    const payload = createVoucherPayload(id, amount);
    const qrContent = JSON.stringify(payload);

    const qrDataUrl = await QRCode.toDataURL(qrContent, {
      width: 200,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");

    const page = pdfDoc.addPage([595.28, 841.89]);

    // Border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: 535.28,
      height: 781.89,
      borderColor: primaryColor,
      borderWidth: 3,
    });

    // Inner border
    page.drawRectangle({
      x: 37,
      y: 37,
      width: 521.28,
      height: 767.89,
      borderColor: accentColor,
      borderWidth: 1,
    });

    // Header line 1
    const headerLine1 = "STAMMHEIMER";
    page.drawText(headerLine1, {
      x: centerX(headerLine1, helveticaBold, 24),
      y: 775,
      size: 24,
      font: helveticaBold,
      color: primaryColor,
    });

    // Header line 2
    const headerLine2 = "SEIFENKISTENRENNEN";
    page.drawText(headerLine2, {
      x: centerX(headerLine2, helveticaBold, 24),
      y: 748,
      size: 24,
      font: helveticaBold,
      color: primaryColor,
    });

    // Decorative line
    page.drawLine({
      start: { x: 80, y: 738 },
      end: { x: 515, y: 738 },
      thickness: 2,
      color: primaryColor,
    });

    // Subtitle
    const subtitle = "Anwohner Gutschein";
    page.drawText(subtitle, {
      x: centerX(subtitle, helvetica, 16),
      y: 715,
      size: 16,
      font: helvetica,
      color: textColor,
    });

    // Amount
    const amountText = `${amount} \u20ac`;
    page.drawText(amountText, {
      x: centerX(amountText, helveticaBold, 48),
      y: 645,
      size: 48,
      font: helveticaBold,
      color: primaryColor,
    });

    // Amount label
    const amountLabel = "Wert";
    page.drawText(amountLabel, {
      x: centerX(amountLabel, helvetica, 12),
      y: 625,
      size: 12,
      font: helvetica,
      color: textColor,
    });

    // Decorative line
    page.drawLine({
      start: { x: 80, y: 610 },
      end: { x: 515, y: 610 },
      thickness: 1,
      color: primaryColor,
    });

    // QR Code
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrImage, {
      x: 207.64,
      y: 400,
      width: 180,
      height: 180,
    });

    // QR label
    const qrLabel = "QR-Code zum Einl\u00f6sen scannen";
    page.drawText(qrLabel, {
      x: centerX(qrLabel, helvetica, 10),
      y: 385,
      size: 10,
      font: helvetica,
      color: textColor,
    });

    // Decorative line
    page.drawLine({
      start: { x: 80, y: 372 },
      end: { x: 515, y: 372 },
      thickness: 1,
      color: primaryColor,
    });

    // Footer description text
    const footerText = `Als Einladung und kleine Entschädigung erhalten Sie von uns diesen Gutschein über ${amount} € welchen Sie bei unserem Fest am 13. Juni. 2026 einlösen können. Bitte kommen Sie dazu an die Kasse und zeigen diesen Gutschein vor. Der Gutschein kann nur beim Kauf eines Wertmarken-Bündels (10 €, 20 € oder 40 €) eingelöst werden, sie erhalten den Gegenwert davon in Wertmarken. Der Gutschein ist nur am 13. Juni 2026 gültig und kann nicht gegen Bargeld eingetauscht werden. Der Gutschein ist nur einmalig gültig.`;
    const footerLines = wrapText(footerText, helvetica, 9, 480);
    let footerY = 350;
    for (const line of footerLines) {
      page.drawText(line, {
        x: centerX(line, helvetica, 9),
        y: footerY,
        size: 9,
        font: helvetica,
        color: textColor,
      });
      footerY -= 13;
    }

    // Voucher ID
    page.drawText(`ID: ${id}`, {
      x: centerX(`ID: ${id}`, helvetica, 7),
      y: 50,
      size: 7,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
  } // end for loop

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="gutscheine-${amount}eur-x${quantity}.pdf"`,
    },
  });
}
