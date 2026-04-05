import Image from "next/image";
import { Globe, MessageCircle } from "lucide-react";

import { LinkButton } from "@/components/ui/link-button/link-button";
import { cn } from "@/utils/cn";

const ERROR_MESSAGES: Record<string, string> = {
  no_result: "認証結果が取得できませんでした",
  no_token: "認証トークンが取得できませんでした",
  auth_failed: "認証に失敗しました",
  signup_failed: "ユーザー登録に失敗しました",
  server_error: "サーバーエラーが発生しました",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

/**
 * 認証ページ
 * サーバーサイドでGoogle OAuth認証を実行
 * ログインとサインアップを自動判定
 */
export default async function AuthPage({ searchParams }: Props) {
  const { error: errorParam } = await searchParams;
  const error = errorParam ? ERROR_MESSAGES[errorParam] || errorParam : null;

  return (
    <div className={cn("min-h-screen", "flex", "bg-white")}>
      {/* 左パネル - デスクトップのみ */}
      <div
        className={cn(
          "hidden lg:flex",
          "flex-1",
          "flex-col items-center justify-center",
          "bg-primary-base",
          "p-12",
          "gap-4",
        )}
      >
        <div className={cn("flex items-center gap-1")}>
          <Image
            src="/logo.svg"
            alt=""
            width={56}
            height={56}
            className="w-14 h-14 border-2 border-white rounded-xl"
          />
          <span className="text-5xl font-bold text-white">atti</span>
        </div>
        <p className="text-xl text-white/70">
          割り勘・立て替えを簡単に管理
        </p>
      </div>

      {/* 右パネル（モバイルではフル幅） */}
      <div
        className={cn(
          "flex-1",
          "flex flex-col items-center justify-center",
          "p-6 lg:p-16",
        )}
      >
        <div className={cn("w-full max-w-[400px]", "flex flex-col gap-6")}>
          {/* ロゴ - モバイルのみ */}
          <div className={cn("flex items-center gap-1", "lg:hidden")}>
            <Image
              src="/logo.svg"
              alt=""
              width={36}
              height={36}
              className="w-9 h-9"
            />
            <span className="text-3xl font-bold text-primary-base">atti</span>
          </div>

          {/* タイトルセクション */}
          <div className={cn("flex flex-col gap-2")}>
            <h1 className="text-3xl font-bold text-primary-base">ログイン</h1>
            <p className="text-sm text-gray-500">
              アカウントで認証してください
            </p>
          </div>

          {/* ボタンセクション */}
          <div className={cn("flex flex-col gap-3")}>
            <LinkButton
              href="/api/auth/cognito"
              color="primary"
              colorStyle="fill"
              external
            >
              <Globe className="w-5 h-5" />
              Googleで続ける
            </LinkButton>

            <LinkButton
              href="/api/auth/cognito/line"
              color="primary"
              colorStyle="outline"
              external
            >
              <MessageCircle className="w-5 h-5" />
              LINEで続ける
            </LinkButton>
          </div>

          {error && <p className="text-sm text-error-base">{error}</p>}
        </div>
      </div>
    </div>
  );
}
