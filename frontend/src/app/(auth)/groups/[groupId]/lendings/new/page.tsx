import { getMembers } from "@/features/group/actions/getMembers";
import { LendingForm } from "@/features/lending/components/lending-form";
import { cn } from "@/utils/cn";

export default async function CreateLendingPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const result = await getMembers(groupId);

  if (!result.success) {
    return <div className={cn("text-red-500")}>エラー: {result.error}</div>;
  }

  const members = result.result;

  return <LendingForm groupId={groupId} members={members} />;
}
