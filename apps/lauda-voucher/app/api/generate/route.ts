import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { authenticate } from "../../../lib/auth";
import { createVoucherPayload } from "../../../lib/crypto";
import {
  centerTextX,
  drawDisplayHeading,
  drawRoundedRect,
  drawStripedRail,
  loadBrandedPdfAssets,
  pdfTheme,
  wrapText,
} from "../../../lib/pdf-branding";

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
  const { displayFont, bodyFont, logoImage } =
    await loadBrandedPdfAssets(pdfDoc);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const outerX = 32;
  const outerY = 34;
  const outerWidth = pageWidth - outerX * 2;
  const outerHeight = pageHeight - outerY * 2;

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

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: pdfTheme.paper,
    });

    page.drawCircle({
      x: 72,
      y: 780,
      size: 86,
      color: pdfTheme.primary,
      opacity: 0.08,
    });
    page.drawCircle({
      x: 240,
      y: 300,
      size: 74,
      color: pdfTheme.accent,
      opacity: 0.07,
    });

    drawRoundedRect(page, {
      x: outerX,
      y: outerY,
      width: outerWidth,
      height: outerHeight,
      radius: 26,
      color: pdfTheme.white,
      borderColor: pdfTheme.primary,
      borderWidth: 4,
    });

    page.drawRectangle({
      x: outerX,
      y: outerY + outerHeight - 16,
      width: outerWidth,
      height: 16,
      color: pdfTheme.primary,
    });

    drawRoundedRect(page, {
      x: 64,
      y: 724,
      width: 118,
      height: 54,
      radius: 16,
      color: pdfTheme.paper,
      borderColor: pdfTheme.primarySoft,
      borderWidth: 1.5,
    });

    if (logoImage) {
      drawRoundedRect(page, {
        x: 470,
        y: 718,
        width: 72,
        height: 72,
        radius: 18,
        color: pdfTheme.white,
        borderColor: pdfTheme.primarySoft,
        borderWidth: 1.5,
      });

      page.drawImage(logoImage, {
        x: 480,
        y: 728,
        width: 500 / 8,
        height: 346 / 8,
      });
    }

    const headingLine1 = "STAMMHEIMER";
    const headingLine2 = "SEIFENKISTENRENNEN";
    drawDisplayHeading(page, {
      text: headingLine1,
      x: centerTextX(headingLine1, displayFont, 31, pageWidth),
      y: 668,
      size: 31,
      font: displayFont,
      fillColor: pdfTheme.primary,
    });
    drawDisplayHeading(page, {
      text: headingLine2,
      x: centerTextX(headingLine2, displayFont, 31, pageWidth),
      y: 628,
      size: 31,
      font: displayFont,
      fillColor: pdfTheme.primary,
    });

    const subtitle = "Anwohner Gutschein";
    page.drawText(subtitle, {
      x: centerTextX(subtitle, bodyFont, 20, pageWidth),
      y: 594,
      size: 20,
      font: bodyFont,
      color: pdfTheme.accent,
    });

    const subcopy = "Wertgutschein für Anwohner am Seifenkistenrennen Gelände.";
    page.drawText(subcopy, {
      x: centerTextX(subcopy, bodyFont, 11.5, pageWidth),
      y: 572,
      size: 11.5,
      font: bodyFont,
      color: pdfTheme.muted,
    });

    drawRoundedRect(page, {
      x: 90,
      y: 432,
      width: 415,
      height: 112,
      radius: 22,
      color: pdfTheme.cream,
      borderColor: pdfTheme.accentSoft,
      borderWidth: 1.5,
    });

    const amountLabel = "Gutscheinwert";
    page.drawText(amountLabel.toUpperCase(), {
      x: centerTextX(amountLabel.toUpperCase(), displayFont, 12, pageWidth),
      y: 512,
      size: 12,
      font: displayFont,
      color: pdfTheme.primary,
    });

    const amountText = `${amount} €`;
    drawDisplayHeading(page, {
      text: amountText,
      x: centerTextX(amountText, displayFont, 50, pageWidth),
      y: 457,
      size: 50,
      font: displayFont,
      fillColor: pdfTheme.primary,
      shadowOffset: 2,
    });

    drawRoundedRect(page, {
      x: 70,
      y: 168,
      width: 248,
      height: 214,
      radius: 20,
      color: pdfTheme.paper,
      borderColor: pdfTheme.accentSoft,
      borderWidth: 1.25,
    });
    drawRoundedRect(page, {
      x: 344,
      y: 168,
      width: 180,
      height: 214,
      radius: 20,
      color: pdfTheme.white,
      borderColor: pdfTheme.primarySoft,
      borderWidth: 1.25,
    });

    page.drawText("Details", {
      x: 90,
      y: 350,
      size: 18,
      font: displayFont,
      color: pdfTheme.accent,
    });
    page.drawText("QR-Code", {
      x: 396,
      y: 350,
      size: 18,
      font: displayFont,
      color: pdfTheme.accent,
    });

    const detailCopy = `Als Einladung und kleine Entschädigung erhalten Sie diesen Gutschein über ${amount} €. Er kann am 13. Juni 2026 an der Kasse beim Kauf eines Wertmarken-Bündels in höhe von min. 10€ eingelöst werden. Keine Barauszahlung, einmalig gültig.`;
    const detailLines = wrapText(detailCopy, bodyFont, 12, 208);
    let detailY = 320;
    for (const line of detailLines) {
      page.drawText(line, {
        x: 90,
        y: detailY,
        size: 12,
        font: bodyFont,
        color: pdfTheme.ink,
      });
      detailY -= 18;
    }

    page.drawText("Bitte beim Einlösen diesen Code vorzeigen.", {
      x: 90,
      y: 198,
      size: 10.5,
      font: bodyFont,
      color: pdfTheme.muted,
    });

    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrImage, {
      x: 374,
      y: 218,
      width: 120,
      height: 120,
    });

    const qrLabel = "Zum Einlösen scannen";
    page.drawText(qrLabel, {
      x: centerTextX(qrLabel, bodyFont, 10.5, 180) + 344,
      y: 196,
      size: 10.5,
      font: bodyFont,
      color: pdfTheme.muted,
    });

    page.drawText(`Voucher-ID: ${id}`, {
      x: 70,
      y: 82,
      size: 9,
      font: bodyFont,
      color: rgb(0.49, 0.49, 0.49),
    });
    page.drawText("Nur am 13. Juni 2026 gültig", {
      x: 360,
      y: 82,
      size: 10,
      font: bodyFont,
      color: pdfTheme.primary,
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
