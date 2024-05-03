import {
  SubmissionResult,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { GroupCreateRequest } from "~/api/datti/@types";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { groupSchema } from "~/schema/group";

interface Props {
  defaultValue?: GroupCreateRequest;
  lastResult?: SubmissionResult<string[] | null>;
}

export function GroupForm({ defaultValue, lastResult }: Props) {
  const [form, { name }] = useForm({
    defaultValue,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: groupSchema,
      });
    },
  });
  const { state } = useNavigation();

  const nameId = useId();

  return (
    <div className="px-4">
      <Form
        method="POST"
        {...getFormProps(form)}
        className="flex flex-col gap-8 items-center col-span-4"
      >
        <div className="w-full">
          <Label htmlFor={nameId}>グループ名</Label>
          <Input
            {...getInputProps(name, { type: "text" })}
            placeholder="グループ名を入力"
            disabled={state !== "idle"}
            id={nameId}
          />
          <p>{name.errors?.toString()}</p>
        </div>
        <Button
          type="submit"
          className="w-full max-w-2xl"
          disabled={state !== "idle"}
        >
          作成
        </Button>
      </Form>
    </div>
  );
}
