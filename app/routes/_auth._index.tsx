import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => [
  { title: "Datti" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Index() {
  return (
    <div>
      <h1 className="font-bold text-2xl">支払い一覧</h1>
    </div>
  );
}
