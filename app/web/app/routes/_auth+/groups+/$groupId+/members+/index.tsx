import type { MetaFunction } from "react-router";

import { MemberList } from "~/features/members/components";
export { memberListLoader as loader } from "~/features/members/loaders";

export const meta: MetaFunction = () => [
	{ title: "Datti | メンバー一覧" },
	{ name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function GroupMembers() {
	return (
		<div className="flex flex-col py-3 gap-3">
			<MemberList />
		</div>
	);
}
