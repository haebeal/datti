import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Datti - 立て替え管理アプリ",
	description: "誰にいくら払ったっけ？を記録するサービス",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className="antialiased">{children}</body>
		</html>
	);
}
