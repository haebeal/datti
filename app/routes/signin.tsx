import { Form, useActionData } from "@remix-run/react";
import { SigninWithPasswordForm } from "~/components/SigninWithPasswordForm";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

import type { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import { SigninAction } from "~/.server/actions";
import { useToast } from "~/components/ui/use-toast";

export { signinAction as action } from "~/.server/actions";

export const meta: MetaFunction = () => [
  { title: "Datti | ログイン" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function SignIn() {
  const { toast } = useToast();

  const actionData = useActionData<SigninAction>();
  useEffect(() => {
    if (actionData) {
      toast({
        title: actionData.message,
      });
    }
  }, [actionData, toast]);

  return (
    <div className="grid place-content-center h-screen">
      <div className="rounded-md bg-white px-6 py-8 w-160 flex flex-col items-center gap-5">
        <h1 className="font-bold text-5xl">Datti</h1>
        <h2 className="text-center">
          誰にいくら払ったっけ？
          <br />
          を記録するサービス
        </h2>
        <Separator />
        {process.env.NODE_ENV !== "production" && (
          <>
            <SigninWithPasswordForm />
            <Separator />
          </>
        )}
        <Form action="/api/auth/signin" method="post">
          <Button type="submit">Googleでログイン</Button>
        </Form>
      </div>
    </div>
  );
}
