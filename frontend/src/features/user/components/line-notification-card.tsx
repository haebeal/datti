"use client";

import { useState, useTransition } from "react";
import { Switch } from "react-aria-components";
import { Bell, CalendarClock, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/utils/cn";
import { unlinkLine } from "../actions/unlinkLine";
import { upsertSubscription } from "../actions/upsertSubscription";
import type { Subscription } from "../types";

type Props = {
  lineUserId: string | null;
  subscription: Subscription | null;
};

export function LineNotificationCard({ lineUserId, subscription }: Props) {
  const isLinked = lineUserId !== null;
  const [isUnlinking, startUnlinkTransition] = useTransition();
  const [unlinkError, setUnlinkError] = useState<string | null>(null);

  const [eventFiring, setEventFiring] = useState(
    subscription?.eventFiring ?? true,
  );
  const [weeklySummary, setWeeklySummary] = useState(
    subscription?.weeklySummary ?? true,
  );
  const [isSaving, startSaveTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleUnlink = () => {
    setUnlinkError(null);
    startUnlinkTransition(async () => {
      const result = await unlinkLine();
      if (!result.success) {
        setUnlinkError(result.error);
      }
    });
  };

  const handleToggle = (
    field: "eventFiring" | "weeklySummary",
    value: boolean,
  ) => {
    setSaveError(null);
    const nextEventFiring = field === "eventFiring" ? value : eventFiring;
    const nextWeeklySummary = field === "weeklySummary" ? value : weeklySummary;

    if (field === "eventFiring") setEventFiring(value);
    if (field === "weeklySummary") setWeeklySummary(value);

    startSaveTransition(async () => {
      const result = await upsertSubscription(
        "line",
        nextEventFiring,
        nextWeeklySummary,
      );
      if (!result.success) {
        setSaveError(result.error);
        if (field === "eventFiring") setEventFiring(!value);
        if (field === "weeklySummary") setWeeklySummary(!value);
      }
    });
  };

  if (!isLinked) {
    return (
      <div className={cn("border border-gray-200 rounded-xl", "bg-white", "w-full")}>
        <div className={cn("px-6 py-5", "flex items-center gap-3")}>
          <h2 className={cn("text-base font-semibold")}>LINE連携</h2>
        </div>
        <div className={cn("border-t")} />
        <div className={cn("px-6 py-5", "flex flex-col gap-3")}>
          <p className={cn("text-sm text-gray-500")}>
            LINEアカウントと連携すると、通知を受け取れるようになります
          </p>
          <div className={cn("flex justify-end")}>
            <LinkButton href="/api/auth/line">LINEと連携する</LinkButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border border-gray-200 rounded-xl", "bg-white", "w-full")}>
      <div className={cn("px-6 py-5", "flex items-center gap-3")}>
        <h2 className={cn("text-base font-semibold")}>LINE連携</h2>
        <div className={cn("flex-1")} />
        <span
          className={cn(
            "inline-flex items-center gap-1",
            "px-2.5 py-0.5 rounded-full",
            "bg-success-base text-white text-xs font-semibold",
          )}
        >
          <Check className={cn("w-3 h-3")} />
          連携済み
        </span>
      </div>

      <div className={cn("border-t")} />

      <div className={cn("px-6 py-5", "flex flex-col")}>
        <div className={cn("flex items-center gap-2", "pb-4")}>
          <Bell className={cn("w-4 h-4 text-gray-500")} />
          <span className={cn("text-sm font-semibold")}>通知設定</span>
        </div>

        <Switch
          isSelected={eventFiring}
          onChange={(value) => handleToggle("eventFiring", value)}
          isDisabled={isSaving}
          className={cn(
            "flex items-center gap-3",
            "py-3 border-t",
            "group cursor-pointer",
          )}
        >
          <Zap className={cn("w-5 h-5 text-accent-base shrink-0")} />
          <div className={cn("flex flex-col gap-0.5", "flex-1 min-w-0")}>
            <span className={cn("text-sm font-medium")}>イベント発生通知</span>
            <span className={cn("text-xs text-gray-400")}>
              立て替えが登録されたときに通知を受け取ります
            </span>
          </div>
          <div
            className={cn(
              "w-11 h-6 rounded-full shrink-0",
              "transition-colors",
              "group-data-[selected]:bg-accent-base",
              "bg-gray-200",
              "flex items-center px-0.5",
            )}
          >
            <span
              className={cn(
                "block w-5 h-5 rounded-full bg-white shadow",
                "transition-transform",
                "group-data-[selected]:translate-x-5",
              )}
            />
          </div>
        </Switch>

        <Switch
          isSelected={weeklySummary}
          onChange={(value) => handleToggle("weeklySummary", value)}
          isDisabled={isSaving}
          className={cn(
            "flex items-center gap-3",
            "py-3 border-t",
            "group cursor-pointer",
          )}
        >
          <CalendarClock className={cn("w-5 h-5 text-accent-base shrink-0")} />
          <div className={cn("flex flex-col gap-0.5", "flex-1 min-w-0")}>
            <span className={cn("text-sm font-medium")}>週次サマリー</span>
            <span className={cn("text-xs text-gray-400")}>
              毎週の未精算状況をまとめて通知します
            </span>
          </div>
          <div
            className={cn(
              "w-11 h-6 rounded-full shrink-0",
              "transition-colors",
              "group-data-[selected]:bg-accent-base",
              "bg-gray-200",
              "flex items-center px-0.5",
            )}
          >
            <span
              className={cn(
                "block w-5 h-5 rounded-full bg-white shadow",
                "transition-transform",
                "group-data-[selected]:translate-x-5",
              )}
            />
          </div>
        </Switch>

        <div className={cn("flex justify-end", "pt-4")}>
          <Button
            color="error"
            colorStyle="outline"
            onPress={handleUnlink}
            isDisabled={isUnlinking}
          >
            {isUnlinking ? "解除中..." : "連携を解除"}
          </Button>
        </div>

        {(unlinkError || saveError) && (
          <p className={cn("text-sm text-error-base", "pt-2")}>
            {unlinkError || saveError}
          </p>
        )}
      </div>
    </div>
  );
}
