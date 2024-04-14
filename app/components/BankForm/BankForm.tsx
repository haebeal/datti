import {
  SubmissionResult,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { Bank } from "~/api/datti/@types";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { bankAccountSchema } from "~/schema/bank";

interface Props {
  defaultValue?: Bank;
  lastResult?: SubmissionResult<string[]> | null;
}

export function BankForm({ defaultValue, lastResult }: Props) {
  const [form, { accountCode, bankCode, branchCode }] = useForm({
    defaultValue,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: bankAccountSchema });
    },
  });
  const { state } = useNavigation();

  const bankCodeId = useId();
  const branchCodeId = useId();
  const accountCodeId = useId();

  return (
    <div className="px-4">
      <Form
        method="POST"
        {...getFormProps(form)}
        className="flex flex-col gap-8 items-center col-span-4"
      >
        <div className="w-full">
          <Label htmlFor={bankCodeId}>金融機関</Label>
          <Input
            {...getInputProps(bankCode, { type: "text" })}
            disabled={state !== "idle"}
            id={branchCodeId}
          />
          <p>{bankCode.errors?.toString()}</p>
        </div>
        <div className="w-full">
          <Label htmlFor={branchCodeId}>支店</Label>
          <Input
            {...getInputProps(branchCode, { type: "text" })}
            disabled={state !== "idle"}
            id={branchCodeId}
          />
          <p>{branchCode.errors?.toString()}</p>
        </div>
        <div className="w-full">
          <Label htmlFor={accountCodeId}>口座番号</Label>
          <Input
            {...getInputProps(accountCode, { type: "text" })}
            disabled={state !== "idle"}
            id={accountCodeId}
          />
          <p>{accountCode.errors?.toString()}</p>
        </div>
        <Button
          type="submit"
          className="w-full max-w-2xl"
          disabled={state !== "idle"}
        >
          更新
        </Button>
      </Form>
    </div>
  );
}
