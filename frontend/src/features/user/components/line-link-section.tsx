"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/utils/cn";
import { unlinkLine } from "../actions/unlinkLine";

type Props = {
  lineUserId: string | null;
};

export function LineLinkSection({ lineUserId }: Props) {
  const isLinked = lineUserId !== null;
  const [isUnlinking, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUnlink = () => {
    setError(null);
    startTransition(async () => {
      const result = await unlinkLine();
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
      <h2 className={cn("text-lg font-semibold")}>LINE連携</h2>

      {isLinked ? (
        <>
          <p className={cn("text-sm text-foreground-sub")}>
            LINEアカウントと連携済みです
          </p>
          <div className={cn("flex justify-end")}>
            <Button
              color="error"
              colorStyle="outline"
              onPress={handleUnlink}
              isDisabled={isUnlinking}
            >
              {isUnlinking ? "解除中..." : "連携を解除"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className={cn("text-sm text-foreground-sub")}>
            LINEアカウントと連携すると、通知を受け取れるようになります
          </p>
          <div className={cn("flex justify-end")}>
            <LinkButton href="/api/auth/line">LINEと連携する</LinkButton>
          </div>
        </>
      )}

      {error && <p className={cn("text-sm text-error-base")}>{error}</p>}
    </div>
  );
}
