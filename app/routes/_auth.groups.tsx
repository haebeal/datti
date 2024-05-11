import type { MetaFunction } from "@remix-run/cloudflare";
import { Link, Outlet, useNavigation } from "@remix-run/react";
import { GroupList } from "~/components/GroupList";
import { Button } from "~/components/ui/button";

export { groupsLoader as loader } from "~/.server/loaders";

export const meta: MetaFunction = () => [
  { title: "Datti | グループ一覧" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Group() {
  const { state } = useNavigation();

  return (
    <div className="flex flex-col py-3 gap-7">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">グループ一覧</h1>
        <Link className="flex items-center" to="/groups/create">
          <Button
            disabled={state === "loading"}
            className="bg-sky-500 hover:bg-sky-600 font-semibold"
          >
            グループ作成
          </Button>
        </Link>
      </div>
      <div className="rounded-lg bg-white py-3 px-5">
        <GroupList />
      </div>
      <Outlet />
    </div>
  );
}
