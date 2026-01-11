"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { ErrorText } from "@/components/ui/error-text";
import { createLending } from "../actions/createLending";
import { createLendingSchema } from "../schema";
import type { GroupMember } from "@/features/group/types";

type Props = {
  groupId: string;
  members: GroupMember[];
  currentUserId: string;
};

export function LendingCreateForm({ groupId, members, currentUserId }: Props) {
  const [lastResult, action, isCreating] = useActionState(
    createLending.bind(null, groupId),
    undefined,
  );

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      debts: [{ userId: "", amount: 0 }],
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createLendingSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const debtsList = fields.debts.getFieldList();

  // 各行で選択可能なメンバーを取得（既に選択されているメンバーと自分自身を除外）
  const getAvailableMembers = (currentIndex: number) => {
    const selectedUserIds = debtsList.map((debt, idx) => {
      if (idx === currentIndex) return null;
      const debtFields = debt.getFieldset();
      return debtFields.userId.initialValue;
    }).filter((id): id is string => id !== null && id !== "");

    return members.filter((member) => !selectedUserIds.includes(member.id) && member.id !== currentUserId);
  };

  // 新しいメンバーを追加可能かチェック
  const canAddMoreMembers = () => {
    const selectedUserIds = debtsList.map((debt) => {
      const debtFields = debt.getFieldset();
      return debtFields.userId.initialValue;
    }).filter((id) => id !== "");
    // 自分自身を除いたメンバー数と比較
    const availableMembersCount = members.filter(m => m.id !== currentUserId).length;
    return selectedUserIds.length < availableMembersCount;
  };

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}
    >
      <h2 className={cn("text-lg font-semibold")}>イベント情報</h2>

      <label htmlFor={fields.name.id} className={cn("text-sm")}>
        名前
      </label>

      <Input
        type="text"
        name={fields.name.name}
        id={fields.name.id}
        key={fields.name.key}
        defaultValue={fields.name.initialValue}
        placeholder="例: ランチ代, 飲み会"
        className={cn("w-full")}
      />

      {fields.name.errors && <ErrorText>{fields.name.errors}</ErrorText>}

      <label htmlFor={fields.amount.id} className={cn("text-sm")}>
        合計金額
      </label>

      <Input
        type="number"
        name={fields.amount.name}
        id={fields.amount.id}
        key={fields.amount.key}
        defaultValue={fields.amount.initialValue}
        placeholder="0"
        className={cn("w-full")}
      />

      {fields.amount.errors && <ErrorText>{fields.amount.errors}</ErrorText>}

      <label htmlFor={fields.eventDate.id} className={cn("text-sm")}>
        日付
      </label>

      <DatePicker
        name={fields.eventDate.name}
        id={fields.eventDate.id}
        key={fields.eventDate.key}
        defaultValue={fields.eventDate.initialValue || new Date().toISOString().split("T")[0]}
        placeholder="日付を選択"
        className={cn("w-full")}
        isError={!!fields.eventDate.errors}
      />

      {fields.eventDate.errors && <ErrorText>{fields.eventDate.errors}</ErrorText>}

      <div className={cn("flex justify-between items-center")}>
        <label className={cn("text-sm font-semibold")}>
          支払い詳細
        </label>
        <Button
          type="button"
          onPress={() => {
            form.insert({
              name: fields.debts.name,
              defaultValue: { userId: "", amount: 0 }
            });
          }}
          isDisabled={!canAddMoreMembers()}
          colorStyle="outline"
          color="primary"
          className={cn("text-sm")}
        >
          + 追加
        </Button>
      </div>

      <div className={cn("flex flex-col gap-3")}>
        {debtsList.map((debt, index) => {
          const debtFields = debt.getFieldset();
          const availableMembers = getAvailableMembers(index);

          return (
            <div key={debt.key} className={cn("flex gap-5 items-start")}>
              <div className={cn("flex-1")}>
                <Select<GroupMember>
                  name={debtFields.userId.name}
                  id={debtFields.userId.id}
                  key={debtFields.userId.key}
                  defaultValue={debtFields.userId.initialValue}
                  placeholder="メンバーを選択"
                  options={availableMembers}
                  getOptionLabel={(member) => member.name}
                  getOptionValue={(member) => member.id}
                  isError={!!debtFields.userId.errors}
                  className={cn("w-full")}
                  required
                />
                {debtFields.userId.errors && <ErrorText>{debtFields.userId.errors}</ErrorText>}
              </div>

              <div className={cn("w-32")}>
                <Input
                  type="number"
                  name={debtFields.amount.name}
                  id={debtFields.amount.id}
                  key={debtFields.amount.key}
                  defaultValue={debtFields.amount.initialValue}
                  placeholder="金額"
                  className={cn("w-full")}
                />
                {debtFields.amount.errors && <ErrorText>{debtFields.amount.errors}</ErrorText>}
              </div>

              {debtsList.length > 1 && (
                <Button
                  type="button"
                  onPress={() => {
                    form.remove({ name: fields.debts.name, index });
                  }}
                  color="error"
                  colorStyle="outline"
                  className={cn("px-3 py-2")}
                >
                  削除
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {fields.debts.errors && <ErrorText>{fields.debts.errors}</ErrorText>}

      {form.errors && <ErrorText>{form.errors}</ErrorText>}

      <div className={cn("flex justify-end gap-5")}>
        <Button type="submit" isDisabled={isCreating}>
          {isCreating ? "作成中..." : "作成"}
        </Button>
      </div>
    </form>
  );
}
