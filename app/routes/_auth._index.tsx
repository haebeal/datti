import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => [
  { title: "Datti" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Index() {
  return (
    <div className="flex flex-col py-3 gap-7">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">現在の支払い</h1>
      </div>
    </div>
  );
}
