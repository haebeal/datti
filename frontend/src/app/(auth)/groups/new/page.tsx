import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GroupCreateForm } from "@/features/group/components/group-create-form";
import { cn } from "@/utils/cn";

export default function CreateGroupPage() {
  return (
    <div className={cn("w-full", "flex flex-col gap-6")}>
      <div className={cn("hidden sm:flex items-center gap-3")}>
        <Link
          href="/groups"
          className={cn("p-2 -ml-2 rounded-md", "hover:bg-transparent")}
          aria-label="戻る"
        >
          <ArrowLeft className="w-6 h-6 text-gray-500" />
        </Link>
        <h1 className={cn("text-3xl font-bold text-primary-base")}>
          グループをつくる
        </h1>
      </div>

      <GroupCreateForm />
    </div>
  );
}
