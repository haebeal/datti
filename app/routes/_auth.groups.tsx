import type { MetaFunction } from "@remix-run/cloudflare";
import { Link, Outlet, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => [
  { title: "Datti | グループ一覧" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Group() {
  const { state } = useNavigation();

  return (
    <div>
      <h1 className="font-bold text-2xl">グループ一覧</h1>
      <div className="flex items-center">
        <Button
          disabled={state === "loading"}
          className="ml-auto bg-blue-500 hover:bg-blue-600 font-semibold"
        >
          <Link to="/groups/create">グループ作成</Link>
        </Button>
      </div>
      <Outlet />
    </div>
  );
}
