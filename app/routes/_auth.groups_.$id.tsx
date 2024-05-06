import { MetaFunction } from "@remix-run/cloudflare";
import { NavLink, Outlet, useLoaderData, useMatches } from "@remix-run/react";
import { GroupLoader } from "~/.server/loaders";

export { groupLoader as loader } from "~/.server/loaders";

export const meta: MetaFunction = () => [
  { title: "Datti | グループ詳細" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function GroupDetail() {
  const macthes = useMatches();
  const { params } = macthes[0];
  const groupId = params.id;

  const { group } = useLoaderData<GroupLoader>();

  return (
    <div className="flex flex-col py-3 gap-7">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">{group.name}</h1>
      </div>
      <div className="rounded-lg bg-white py-3 px-5">
        <div className="flex flex-row border-b-2 text-lg font-semibold gap-5 py-1 px-4">
          <NavLink
            className={({ isActive }) => (isActive ? undefined : "opacity-40")}
            to={`/groups/${groupId}/events`}
          >
            イベント
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? undefined : "opacity-40")}
            to={`/groups/${groupId}/members`}
          >
            メンバー
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? undefined : "opacity-40")}
            to={`/groups/${groupId}/settings`}
          >
            設定
          </NavLink>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
