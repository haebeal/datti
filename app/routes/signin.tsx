import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
	{ title: "Datti | ログイン" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function SignIn() {
	return (
		<div className="grid place-content-center h-screen">
			<div className="rounded-md bg-white px-6 py-8 w-160 flex flex-col items-center gap-5">
				<h1 className="font-bold text-5xl">Datti</h1>
				<h2 className="text-center">
					誰にいくら払ったっけ？
					<br />
					を記録するサービス
				</h2>
				<Separator />
				<Form action="/api/auth/signin" method="post">
					<Button type="submit">Googleでログイン</Button>
				</Form>
			</div>
		</div>
	);
}
