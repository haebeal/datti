import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import { FriendList } from "~/components/FriendList";
import { Button } from "~/components/ui/button";
import { createDattiClient } from "~/lib/apiClient";
import { loader as authLoader } from "./_auth";

export const loader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  console.log("start friends loader");
  const start = performance.now();

  const auth = await authLoader({
    request,
    params,
    context,
  });
  const { idToken, profile } = await auth.json();

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const { users: friends } = await dattiClient.friends.$get();
  const users = (await dattiClient.users.$get()).users.filter(
    (user) => user.uid !== profile.uid
  );

  const end = performance.now();
  console.log(`end friends loader at ${end - start}ms`);

  return {
    users,
    friends,
  };
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const uid = formData.get("uid");

  if (typeof uid !== "string") {
    throw new Error();
  }

  const auth = await authLoader({ request, params, context });
  const { idToken } = await auth.json();

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  if (request.method === "POST") {
    await dattiClient.users._uid(uid).requests.$post();
  } else if (request.method === "DELETE") {
    await dattiClient.friends._uid(uid).$delete();
  }

  return json({});
};

export default function Friend() {
  const { friends } = useLoaderData<typeof loader>();
  const { state } = useNavigation();

  return (
    <div className="grid gap-5">
      <h1 className="font-bold text-2xl py-2">フレンド一覧</h1>
      <div className="flex items-center">
        <Button
          disabled={state === "loading"}
          className="ml-auto bg-blue-500 hover:bg-blue-600 font-semibold"
        >
          <Link to="/friends/requests">フレンド申請</Link>
        </Button>
      </div>
      <div className="w-full">
        <FriendList friends={friends} />
      </div>
      <Outlet />
    </div>
  );
}
