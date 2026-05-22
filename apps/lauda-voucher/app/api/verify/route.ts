import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "../../../lib/auth";
import { parseQrContent, verifySignature } from "../../../lib/crypto";
import { isVoucherUsed } from "../../../lib/db";

export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  let body: { qrContent?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültiger JSON Body" },
      { status: 400 },
    );
  }

  const { qrContent } = body;

  if (typeof qrContent !== "string" || !qrContent.trim()) {
    return NextResponse.json(
      { error: "qrContent muss ein nicht-leerer String sein" },
      { status: 400 },
    );
  }

  const payload = parseQrContent(qrContent);
  if (!payload) {
    return NextResponse.json(
      { valid: false, error: "Ungültiges QR-Code Format" },
      { status: 200 },
    );
  }

  let valid: boolean;
  try {
    valid = verifySignature(payload.id, payload.amount, payload.signature);
  } catch {
    valid = false;
  }

  if (!valid) {
    return NextResponse.json(
      { valid: false, amount: payload.amount, used: false },
      { status: 200 },
    );
  }

  const used = await isVoucherUsed(payload.id);

  return NextResponse.json(
    { valid: true, amount: payload.amount, used },
    { status: 200 },
  );
}
