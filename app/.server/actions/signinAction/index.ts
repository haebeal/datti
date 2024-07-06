import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { getAuthSessionStorage } from "~/lib/authSession.server";
import { signInFirebaseWithPassword } from "~/lib/oauthClient.server";
import { signinWithPasswordFormSchema } from "~/schema/signinWithPasswordFormSchema";

export const signinAction = async ({
  request,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();

  // パスワードによるサインイン処理
  if (request.method === "POST") {
    const submission = parseWithZod(formData, {
      schema: signinWithPasswordFormSchema,
    });
    if (submission.status !== "success") {
      return json({
        message: "バリデーションに失敗しました",
        submission: submission.reply(),
      });
    }

    try {
      const { idToken, refreshToken, expiresIn } =
        await signInFirebaseWithPassword(
          context.cloudflare.env.FIREBASE_TENANT_ID,
          context.cloudflare.env.FIREBASE_API_KEY,
          submission.value.email,
          submission.value.password
        );
      const dt = new Date();
      dt.setSeconds(dt.getSeconds() + Number(expiresIn));

      const authSessionStorage = getAuthSessionStorage(context);
      const authSession = await authSessionStorage.getSession(
        request.headers.get("Cookie")
      );

      authSession.set("idToken", idToken);
      authSession.set("refreshToken", refreshToken);
      authSession.set("expiresDateTime", dt.toISOString());

      return redirect("/", {
        headers: {
          "Set-Cookie": await authSessionStorage.commitSession(authSession),
        },
      });
    } catch (error) {
      return json({
        message: "ログインに失敗しました",
        submission: submission.reply(),
      });
    }
  }
};

export type SigninAction = typeof signinAction;
