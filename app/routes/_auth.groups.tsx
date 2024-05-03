import type { MetaFunction } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import { GroupsLoader } from "~/.server/loaders/groupsLoader";
import { GroupList } from "~/components/GroupList";
import { Button } from "~/components/ui/button";

export { groupsLoader as loader } from "~/.server/loaders";

export const meta: MetaFunction = () => [
  { title: "Datti | グループ一覧" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Group() {
  const { groups } = useLoaderData<GroupsLoader>();
  const { state } = useNavigation();

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-bold text-2xl">グループ一覧</h1>
      <Link className="flex items-center" to="/groups/create">
        <Button
          disabled={state === "loading"}
          className="ml-auto bg-blue-500 hover:bg-blue-600 font-semibold"
        >
          グループ作成
        </Button>
      </Link>
      <div className="w-full">
        <GroupList groups={groups} />
      </div>
      <Outlet />
    </div>
  );
}
