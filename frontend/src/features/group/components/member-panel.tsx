import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ListGroup, ListRow } from "@/components/ui/list-group";
import { UserAvatar } from "@/components/ui/user-avatar";
import { meQueryOptions } from "@/features/user/queries";
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
		<div className="flex flex-col gap-4">
			<ListGroup>
				{members.map((member, i) => (
					<ListRow key={member.id} last={i === members.length - 1}>
						<UserAvatar user={member} className="size-10" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-[14.5px] font-semibold text-foreground">
								{member.name}
							</p>
							<p className="font-num truncate text-xs text-muted-foreground">
								{member.email}
							</p>
						</div>
						{member.id !== me.id && (
							<Button
								variant="outline"
								size="sm"
								disabled={removeMember.isPending}
								className="border-destructive/50 text-destructive hover:bg-destructive/5 hover:text-destructive"
								onClick={() => removeMember.mutate(member.id)}
							>
								削除
							</Button>
						)}
					</ListRow>
				))}
			</ListGroup>

			<FormField
				label="メンバーを追加"
				htmlFor="invite-email"
				error={feedback ?? undefined}
			>
				<div className="flex gap-2">
					<Input
						id="invite-email"
						type="email"
						placeholder="email@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="flex-1"
					/>
					<Button
						onClick={handleAdd}
						disabled={search.isPending || addMember.isPending}
					>
						追加
					</Button>
				</div>
			</FormField>
		</div>
	);
}
