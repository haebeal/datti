import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { UserList } from "~/components/UserList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { createDattiClient } from "~/lib/apiClient";
import { loader as authLoader } from "./_auth";

export const loader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  console.log("start friends.requests loader");
  const start = performance.now();

  const auth = await authLoader({
    request,
    params,
    context,
  });
  const { profile, idToken } = await auth.json();

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const users = (await dattiClient.users.$get()).users.filter(
    (user) => user.uid !== profile.uid
  );
  const { users: friends } = await dattiClient.friends.$get();
  const { users: requests } = await dattiClient.friends.requests.$get();
  const { users: pendings } = await dattiClient.friends.pendings.$get();

  const end = performance.now();
  console.log(`end friends.requests loader at ${end - start}ms`);

  return { users, friends, requests, pendings };
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

export default function FriendRequest() {
  const navigate = useNavigate();
  const { users } = useLoaderData<typeof loader>();

  return (
    <Dialog
      defaultOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          navigate("/friends");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>フレンド申請</DialogTitle>
        </DialogHeader>
        <UserList users={users} />
      </DialogContent>
    </Dialog>
  );
}
