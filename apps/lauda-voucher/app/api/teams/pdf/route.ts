import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { authenticate } from "../../../../lib/auth";
import { listTeams } from "../../../../lib/db";
import {
  centerTextX,
  drawDisplayHeading,
  drawRoundedRect,
  drawStripedRail,
  loadBrandedPdfAssets,
  pdfTheme,
} from "../../../../lib/pdf-branding";

const LANDSCAPE_A4: [number, number] = [841.89, 595.28];

function fitTextSize(
  text: string,
  measureText: (size: number) => number,
  maxWidth: number,
  maxSize: number,
  minSize: number,
) {
  let currentSize = maxSize;

  while (currentSize > minSize && measureText(currentSize) > maxWidth) {
    currentSize -= 2;
  }

  return currentSize;
}

export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  const teams = await listTeams();

  if (teams.length === 0) {
    return NextResponse.json(
      { error: "Es sind noch keine Teams für den PDF-Export vorhanden." },
      { status: 400 },
    );
  }

  const pdfDoc = await PDFDocument.create();
  const { displayFont, bodyFont, logoImage } =
    await loadBrandedPdfAssets(pdfDoc);

  for (const team of teams) {
    const page = pdfDoc.addPage(LANDSCAPE_A4);
    const [pageWidth, pageHeight] = LANDSCAPE_A4;
    const teamName = team.teamName.toUpperCase();
    const startingNumber = String(team.startingNumber);
    const numberSize = fitTextSize(
      startingNumber,
      (size) => displayFont.widthOfTextAtSize(startingNumber, size),
      pageWidth - 180,
      250,
      180,
    );
    const teamNameSize = fitTextSize(
      teamName,
      (size) => displayFont.widthOfTextAtSize(teamName, size),
      pageWidth - 200,
      34,
      18,
    );

    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: pdfTheme.paper,
    });

    page.drawCircle({
      x: 84,
      y: pageHeight - 54,
      size: 78,
      color: pdfTheme.primary,
      opacity: 0.08,
    });
    page.drawCircle({
      x: pageWidth / 2,
      y: pageHeight / 2,
      size: 200,
      color: pdfTheme.accent,
      opacity: 0.08,
    });

    drawRoundedRect(page, {
      x: 18,
      y: 18,
      width: pageWidth - 36,
      height: pageHeight - 36,
      radius: 24,
      color: pdfTheme.white,
      borderColor: pdfTheme.primary,
      borderWidth: 4,
    });

    page.drawRectangle({
      x: 18,
      y: pageHeight - 36,
      width: pageWidth - 36,
      height: 14,
      color: pdfTheme.primary,
    });

    const eventLabel = "STAMMHEIMER";
    const eventLabel2 = "SEIFENKISTENRENNEN";
    drawDisplayHeading(page, {
      text: eventLabel,
      x: centerTextX(eventLabel, displayFont, 40, pageWidth),
      y: pageHeight - 90,
      size: 40,
      font: displayFont,
      fillColor: pdfTheme.primary,
    });

    drawDisplayHeading(page, {
      text: eventLabel2,
      x: centerTextX(eventLabel2, displayFont, 40, pageWidth),
      y: pageHeight - 140,
      size: 40,
      font: displayFont,
      fillColor: pdfTheme.primary,
    });

    page.drawText(teamName, {
      x: centerTextX(teamName, displayFont, 40, pageWidth),
      y: pageHeight - 190,
      size: 40,
      font: displayFont,
      color: pdfTheme.accent,
    });

    const numberShadowX = centerTextX(
      startingNumber,
      displayFont,
      numberSize,
      pageWidth,
    );
    drawDisplayHeading(page, {
      text: startingNumber,
      x: numberShadowX,
      y: 162,
      size: numberSize,
      font: displayFont,
      fillColor: pdfTheme.primary,
      shadowOffset: 3,
    });

    page.drawText("STARTNUMMER", {
      x: centerTextX("STARTNUMMER", displayFont, 16, pageWidth),
      y: 124,
      size: 16,
      font: displayFont,
      color: pdfTheme.accent,
    });

    const captainText = `Kapitän: ${team.captainName}`;
    page.drawText(captainText, {
      x: centerTextX(captainText, bodyFont, 18, pageWidth),
      y: 70,
      size: 18,
      font: bodyFont,
      color: pdfTheme.accent,
    });

    if (logoImage) {
      page.drawImage(logoImage, {
        x: pageWidth - 122,
        y: pageHeight - 135,
        width: 500 / 6,
        height: 346 / 6,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="team-startnummern-a4-landscape.pdf"',
    },
  });
}
