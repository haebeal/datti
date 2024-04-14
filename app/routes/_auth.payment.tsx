import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Datti | 支払い" },
  { name: "description", content: "誰にいくら払ったっけ？を記録するサービス" },
];

export default function Payment() {
  return (
    <div>
      <h1 className="font-bold text-2xl">支払い</h1>
    </div>
  );
}
