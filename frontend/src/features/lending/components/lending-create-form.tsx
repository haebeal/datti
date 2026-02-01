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
    const selectedUserIds = debtsList
      .map((debt, idx) => {
        if (idx === currentIndex) return null;
        const debtFields = debt.getFieldset();
        return debtFields.userId.initialValue;
      })
      .filter((id): id is string => id !== null && id !== "");

    return members.filter(
      (member) =>
        !selectedUserIds.includes(member.id) && member.id !== currentUserId,
    );
  };

  // 新しいメンバーを追加可能かチェック
  const canAddMoreMembers = () => {
    const selectedUserIds = debtsList
      .map((debt) => {
        const debtFields = debt.getFieldset();
        return debtFields.userId.initialValue;
      })
      .filter((id) => id !== "");
    // 自分自身を除いたメンバー数と比較
    const availableMembersCount = members.filter(
      (m) => m.id !== currentUserId,
    ).length;
    return selectedUserIds.length < availableMembersCount;
  };

  // 割り勘計算を実行
  const handleSplitBill = () => {
    const totalAmount = Number(form.value?.amount) || 0;
    const memberCount = debtsList.length + 1; // メンバー + 支払い者
    const splitAmount = Math.floor(totalAmount / memberCount);

    for (const debt of debtsList) {
      form.update({
        name: debt.getFieldset().amount.name,
        value: splitAmount.toString(),
      });
    }
  };

  // 自分の負担額を計算
  const calculateMyShare = () => {
    const totalAmount = Number(form.value?.amount) || 0;
    const debtsValues = form.value?.debts;
    if (!Array.isArray(debtsValues)) {
      return totalAmount;
    }
    const othersTotal = debtsValues.reduce(
      (sum: number, debt: { amount?: string } | undefined) => {
        return sum + (Number(debt?.amount) || 0);
      },
      0,
    );
    return totalAmount - othersTotal;
  };

  const myShare = calculateMyShare();
  const currentUserName =
    members.find((m) => m.id === currentUserId)?.name || "自分";

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
        defaultValue={
          fields.eventDate.initialValue ||
          new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(
            new Date(),
          )
        }
        placeholder="日付を選択"
        className={cn("w-full")}
        isError={!!fields.eventDate.errors}
      />

      {fields.eventDate.errors && (
        <ErrorText>{fields.eventDate.errors}</ErrorText>
      )}

      <div className={cn("flex justify-between items-center")}>
        <span className={cn("text-sm font-semibold")}>支払い詳細</span>
        <div className={cn("flex gap-2")}>
          <Button
            type="button"
            onPress={handleSplitBill}
            isDisabled={debtsList.length === 0}
            colorStyle="outline"
            color="primary"
            className={cn("text-sm")}
          >
            割り勘
          </Button>
          <Button
            type="button"
            onPress={() => {
              form.insert({
                name: fields.debts.name,
                defaultValue: { userId: "", amount: 0 },
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
      </div>

      {/* 自分の負担額（読み取り専用） */}
      <div className={cn("flex gap-5 items-center")}>
        <div className={cn("flex-1")}>
          <div className={cn("px-3 py-2")}>{currentUserName}</div>
        </div>
        <div className={cn("w-32")}>
          <div className={cn("relative")}>
            <span
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                "pointer-events-none",
              )}
            >
              ¥
            </span>
            <div
              className={cn(
                "px-3 py-2 pl-7",
                myShare < 0 && "text-error-base",
              )}
            >
              {myShare}
            </div>
          </div>
        </div>
        {debtsList.length > 1 && <div className={cn("px-3 py-2 invisible")}>削除</div>}
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
                {debtFields.userId.errors && (
                  <ErrorText>{debtFields.userId.errors}</ErrorText>
                )}
              </div>

              <div className={cn("w-32")}>
                <div className={cn("relative")}>
                  <span
                    className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2",
                      "pointer-events-none",
                    )}
                  >
                    ¥
                  </span>
                  <Input
                    type="number"
                    name={debtFields.amount.name}
                    id={debtFields.amount.id}
                    key={debtFields.amount.key}
                    defaultValue={debtFields.amount.initialValue}
                    placeholder="金額"
                    className={cn("w-full pl-7")}
                  />
                </div>
                {debtFields.amount.errors && (
                  <ErrorText>{debtFields.amount.errors}</ErrorText>
                )}
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
