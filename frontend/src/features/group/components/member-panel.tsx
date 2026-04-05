"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { X, UserMinus } from "lucide-react";
import {
  Dialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { GroupMember } from "../types";
import { inviteMember } from "../actions/inviteMember";
import { removeMember } from "../actions/removeMember";
import { leaveGroup } from "../actions/leaveGroup";

type Props = {
  groupId: string;
  members: GroupMember[];
  creatorId: string;
  currentUserId: string;
};

export function MemberPanel({ groupId, members, creatorId, currentUserId }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [state, action, isPending] = useActionState(
    inviteMember.bind(null, groupId),
    undefined,
  );
  const [isRemoving, startRemoveTransition] = useTransition();
  const [isLeaving, startLeaveTransition] = useTransition();

  const isCreator = currentUserId === creatorId;

  // 成功したらダイアログを閉じる
  if (state?.success && isDialogOpen) {
    setIsDialogOpen(false);
  }

  const handleRemoveMember = (userId: string) => {
    startRemoveTransition(async () => {
      await removeMember(groupId, userId);
    });
  };

  const handleLeaveGroup = () => {
    startLeaveTransition(async () => {
      await leaveGroup(groupId);
    });
  };

  return (
    <>
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
            "px-4 lg:px-5 py-3",
          )}
        >
          <p className={cn("text-sm font-semibold text-primary-base")}>
            メンバー ({members.length}人)
          </p>
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className={cn(
              "px-4 py-2",
              "text-xs font-semibold text-primary-base",
              "bg-white border border-gray-200 rounded-lg",
              "hover:bg-gray-50 transition-colors cursor-pointer",
            )}
          >
            + 招待
          </button>
        </div>

        {/* メンバーリスト */}
        {members.map((member) => (
          <div
            key={member.id}
            className={cn(
              "flex items-center gap-3",
              "px-4 lg:px-5 py-3",
              "border-t border-gray-200",
            )}
          >
            {member.avatar ? (
              <Image
                src={member.avatar}
                alt={member.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
                unoptimized={process.env.NODE_ENV === "development"}
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
            {/* 作成者が他メンバーを削除できるアイコン */}
            {isCreator && member.id !== creatorId && (
              <button
                type="button"
                onClick={() => handleRemoveMember(member.id)}
                disabled={isRemoving}
                className={cn("p-1 cursor-pointer", "disabled:opacity-50")}
                aria-label={`${member.name}をグループから外す`}
              >
                <UserMinus className="w-4.5 h-4.5 text-gray-400" />
              </button>
            )}
          </div>
        ))}

        {/* グループから抜ける */}
        {!isCreator && (
          <button
            type="button"
            onClick={handleLeaveGroup}
            disabled={isLeaving}
            className={cn(
              "w-full",
              "flex items-center justify-center",
              "px-5 py-3",
              "border-t border-gray-200",
              "text-xs font-medium text-error-base",
              "hover:bg-gray-50 transition-colors cursor-pointer",
              "disabled:opacity-50",
            )}
          >
            {isLeaving ? "処理中..." : "グループから抜ける"}
          </button>
        )}
      </div>

      {/* 招待ダイアログ */}
      <ModalOverlay
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        className={cn(
          "fixed inset-0 z-50",
          "bg-black/40",
          "flex items-center justify-center",
          "p-4",
        )}
        isDismissable
      >
        <Modal
          className={cn(
            "w-full max-w-[480px]",
            "bg-white",
            "rounded-xl",
            "shadow-xl",
            "outline-none",
          )}
        >
          <Dialog className={cn("p-6 lg:p-8", "flex flex-col gap-5", "outline-none")}>
            {({ close }) => (
              <form action={action}>
                <div className={cn("flex flex-col gap-5")}>
                  <div className={cn("flex items-center")}>
                    <h2 className={cn("text-xl font-bold text-primary-base")}>
                      メンバーを招待
                    </h2>
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={close}
                      className="p-1 cursor-pointer"
                      aria-label="閉じる"
                    >
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>

                  <p className={cn("text-xs text-gray-500")}>
                    招待するメンバーのメールアドレスを入力してください
                  </p>

                  <Input
                    type="email"
                    name="email"
                    placeholder="メールアドレス"
                    className="w-full"
                    required
                  />

                  {state?.error && (
                    <p className={cn("text-sm text-error-base")}>{state.error}</p>
                  )}

                  <div className={cn("flex justify-end gap-2")}>
                    <Button
                      type="button"
                      onPress={close}
                      colorStyle="outline"
                      color="primary"
                      isDisabled={isPending}
                    >
                      キャンセル
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      colorStyle="fill"
                      isDisabled={isPending}
                      className="bg-accent-base border-accent-base"
                    >
                      {isPending ? "招待中..." : "招待する"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
