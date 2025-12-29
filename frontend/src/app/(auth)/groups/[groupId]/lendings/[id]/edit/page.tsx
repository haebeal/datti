"use client";

import { getLending } from "@/features/lending/actions/getLending";
import { updateLending } from "@/features/lending/actions/updateLending";
import { deleteLending } from "@/features/lending/actions/deleteLending";
import type { UpdateLendingRequest } from "@/features/lending/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

export default function EditLendingPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;
  const id = params.id as string;

  const [formData, setFormData] = useState<UpdateLendingRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadLending() {
      const result = await getLending(groupId, id);
      if (result.success) {
        setFormData({
          id: result.result.id,
          name: result.result.name,
          amount: result.result.amount,
          eventDate: new Date(result.result.eventDate),
          debts: result.result.debts,
        });
      } else {
        setError(result.error);
      }
    }
    loadLending();
  }, [groupId, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setError(null);
    setIsSubmitting(true);

    const result = await updateLending(groupId, formData);

    if (result.success) {
      router.push(`/groups/${groupId}/lendings/${result.result.id}`);
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？")) return;

    setIsDeleting(true);
    const result = await deleteLending(groupId, id);

    if (result.success) {
      router.push(`/groups/${groupId}/lendings`);
    } else {
      setError(result.error);
      setIsDeleting(false);
    }
  };

  const addDebt = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      debts: [...formData.debts, { userId: "", amount: 0 }],
    });
  };

  const removeDebt = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      debts: formData.debts.filter((_, i) => i !== index),
    });
  };

  const updateDebt = (
    index: number,
    field: "userId" | "amount",
    value: string | number,
  ) => {
    if (!formData) return;
    const newDebts = [...formData.debts];
    newDebts[index] = { ...newDebts[index], [field]: value };
    setFormData({ ...formData, debts: newDebts });
  };

  if (!formData) {
    return <div className={cn("text-gray-500")}>読み込み中...</div>;
  }

  return (
    <div className={cn("max-w-2xl mx-auto")}>
      <h1 className={cn("text-2xl font-bold mb-6")}>立て替え編集</h1>

      {error && (
        <div
          className={cn(
            "mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600",
          )}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={cn("bg-white rounded-lg shadow p-6")}
      >
        <div className={cn("space-y-4")}>
          <div>
            <label
              htmlFor="name"
              className={cn("block text-sm font-medium text-gray-700 mb-1")}
            >
              名前
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-[#0d47a1]",
              )}
              required
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className={cn("block text-sm font-medium text-gray-700 mb-1")}
            >
              合計金額
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: Number(e.target.value) })
              }
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-[#0d47a1]",
              )}
              required
            />
          </div>

          <div>
            <label
              htmlFor="eventDate"
              className={cn("block text-sm font-medium text-gray-700 mb-1")}
            >
              日付
            </label>
            <input
              type="date"
              id="eventDate"
              value={formData.eventDate.toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  eventDate: new Date(e.target.value),
                })
              }
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-[#0d47a1]",
              )}
              required
            />
          </div>

          <div>
            <div className={cn("flex justify-between items-center mb-2")}>
              <label className={cn("block text-sm font-medium text-gray-700")}>
                立て替え詳細
              </label>
              <button
                type="button"
                onClick={addDebt}
                className={cn("text-sm text-[#0d47a1] hover:text-[#0d47a1]")}
              >
                + 追加
              </button>
            </div>
            <div className={cn("space-y-2")}>
              {formData.debts.map((debt, index) => (
                <div key={index} className={cn("flex gap-2")}>
                  <input
                    type="text"
                    placeholder="ユーザーID"
                    value={debt.userId}
                    onChange={(e) =>
                      updateDebt(index, "userId", e.target.value)
                    }
                    className={cn(
                      "flex-1 px-3 py-2 border border-gray-300 rounded-md",
                      "focus:outline-none focus:ring-2 focus:ring-[#0d47a1]",
                    )}
                    required
                  />
                  <input
                    type="number"
                    placeholder="金額"
                    value={debt.amount}
                    onChange={(e) =>
                      updateDebt(index, "amount", Number(e.target.value))
                    }
                    className={cn(
                      "w-32 px-3 py-2 border border-gray-300 rounded-md",
                      "focus:outline-none focus:ring-2 focus:ring-[#0d47a1]",
                    )}
                    required
                  />
                  {formData.debts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDebt(index)}
                      className={cn(
                        "px-3 py-2 text-red-500 hover:text-red-600",
                      )}
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={cn("flex gap-2 pt-4")}>
            <button
              type="button"
              onClick={() => router.back()}
              className={cn(
                "px-4 py-2 border border-gray-300 rounded-md",
                "text-gray-700 hover:bg-gray-50",
              )}
              disabled={isSubmitting || isDeleting}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className={cn(
                "px-4 py-2 border border-red-500 text-red-500 rounded-md",
                "hover:bg-red-50",
              )}
              disabled={isSubmitting || isDeleting}
            >
              {isDeleting ? "削除中..." : "削除"}
            </button>
            <button
              type="submit"
              className={cn(
                "flex-1 px-4 py-2 bg-[#0d47a1] text-white rounded-md",
                "hover:bg-[#1565c0] disabled:opacity-50",
              )}
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting ? "更新中..." : "更新"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
