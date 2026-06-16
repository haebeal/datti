import { Globe, MessageCircle } from "lucide-react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { login } from "@/libs/auth/actions";
import { userManager } from "@/libs/auth/cognito";
import { cn } from "@/utils/cn";

const ERROR_MESSAGES: Record<string, string> = {
	no_result: "認証結果が取得できませんでした",
	no_token: "認証トークンが取得できませんでした",
	auth_failed: "認証に失敗しました",
	signup_failed: "ユーザー登録に失敗しました",
	server_error: "サーバーエラーが発生しました",
};

const searchSchema = z.object({
	error: z.string().optional(),
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/")({
	validateSearch: searchSchema,
	beforeLoad: async () => {
		const user = await userManager.getUser();
		if (user && !user.expired) {
			throw redirect({ to: "/" });
		}
	},
	component: AuthPage,
});

function AuthPage() {
	const { error: errorParam } = Route.useSearch();
	const error = errorParam ? ERROR_MESSAGES[errorParam] || errorParam : null;

	return (
		<div className={cn("min-h-screen", "flex", "bg-white")}>
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
				<div className="flex items-center gap-1">
					<img
						src="/logo.svg"
						alt=""
						className="w-14 h-14 border-2 border-white rounded-xl"
					/>
					<span className="text-5xl font-bold text-white">atti</span>
				</div>
				<p className="text-xl text-white/70">割り勘・立て替えを簡単に管理</p>
			</div>

			<div
				className={cn(
					"flex-1",
					"flex flex-col items-center justify-center",
					"p-6 lg:p-16",
				)}
			>
				<div className={cn("w-full max-w-[400px]", "flex flex-col gap-6")}>
					<div className={cn("flex items-center gap-1", "lg:hidden")}>
						<img src="/logo.svg" alt="" className="w-9 h-9" />
						<span className="text-3xl font-bold text-primary-base">atti</span>
					</div>

					<div className={cn("flex flex-col gap-2")}>
						<h1 className="text-3xl font-bold text-primary-base">ログイン</h1>
						<p className="text-sm text-gray-500">
							アカウントで認証してください
						</p>
					</div>

					<div className={cn("flex flex-col gap-3")}>
						<Button
							onPress={() => login("Google")}
							color="primary"
							colorStyle="fill"
							className={cn(
								"py-3.5 px-6",
								"text-sm font-semibold",
								"flex items-center justify-center gap-2.5",
							)}
						>
							<Globe className="w-5 h-5" />
							Googleで続ける
						</Button>
						<Button
							onPress={() => login("LINE")}
							color="primary"
							colorStyle="outline"
							className={cn(
								"py-3.5 px-6",
								"text-sm font-semibold",
								"flex items-center justify-center gap-2.5",
							)}
						>
							<MessageCircle className="w-5 h-5" />
							LINEで続ける
						</Button>
					</div>

					{error && <p className="text-sm text-error-base">{error}</p>}
				</div>
			</div>
		</div>
	);
}
