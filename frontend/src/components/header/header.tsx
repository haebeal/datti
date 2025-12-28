"use client";

import Link from "next/link";

export function Header() {
	return (
		<header className="bg-white shadow-sm">
			<nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 justify-between items-center">
					<div className="flex">
						<Link href="/" className="flex items-center">
							<span className="text-xl font-bold text-sky-500">Datti</span>
						</Link>
						<div className="hidden sm:ml-8 sm:flex sm:space-x-8">
							<Link
								href="/lending"
								className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-sky-500"
							>
								立て替え
							</Link>
							<Link
								href="/borrowing"
								className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-sky-500"
							>
								借り入れ
							</Link>
							<Link
								href="/credit"
								className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-sky-500"
							>
								債権
							</Link>
						</div>
					</div>
					<div className="hidden sm:ml-6 sm:flex sm:items-center">
						<Link
							href="/lending/create"
							className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600"
						>
							新規作成
						</Link>
					</div>
				</div>
			</nav>
		</header>
	);
}
