import { getAllGroups } from "@/features/group/actions/getAllGroups";
import { cn } from "@/utils/cn";
import { LinkButton } from "@/components/ui/link-button";

export default async function GroupsPage() {
  const result = await getAllGroups();

  if (!result.success) {
    return <div className={cn("text-red-500")}>エラー: {result.error}</div>;
  }

  const groups = result.result;

  return (
    <div className={cn("w-4xl mx-auto", "flex flex-col gap-5")}>
      <div className={cn("flex justify-between items-center")}>
        <h1 className={cn("text-2xl font-bold")}>グループ一覧</h1>
        <LinkButton href="/groups/new">新規グループ作成</LinkButton>
      </div>

      {groups.length === 0 ? (
        <div className={cn("p-4", "flex flex-col gap-3", "border rounded-lg")}>
          <p className={cn("text-center text-gray-500")}>
            グループがまだありません
          </p>
          <div className={cn("flex justify-center")}>
            <LinkButton href="/groups/new">新規グループ作成</LinkButton>
          </div>
        </div>
      ) : (
        groups.map((group) => (
          <div
            key={group.id}
            className={cn("p-4", "flex flex-col gap-3", "border rounded-lg")}
          >
            <h2 className={cn("text-lg font-semibold")}>{group.name}</h2>

            <p className={cn("text-sm")}>作成者: {group.creator.name}</p>

            <div className={cn("flex justify-end gap-5")}>
              <LinkButton
                href={`/groups/${group.id}/settings`}
                color="primary"
                colorStyle="outline"
              >
                設定
              </LinkButton>
              <LinkButton href={`/groups/${group.id}/lendings`}>
                開く
              </LinkButton>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
