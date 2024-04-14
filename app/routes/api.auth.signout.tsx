import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/lib/authSession.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const authSession = await getSession(request.headers.get("Cookie"));
  return redirect("/signin", {
    headers: {
      "Set-Cookie": await destroySession(authSession),
    },
  });
};
