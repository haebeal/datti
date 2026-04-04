"use client";

import { useState, useTransition } from "react";
import { Switch } from "react-aria-components";
import { cn } from "@/utils/cn";
import { upsertSubscription } from "../actions/upsertSubscription";
import type { Subscription } from "../types";

type Props = {
  subscription: Subscription | null;
  isLineLinked: boolean;
};

export function NotificationSection({ subscription, isLineLinked }: Props) {
  const [eventFiring, setEventFiring] = useState(
    subscription?.eventFiring ?? true,
  );
  const [weeklySummary, setWeeklySummary] = useState(
    subscription?.weeklySummary ?? true,
  );
  const [isSaving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (
    field: "eventFiring" | "weeklySummary",
    value: boolean,
  ) => {
    setError(null);
    const nextEventFiring = field === "eventFiring" ? value : eventFiring;
    const nextWeeklySummary = field === "weeklySummary" ? value : weeklySummary;

    if (field === "eventFiring") setEventFiring(value);
    if (field === "weeklySummary") setWeeklySummary(value);

    startTransition(async () => {
      const result = await upsertSubscription(
        "line",
        nextEventFiring,
        nextWeeklySummary,
      );
      if (!result.success) {
        setError(result.error);
        if (field === "eventFiring") setEventFiring(!value);
        if (field === "weeklySummary") setWeeklySummary(!value);
      }
    });
  };

  if (!isLineLinked) {
    return (
      <div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
        <h2 className={cn("text-lg font-semibold")}>LINE通知設定</h2>
        <p className={cn("text-sm text-foreground-sub")}>
          LINE連携すると通知設定���有効になります
        </p>
      </div>
    );
  }

  return (
    <div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
      <h2 className={cn("text-lg font-semibold")}>LINE通知設定</h2>

      <div className={cn("flex flex-col gap-4")}>
        <Switch
          isSelected={eventFiring}
          onChange={(value) => handleToggle("eventFiring", value)}
          isDisabled={isSaving}
          className={cn("flex items-center justify-between gap-4", "group")}
        >
          <div className={cn("flex flex-col")}>
            <span className={cn("text-sm font-medium")}>イベント発生通知</span>
            <span className={cn("text-xs text-foreground-sub")}>
              立て替えが登録されたときに通知を受け取ります
            </span>
          </div>
          <div
            className={cn(
              "w-10 h-6 rounded-full",
              "border border-foreground-sub/30",
              "transition-colors",
              "group-data-[selected]:bg-primary-base group-data-[selected]:border-primary-base",
              "bg-foreground-sub/20",
              "flex items-center px-0.5",
            )}
          >
            <span
              className={cn(
                "block w-5 h-5 rounded-full bg-white shadow",
                "transition-transform",
                "group-data-[selected]:translate-x-4",
              )}
            />
          </div>
        </Switch>

        <Switch
          isSelected={weeklySummary}
          onChange={(value) => handleToggle("weeklySummary", value)}
          isDisabled={isSaving}
          className={cn("flex items-center justify-between gap-4", "group")}
        >
          <div className={cn("flex flex-col")}>
            <span className={cn("text-sm font-medium")}>週次サマリー</span>
            <span className={cn("text-xs text-foreground-sub")}>
              毎週の未精算状況をまとめて通知します
            </span>
          </div>
          <div
            className={cn(
              "w-10 h-6 rounded-full",
              "border border-foreground-sub/30",
              "transition-colors",
              "group-data-[selected]:bg-primary-base group-data-[selected]:border-primary-base",
              "bg-foreground-sub/20",
              "flex items-center px-0.5",
            )}
          >
            <span
              className={cn(
                "block w-5 h-5 rounded-full bg-white shadow",
                "transition-transform",
                "group-data-[selected]:translate-x-4",
              )}
            />
          </div>
        </Switch>
      </div>

      {error && <p className={cn("text-sm text-error-base")}>{error}</p>}
    </div>
  );
}
