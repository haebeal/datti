import { Form, useLocation, useNavigation } from "@remix-run/react";
import { useId } from "react";

import { Button, Input, Label } from "~/components";

export function SearchUserForm() {
	const { search } = useLocation();
	const { state } = useNavigation();
	const searchParams = new URLSearchParams(search);

	const searchQuery = searchParams.get("q")?.toString();
	const searchId = useId();

	return (
		<Form method="get" className="w-full flex gap-3">
			<div className="w-full flex flex-col gap-2">
				<Label htmlFor={searchId}>検索</Label>
				<div className="flex flex-row gap-3">
					<Input
						placeholder="メールアドレスを入力"
						defaultValue={searchQuery}
						name="q"
						className="w-full"
						disabled={state !== "idle"}
					/>
					<Button
						size="md"
						variant="solid-fill"
						type="submit"
						disabled={state !== "idle"}
					>
						検索
					</Button>
				</div>
			</div>
		</Form>
	);
}
