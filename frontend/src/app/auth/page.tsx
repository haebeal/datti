"use client";

import { useSearchParams } from "next/navigation";
import { LinkButton } from "@/components/ui/link-button/link-button";
import { cn } from "@/utils/cn";

const ERROR_MESSAGES: Record<string, string> = {
  no_result: "認証結果が取得できませんでした",
  no_token: "認証トークンが取得できませんでした",
  auth_failed: "認証に失敗しました",
  signup_failed: "ユーザー登録に失敗しました",
  server_error: "サーバーエラーが発生しました",
};

/**
 * 認証ページ
 * サーバーサイドでGoogle OAuth認証を実行
 * ログインとサインアップを自動判定
 */
export default function AuthPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const error = errorParam ? ERROR_MESSAGES[errorParam] || errorParam : null;

  return (
    <div
      className={cn(
        "min-h-screen",
        "flex items-center justify-center",
        "bg-background",
        "p-4",
      )}
    >
      <div className={cn("w-full max-w-md", "flex flex-col gap-6")}>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">ログイン</h1>
          <p className="text-gray-600">Googleアカウントで認証してください</p>
        </div>

        <LinkButton href="/api/auth/google" color="primary" colorStyle="fill">
          Googleで続ける
        </LinkButton>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
