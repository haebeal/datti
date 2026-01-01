"use client";

import { useTransition } from "react";
import { logout } from "@/features/auth/actions/logout";
import { Button } from "@/components/ui/button";

/**
 * ログアウトボタン
 */
export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <Button
      type="button"
      color="gray"
      colorStyle="outline"
      onPress={handleLogout}
      isDisabled={isPending}
    >
      {isPending ? "ログアウト中..." : "ログアウト"}
    </Button>
  );
}
