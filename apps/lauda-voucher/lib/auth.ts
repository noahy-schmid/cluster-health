import { NextRequest, NextResponse } from "next/server";

const VOUCHER_AUTH_PASSWORD = process.env.VOUCHER_AUTH_PASSWORD;

export function authenticate(request: NextRequest): NextResponse | null {
  if (!VOUCHER_AUTH_PASSWORD) {
    return NextResponse.json(
      {
        error:
          "Server falsch konfiguriert: VOUCHER_AUTH_PASSWORD nicht gesetzt",
      },
      { status: 500 },
    );
  }

  const password = request.headers.get("Authorization");

  if (!password || password !== VOUCHER_AUTH_PASSWORD) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  return null;
}
