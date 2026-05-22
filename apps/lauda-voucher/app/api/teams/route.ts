import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "../../../lib/auth";
import { createTeam, deleteTeam, listTeams } from "../../../lib/db";

export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const teams = await listTeams();
    return NextResponse.json({ teams }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Teams konnten nicht geladen werden." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  let body: { teamName?: string; captainName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültiger JSON Body" },
      { status: 400 },
    );
  }

  const teamName = body.teamName?.trim();
  const captainName = body.captainName?.trim();

  if (!teamName || !captainName) {
    return NextResponse.json(
      { error: "Teamname und Kapitän sind erforderlich." },
      { status: 400 },
    );
  }

  try {
    const team = await createTeam(teamName, captainName);
    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Team konnte nicht angelegt werden.";

    return NextResponse.json(
      { error: message },
      { status: message.includes("Startnummer") ? 409 : 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültiger JSON Body" },
      { status: 400 },
    );
  }

  if (!body.id || !body.id.trim()) {
    return NextResponse.json(
      { error: "Team-ID ist erforderlich." },
      { status: 400 },
    );
  }

  try {
    await deleteTeam(body.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Team konnte nicht entfernt werden." },
      { status: 500 },
    );
  }
}
