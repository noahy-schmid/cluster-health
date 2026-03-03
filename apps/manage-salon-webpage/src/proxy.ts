import { NextRequest, NextResponse } from "next/server";
import { ManagementUserRepository } from "@repo/auth-domain";
import { db, websitesTable } from "@repo/website-domain";
import { eq } from "drizzle-orm";

/**
 * Extracts the session token from the request cookies.
 */
function getSessionToken(req: NextRequest): string | undefined {
  return req.cookies.get("session")?.value;
}

/**
 * Verifies the session token and returns the salonId from the payload.
 */
async function auth(
  req: NextRequest,
): Promise<
  | { success: true; salonId: string | undefined }
  | { success: false; error: string }
> {
  const token = getSessionToken(req);

  if (!token) {
    return { success: false, error: "Sitzung abgelaufen" };
  }
  const repository = new ManagementUserRepository();
  const result = await repository.authenticateToken(token);

  if (!result.success) {
    return { success: false, error: result.errors };
  }

  return { success: true, salonId: result.data.salonId };
}

/**
 * Splits the request pathname into non-empty segments.
 */
function getPathSegments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

/**
 * Looks up the salonId that owns the given websiteId.
 */
async function getWebsiteSalonId(
  websiteId: string,
): Promise<string | undefined> {
  try {
    const [website] = await db
      .select({ salonId: websitesTable.salonId })
      .from(websitesTable)
      .where(eq(websitesTable.id, websiteId));
    return website?.salonId;
  } catch (error) {
    console.error("Database error:", error);
    return undefined;
  }
}

/**
 * Handles onboarding route authorization and redirects.
 */
async function handleOnboardingRoute(req: NextRequest): Promise<NextResponse> {
  const tokenResult = await auth(req);

  if (!tokenResult.success) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (tokenResult.salonId) {
    return NextResponse.redirect(
      new URL(`/salon/${tokenResult.salonId}`, req.url),
    );
  }

  return NextResponse.next();
}

/**
 * Handles salon route authorization and redirects.
 */
async function handleSalonRoute(req: NextRequest): Promise<NextResponse> {
  const tokenResult = await auth(req);

  if (!tokenResult.success) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const tokenSalonId = tokenResult.salonId;
  const segments = getPathSegments(req.nextUrl.pathname);
  const requestedSalonId = segments[1];

  if (!tokenSalonId) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if (!requestedSalonId) {
    return NextResponse.redirect(new URL(`/salon/${tokenSalonId}`, req.url));
  }

  if (requestedSalonId !== tokenSalonId) {
    return NextResponse.redirect(new URL(`/salon/${tokenSalonId}`, req.url));
  }

  const isWebsiteRoute = segments[2] === "website";
  const requestedWebsiteId = segments[3];

  if (!isWebsiteRoute || !requestedWebsiteId) {
    return NextResponse.next();
  }

  if (requestedWebsiteId === "create") {
    return NextResponse.next();
  }

  const websiteSalonId = await getWebsiteSalonId(requestedWebsiteId);

  if (!websiteSalonId || websiteSalonId !== tokenSalonId) {
    return NextResponse.redirect(
      new URL(`/salon/${tokenSalonId}/website`, req.url),
    );
  }

  return NextResponse.next();
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/onboarding")) {
    return handleOnboardingRoute(req);
  } else if (pathname.startsWith("/salon")) {
    return handleSalonRoute(req);
  }

  return NextResponse.next();
}
