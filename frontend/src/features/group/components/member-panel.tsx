import Image from "next/image";
import { cn } from "@/utils/cn";
import type { GroupMember } from "../types";

type Props = {
  members: GroupMember[];
  creatorId: string;
};

export function MemberPanel({ members, creatorId }: Props) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-xl",
        "overflow-hidden",
      )}
    >
      {/* ヘッダー */}
      <div
        className={cn(
          "flex items-center justify-between",
          "px-4 lg:px-5 py-3 lg:py-4",
        )}
      >
        <p className={cn("text-sm font-semibold text-primary-base")}>
          メンバー ({members.length}人)
        </p>
        <button
          type="button"
          className={cn(
            "px-4 py-2",
            "text-xs font-semibold text-primary-base",
            "bg-white border border-gray-200 rounded-lg",
            "hover:bg-gray-50 transition-colors",
          )}
        >
          + 招待
        </button>
      </div>

      {/* メンバーリスト */}
      {members.map((member, index) => (
        <div
          key={member.id}
          className={cn(
            "flex items-center gap-3",
            "px-4 lg:px-5 py-3.5",
            index > 0 && "border-t border-gray-200",
          )}
        >
          {member.avatar ? (
            <Image
              src={member.avatar}
              alt={member.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                "w-10 h-10 rounded-full",
                "bg-accent-base",
                "flex items-center justify-center",
                "text-white font-bold text-sm",
              )}
            >
              {member.name.charAt(0)}
            </div>
          )}
          <div className={cn("flex-1 min-w-0 flex flex-col gap-0.5")}>
            <p className={cn("text-sm text-primary-base truncate")}>
              {member.name}
            </p>
            {member.id === creatorId && (
              <p className={cn("text-xs text-gray-400")}>作成者</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
