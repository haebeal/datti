import { getGroup } from "@/features/group/actions/getGroup";
import { getMembers } from "@/features/group/actions/getMembers";
import { GroupBasicInfoForm } from "@/features/group/components/group-basic-info-form";
import { GroupMemberManagement } from "@/features/group/components/group-member-management";
import { cn } from "@/utils/cn";

type Props = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupSettingsPage({ params }: Props) {
  const { groupId } = await params;

  const groupResult = await getGroup(groupId);
  if (!groupResult.success) {
    throw new Error(groupResult.error);
  }
  const group = groupResult.result;

  const membersResult = await getMembers(groupId);
  if (!membersResult.success) {
    throw new Error(membersResult.error);
  }
  const members = membersResult.result;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>グループ設定</h1>

      <GroupBasicInfoForm group={group} />

      <GroupMemberManagement group={group} members={members} />
    </div>
  );
}
