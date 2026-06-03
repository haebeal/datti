import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<main className="mx-auto flex max-w-4xl flex-col gap-5 p-6">
			<h1 className="text-2xl font-bold text-primary-base">Datti</h1>
			<p className="text-primary-base">SPA 雛形は動いています。</p>
		</main>
	);
}
