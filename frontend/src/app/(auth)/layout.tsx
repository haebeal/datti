import { Header } from "@/components/header";
import { MobileMenu } from "@/components/mobile-menu";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-20 sm:pb-8">
				{children}
			</main>
			<MobileMenu />
		</div>
	);
}
