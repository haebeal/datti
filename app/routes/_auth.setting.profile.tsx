import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { useActionData, useLoaderData } from "@remix-run/react";
import { authLoader } from "~/.server/loaders";
import { ProfileForm } from "~/components/ProfileForm";
import { createDattiClient } from "~/lib/apiClient";
import { userSchema } from "~/schema/user";

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

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );
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

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );
  await dattiClient.users.me.$put({
    body: {
      name: submission.value.name,
      photoUrl: submission.value.photoUrl,
      bankCode: submission.value.bank.bankCode,
      branchCode: submission.value.bank.branchCode,
      accountCode: submission.value.bank.accountCode,
    },
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
