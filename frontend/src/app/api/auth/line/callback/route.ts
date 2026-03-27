import { type NextRequest, NextResponse } from "next/server";
import { linkLine } from "@/features/user/actions/linkLine";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const appUrl = process.env.APP_URL;
  const redirectUri = `${appUrl}/api/auth/line/callback`;

  if (error) {
    console.error("LINE auth error:", error);
    return NextResponse.redirect(
      new URL("/profile?error=line_auth_failed", appUrl),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/profile?error=missing_code", appUrl),
    );
  }

  const result = await linkLine(code, redirectUri);

  if (!result.success) {
    console.error("LINE link error:", result.error);
    return NextResponse.redirect(
      new URL("/profile?error=line_link_failed", appUrl),
    );
  }

  return NextResponse.redirect(
    new URL("/profile?line=linked", appUrl),
  );
}
