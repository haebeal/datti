import { useLoaderData } from "@remix-run/react";
import { SettingsLoader } from "~/.server/loaders";
import { BankForm } from "~/components/BankForm";

export { settingsAction as action } from "~/.server/actions";
export { settingsLoader as loader } from "~/.server/loaders";

export default function BankSetting() {
  const { bankAccount } = useLoaderData<SettingsLoader>();

  return (
    <>
      <BankForm defaultValue={bankAccount} />
    </>
  );
}
