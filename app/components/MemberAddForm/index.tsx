import { Form, useLocation, useNavigation } from "@remix-run/react";
import { useId } from "react";
import { MemberAddList } from "~/components/MemberAddList";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function MemberAddForm() {
  const { search } = useLocation();
  const { state } = useNavigation();
  const searchParams = new URLSearchParams(search);

  const searchQuery = searchParams.get("q") ?? undefined;
  const searchId = useId();

  return (
    <div className="flex flex-col items-center p-4 gap-9">
      <Form method="get" className="w-full">
        <div className="w-full flex items-end gap-3">
          <div className="grow">
            <Label htmlFor={searchId}>検索</Label>
            <Input
              placeholder="メールアドレスを入力"
              defaultValue={searchQuery}
              name="q"
              disabled={state !== "idle"}
            />
          </div>
          <Button
            type="submit"
            className="bg-sky-500 hover:bg-sky-600  font-semibold"
            disabled={state !== "idle"}
          >
            検索
          </Button>
        </div>
      </Form>
      <div className="flex flex-col gap-3 w-full h-80 overflow-y-auto">
        <MemberAddList />
      </div>
    </div>
  );
}
