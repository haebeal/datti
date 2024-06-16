import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { SigninAction } from "~/.server/actions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { signinWithPasswordFormSchema } from "~/schema/signinWithPasswordFormSchema";

export function SigninWithPasswordForm() {
  const actionData = useActionData<SigninAction>();
  const [form, { email, password }] = useForm({
    lastResult: actionData?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: signinWithPasswordFormSchema,
      });
    },
  });

  const { state } = useNavigation();

  const emailId = useId();
  const passwordId = useId();

  return (
    <Form
      method="post"
      {...getFormProps(form)}
      className="flex flex-col w-full gap-8 items-center col-span-4"
    >
      <div className="w-full">
        <Label htmlFor={emailId}>メールアドレス</Label>
        <Input
          {...getInputProps(email, { type: "email" })}
          placeholder="メールアドレスを入力"
          disabled={state !== "idle"}
          id={emailId}
        />
        <p>{email.errors?.toString()}</p>
      </div>
      <div className="w-full">
        <Label htmlFor={emailId}>パスワード</Label>
        <Input
          {...getInputProps(password, { type: "email" })}
          placeholder="パスワードを入力"
          disabled={state !== "idle"}
          id={passwordId}
        />
        <p>{password.errors?.toString()}</p>
      </div>
      <Button type="submit">ログイン</Button>
    </Form>
  );
}
