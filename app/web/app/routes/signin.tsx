import type { MetaFunction } from "react-router";

import { Button, Divider } from "~/components";

export const meta: MetaFunction = () => [
	{ title: "Datti | ログイン" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function SignIn() {
	return (
		<div className="grid place-content-center h-screen">
			<div className="flex flex-col items-center gap-5">
				<h1 className="text-std-45B-140">Datti</h1>
				<h2 className="text-center text-std-18N-160-150">
					誰にいくら払ったっけ？
					<br />
					を記録するサービス
				</h2>
				<Divider />
				<form action="/auth/signin" method="post">
					<Button variant="solid-fill" size="md" type="submit">
						Googleでログイン
					</Button>
				</form>
			</div>
		</div>
	);
}
