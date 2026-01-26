import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import z from "zod";
import { createApiClient } from "@/libs/api/client";
import { createSession } from "@/libs/session/session";

const cognitoTokenSchema = z.object({
  access_token: z.string(),
  id_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
});

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const searchParams = request.nextUrl.searchParams;

  const error = searchParams.get("error");
  if (error) {
    redirect("/auth?error=auth_failed");
  }

  const code = searchParams.get("code");
  if (!code) {
    redirect("/auth?error=no_token");
  }

  try {
    console.log("Starting Cognito token exchange...");
    console.log("COGNITO_DOMAIN:", process.env.COGNITO_DOMAIN);
    console.log("COGNITO_CLIENT_ID:", process.env.COGNITO_CLIENT_ID);
    console.log("APP_URL:", process.env.APP_URL);

    const tokenResponse = await fetch(
      `${process.env.COGNITO_DOMAIN}/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.COGNITO_CLIENT_ID,
          code,
          redirect_uri: `${process.env.APP_URL}/api/auth/cognito/callback`,
        }),
        cache: "no-store",
      },
    );
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`Cognito token exchange failed: ${errorText}`);
      return redirect("/auth?error=auth_failed");
    }

    const tokenJson = await tokenResponse.json();
    const { access_token, refresh_token, id_token, expires_in } =
      cognitoTokenSchema.parse(tokenJson);

    const client = createApiClient(access_token);
    const loginResponse = await client.GET("/auth/login");

    if (loginResponse.data) {
      // ログイン成功時
      const sessionId = await createSession(
        access_token,
        refresh_token,
        expires_in,
      );

      cookieStore.set("session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.redirect(new URL("/", process.env.APP_URL));
    }

    if (loginResponse.response.status === 401) {
      // ユーザーが存在しない際は、サインアップ
      const payload = JSON.parse(
        Buffer.from(id_token.split(".")[1], "base64").toString(),
      );
      const signupResponse = await client.POST("/auth/signup", {
        body: {
          name: payload.name || payload.email,
          email: payload.email,
          avatar: payload.picture || "",
        },
      });

      if (signupResponse.data) {
        const sessionId = await createSession(
          access_token,
          refresh_token,
          expires_in,
        );

        cookieStore.set("session_id", sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        });

        return NextResponse.redirect(new URL("/", process.env.APP_URL));
      }
    }

    console.error("Login/Signup failed, loginResponse:", loginResponse);
    return redirect("/auth?error=signup_failed");
  } catch (error) {
    console.error("Auth callback error:", error);
    return redirect("/auth?error=server_error");
  }
}
