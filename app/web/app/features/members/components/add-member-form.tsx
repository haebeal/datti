import { Form, useLocation, useNavigation } from "@remix-run/react";
import { useId } from "react";

import { Button, Input, Label } from "~/components";

import { AddMemberList } from "./add-member-list";

export function AddMemberForm() {
	const { search } = useLocation();
	const { state } = useNavigation();
	const searchParams = new URLSearchParams(search);

	const searchQuery = searchParams.get("q")?.toString();
	const searchId = useId();

	return (
		<div className="flex flex-col items-center p-4 gap-9">
			<Form method="get" className="w-full">
				<div className="w-full flex items-end gap-3">
					<div className="grow">
						<Label htmlFor={searchId}>検索</Label>
						<Input
							placeholder="メールアドレスを入力"
							defaultValue={searchQuery}
							name="q"
							disabled={state !== "idle"}
						/>
					</div>
					<Button
						size="md"
						variant="solid-fill"
						type="submit"
						disabled={state !== "idle"}
					>
						検索
					</Button>
				</div>
			</Form>
			<AddMemberList />
		</div>
	);
}
