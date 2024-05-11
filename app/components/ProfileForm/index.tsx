import {
  SubmissionResult,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { User } from "~/api/datti/@types";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { userSchema } from "~/schema/user";

interface Props {
  defaultValue?: User;
  lastResult?: SubmissionResult<string[]> | null;
}

export function ProfileForm({ defaultValue, lastResult }: Props) {
  const [form, { uid, name, email, photoUrl }] = useForm({
    defaultValue,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: userSchema });
    },
  });
  const { state } = useNavigation();

  const emailId = useId();
  const nameId = useId();

  return (
    <div className="grid grid-cols-5 px-4">
      <div className="col-span-5 md:col-span-1 p-5">
        <Avatar className="size-full max-md">
          <AvatarImage className="hover:cursor-pointer" src={photoUrl.value} />
        </Avatar>
      </div>
      <Form
        method="POST"
        {...getFormProps(form)}
        className="flex flex-col gap-8 items-center col-span-5 md:col-span-4"
      >
        <Input {...getInputProps(uid, { type: "hidden" })} />
        <Input {...getInputProps(photoUrl, { type: "hidden" })} />
        <div className="w-full">
          <Label htmlFor={emailId}>メールアドレス</Label>
          <Input
            {...getInputProps(email, { type: "email" })}
            readOnly
            disabled={state !== "idle"}
            id={emailId}
            placeholder="datti@example.com"
          />
          <p>{email.errors?.toString()}</p>
        </div>
        <div className="w-full">
          <Label htmlFor={nameId}>ユーザー名</Label>
          <Input
            {...getInputProps(name, { type: "text" })}
            id={nameId}
            disabled={state !== "idle"}
            placeholder="ユーザー名を入力"
          />
          <p>{name.errors?.toString()}</p>
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
