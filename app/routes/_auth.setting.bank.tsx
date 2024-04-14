import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BankForm } from "~/components/BankForm";
import { createDattiClient } from "~/lib/apiClient";
import { bankAccountSchema } from "~/schema/bank";
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
  const bankAccount = await dattiClient.bank.$get();

  return {
    bankAccount,
  };
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: bankAccountSchema,
  });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const auth = await authLoader({
    request,
    params,
    context,
  });
  const { idToken } = await auth.json();

  const dattiClient = createDattiClient(idToken);
  await dattiClient.bank.$post({
    body: submission.value,
  });

  return json(submission.reply());
};

export default function BankSetting() {
  const { bankAccount } = useLoaderData<typeof loader>();

  return (
    <>
      <BankForm defaultValue={bankAccount} />
    </>
  );
}
