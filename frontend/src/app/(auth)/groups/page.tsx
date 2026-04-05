import { Users } from "lucide-react";
import { getAllGroups } from "@/features/group/actions/getAllGroups";
import { cn } from "@/utils/cn";
import { LinkButton } from "@/components/ui/link-button";
import Link from "next/link";

export default async function GroupsPage() {
  const result = await getAllGroups();

  if (!result.success) {
    return <div className={cn("text-error-base")}>エラー: {result.error}</div>;
  }

  const groups = result.result;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-6")}>
      <div className={cn("flex items-center")}>
        <h1
          className={cn(
            "hidden sm:block",
            "text-3xl font-bold text-primary-base",
          )}
        >
          グループ
        </h1>
        {groups.length > 0 && (
          <>
            <div className="flex-1" />
            <LinkButton
              href="/groups/new"
              color="accent"
              colorStyle="fill"
              className="px-6 py-2.5"
            >
              <span className="sm:hidden">+ つくる</span>
              <span className="hidden sm:inline">+ グループをつくる</span>
            </LinkButton>
          </>
        )}
      </div>

      {groups.length === 0 ? (
        <div
          className={cn(
            "flex-1",
            "flex flex-col items-center justify-center gap-4",
            "min-h-[40vh]",
          )}
        >
          <p className={cn("text-sm text-gray-500")}>
            グループがまだありません
          </p>
          <LinkButton
            href="/groups/new"
            color="accent"
            colorStyle="fill"
            className="px-6 py-2.5"
          >
            + グループをつくる
          </LinkButton>
        </div>
      ) : (
        <div className={cn("flex flex-col gap-3 lg:gap-4", "max-w-[640px]")}>
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}/lendings`}
              className={cn(
                "p-4 lg:p-5",
                "flex flex-col gap-3",
                "bg-white border border-gray-200 rounded-xl",
                "hover:bg-gray-50 transition-colors",
              )}
            >
              {/* 上段: アイコン + グループ名 + 設定 */}
              <div className={cn("flex items-center gap-3")}>
                <Users className="w-5 h-5 text-accent-base flex-shrink-0" />
                <span className={cn("text-base font-semibold text-primary-base truncate")}>
                  {group.name}
                </span>
              </div>

              {/* 下段: メタ情報 */}
              <div className={cn("flex items-center gap-4")}>
                <span className={cn("text-xs text-gray-500")}>
                  作成者: {group.creator.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
