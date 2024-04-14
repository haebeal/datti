import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { ProfileForm } from "~/components/ProfileForm";
import { createDattiClient } from "~/lib/apiClient";
import { userSchema } from "~/schema/user";
import { loader as authLoader } from "./_auth";

export const loader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  const auth = await authLoader({
    request,
    params,
    context,
  });
  const { idToken } = await auth.json();

  const dattiClient = createDattiClient(idToken);
  const profile = await dattiClient.users.me.$get();

  return {
    profile,
  };
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: userSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const auth = await authLoader({ request, params, context });
  const { idToken } = await auth.json();

  const dattiClient = createDattiClient(idToken);
  await dattiClient.users.me.$put({
    body: submission.value,
  });

  return json(submission.reply());
};

export default function ProfileSetting() {
  const { profile } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();

  return (
    <>
      <ProfileForm defaultValue={profile} lastResult={lastResult} />
    </>
  );
}
