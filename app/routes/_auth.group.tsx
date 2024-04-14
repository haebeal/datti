import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Datti | グループ一覧" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Group() {
  return (
    <div>
      <h1 className="font-bold text-2xl">グループ一覧</h1>
    </div>
  );
}
