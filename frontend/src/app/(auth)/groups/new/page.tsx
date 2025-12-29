import { GroupCreateForm } from "@/features/group/components/group-create-form";
import { cn } from "@/utils/cn";

export default function CreateGroupPage() {
  return (
    <div className={cn("w-4xl mx-auto", "flex flex-col gap-5")}>
      <h1 className={cn("text-2xl font-bold")}>新規グループ作成</h1>

      <GroupCreateForm />
    </div>
  );
}
