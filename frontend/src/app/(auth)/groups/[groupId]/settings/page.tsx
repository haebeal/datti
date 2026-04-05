import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGroup } from "@/features/group/actions/getGroup";
import { GroupBasicInfoForm } from "@/features/group/components/group-basic-info-form";
import { getMe } from "@/features/user/actions/getMe";
import { cn } from "@/utils/cn";

type Props = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupSettingsPage({ params }: Props) {
  const { groupId } = await params;

  const [groupResult, meResult] = await Promise.all([
    getGroup(groupId),
    getMe(),
  ]);

  if (!groupResult.success) {
    throw new Error(groupResult.error);
  }
  const group = groupResult.result;

  if (!meResult.success) {
    throw new Error(meResult.error);
  }
  const currentUserId = meResult.user.id;

  return (
    <div className={cn("w-full", "flex flex-col items-center gap-6")}>
      <div className={cn("hidden sm:flex items-center gap-3", "w-full max-w-[640px]")}>
        <Link
          href={`/groups/${groupId}/lendings`}
          className={cn("p-2 -ml-2 rounded-md", "hover:bg-transparent")}
          aria-label="戻る"
        >
          <ArrowLeft className="w-6 h-6 text-gray-500" />
        </Link>
        <h1 className={cn("text-3xl font-bold text-primary-base")}>
          グループ設定
        </h1>
      </div>

      <GroupBasicInfoForm group={group} currentUserId={currentUserId} />
    </div>
  );
}
