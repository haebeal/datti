import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { meQueryOptions } from "@/features/user/queries";
import { cn } from "@/utils/cn";
import {
	useAddMember,
	useRemoveMember,
	useSearchUserByEmail,
} from "../mutations";
import { groupMembersQueryOptions } from "../queries";

export function MemberPanel({ groupId }: { groupId: string }) {
	const { data: members } = useSuspenseQuery(groupMembersQueryOptions(groupId));
	const { data: me } = useSuspenseQuery(meQueryOptions);

	const [email, setEmail] = useState("");
	const [feedback, setFeedback] = useState<string | null>(null);

	const search = useSearchUserByEmail();
	const addMember = useAddMember(groupId);
	const removeMember = useRemoveMember(groupId);

	const handleAdd = async () => {
		setFeedback(null);
		const trimmed = email.trim();
		if (!trimmed) return;
		const found = await search.mutateAsync(trimmed);
		if (!found) {
			setFeedback("このメールアドレスのユーザーが見つかりませんでした");
			return;
		}
		if (found.id === me.id) {
			setFeedback("自分自身を招待することはできません");
			return;
		}
		try {
			await addMember.mutateAsync(found.id);
			setEmail("");
		} catch (err) {
			setFeedback(err instanceof Error ? err.message : "追加に失敗しました");
		}
	};

	return (
		<div className={cn("p-6", "flex flex-col gap-4", "border rounded-lg")}>
			<h2 className="text-lg font-semibold">メンバー</h2>

			<ul className="flex flex-col gap-2">
				{members.map((member) => (
					<li
						key={member.id}
						className={cn(
							"flex items-center gap-3",
							"p-3",
							"border rounded-md",
						)}
					>
						{member.avatar ? (
							<img
								src={member.avatar}
								alt={member.name}
								className="w-10 h-10 rounded-full object-cover"
							/>
						) : (
							<div
								className={cn(
									"w-10 h-10 rounded-full",
									"bg-accent-base text-white",
									"flex items-center justify-center font-bold",
								)}
							>
								{member.name.charAt(0)}
							</div>
						)}
						<div className="flex-1 min-w-0">
							<p className="font-semibold truncate">{member.name}</p>
							<p className="text-sm text-gray-500 truncate">{member.email}</p>
						</div>
						{member.id !== me.id && (
							<button
								type="button"
								onClick={() => removeMember.mutate(member.id)}
								disabled={removeMember.isPending}
								className={cn(
									"px-3 py-1.5 rounded-md text-sm",
									"border border-error-base text-error-base",
									"hover:bg-error-base hover:text-white",
									"disabled:opacity-50",
									"transition-colors",
								)}
							>
								削除
							</button>
						)}
					</li>
				))}
			</ul>

			<div className="flex flex-col gap-2">
				<label htmlFor="invite-email" className="text-sm font-semibold">
					メンバーを追加
				</label>
				<div className="flex gap-2">
					<Input
						id="invite-email"
						type="email"
						placeholder="email@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="flex-1"
					/>
					<button
						type="button"
						onClick={handleAdd}
						disabled={search.isPending || addMember.isPending}
						className={cn(
							"px-4 py-2 rounded-md",
							"border border-primary-base bg-primary-base text-white",
							"hover:bg-primary-hover",
							"disabled:opacity-50",
							"transition-colors",
						)}
					>
						追加
					</button>
				</div>
				{feedback && <p className="text-sm text-error-base">{feedback}</p>}
			</div>
		</div>
	);
}
