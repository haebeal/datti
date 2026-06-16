import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ProfileEditForm } from "@/features/user/components/profile-edit-form";
import { useUnlinkLine } from "@/features/user/mutations";
import { meQueryOptions } from "@/features/user/queries";
import { logout } from "@/libs/auth/actions";
import { cn } from "@/utils/cn";

export const Route = createFileRoute("/_authenticated/profile")({
	loader: ({ context }) => context.queryClient.ensureQueryData(meQueryOptions),
	component: ProfilePage,
});

function ProfilePage() {
	const { data: me } = useSuspenseQuery(meQueryOptions);
	const unlinkLine = useUnlinkLine();

	return (
		<div className="flex flex-col gap-5">
			<h1 className="hidden sm:block text-2xl font-bold text-primary-base">
				マイページ
			</h1>

			<ProfileEditForm user={me} />

			<div className={cn("p-6 flex flex-col gap-3 border rounded-lg bg-white")}>
				<h2 className="text-lg font-semibold">LINE 連携</h2>
				{me.lineUserId ? (
					<>
						<p className="text-sm text-gray-600">連携済み</p>
						<button
							type="button"
							onClick={() => unlinkLine.mutate()}
							disabled={unlinkLine.isPending}
							className={cn(
								"px-4 py-2 self-start rounded-md",
								"border border-error-base text-error-base",
								"hover:bg-error-base hover:text-white",
								"disabled:opacity-50 transition-colors",
							)}
						>
							{unlinkLine.isPending ? "解除中…" : "連携を解除する"}
						</button>
					</>
				) : (
					<p className="text-sm text-gray-600">
						未連携 (LINE 連携機能はバックエンドの LINE OAuth コールバック側で実装中)
					</p>
				)}
			</div>

			<div className={cn("p-6 flex flex-col gap-3 border rounded-lg bg-white")}>
				<h2 className="text-lg font-semibold">ログアウト</h2>
				<button
					type="button"
					onClick={() => logout()}
					className={cn(
						"px-4 py-2 self-start rounded-md",
						"border border-primary-base text-primary-base",
						"hover:bg-primary-base hover:text-white",
						"transition-colors",
					)}
				>
					ログアウト
				</button>
			</div>
		</div>
	);
}
