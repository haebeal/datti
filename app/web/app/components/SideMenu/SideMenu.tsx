import { Await, Form, NavLink, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { Button, Divider, Link } from "~/components";
import { cn } from "~/lib/utils";

import type { ProfileLoader } from "~/features/profile/loaders";

export function SideMenu() {
	const { profile } = useLoaderData<ProfileLoader>();

	return (
		<div className="flex flex-col gap-9 px-1">
			<div className="flex flex-row gap-3">
				<Suspense
					fallback={
						<div className="animate-pulse rounded-full bg-slate-200 h-20 w-20" />
					}
				>
					<Await resolve={profile}>
						{({ name, photoUrl }) => (
							<img
								alt={`${name}のプロフィール画像`}
								src={photoUrl}
								className="rounded-full h-20 w-20 border-gray-200"
							/>
						)}
					</Await>
				</Suspense>
				<div className="flex flex-col gap-2">
					<Suspense
						fallback={<div className="animate-pulse bg-slate-200 h-9" />}
					>
						<Await resolve={profile}>
							{({ name }) => (
								<div className="flex flex-row">
									<p className="break-all">
										<span className="text-std-24N-150 pe-2">{name}</span>
										<span className="text-std-18N-160">さん</span>
									</p>
								</div>
							)}
						</Await>
					</Suspense>
					<Link href="/setting">プロフィールを編集</Link>
				</div>
			</div>
			<Divider />
			<NavLink
				to="/"
				className={({ isActive }) =>
					cn("flex items-center gap-5", isActive && "text-blue-900")
				}
			>
				{({ isActive }) => (
					<>
						<span
							className={cn("px-3 py-1 rounded-2xl", isActive && "bg-blue-50")}
						>
							<svg
								role="img"
								aria-label="ホームアイコン"
								xmlns="http://www.w3.org/2000/svg"
								height="32px"
								width="32px"
								viewBox="0 -960 960 960"
								className={isActive ? "fill-blue-900" : "fill-black"}
							>
								<path d="M212-172v-402l268-203 268 203v402H550v-248H410v248H212Z" />
							</svg>
						</span>
						ホーム
					</>
				)}
			</NavLink>
			<NavLink
				to="/groups"
				className={({ isActive }) =>
					cn("flex items-center gap-5", isActive && "text-blue-900")
				}
			>
				{({ isActive }) => (
					<>
						<span
							className={cn("px-3 py-1 rounded-2xl", isActive && "bg-blue-50")}
						>
							<svg
								role="img"
								aria-label="グループアイコン"
								xmlns="http://www.w3.org/2000/svg"
								height="32px"
								width="32px"
								viewBox="0 -960 960 960"
								className={isActive ? "fill-blue-900" : "fill-black"}
							>
								<path d="M122-232v-47q0-26 13.5-43.5t38.45-28.59Q226-374 272-388q46-14 118-14 73 0 118.5 14t98.55 36.91Q631-340 644.5-322.5 658-305 658-279v47H122Zm610 0v-44q0-38-13.45-65.98Q705.11-369.96 684-389q28 7 55 16.5t50 20.5q21 11 35 31.16T838-276v44H732ZM390-512q-44.55 0-74.77-30.22Q285-572.45 285-617q0-45.55 30.23-75.28Q345.45-722 390-722q45.55 0 75.27 29.72Q495-662.55 495-617q0 44.55-29.73 74.78Q435.55-512 390-512Zm246-105q0 44.55-29.72 74.78Q576.55-512 531-512h3q17.32-20.76 26.16-47.51 8.84-26.74 8.84-57.61 0-30.88-10-56.38-10-25.5-25-49.5-1 1-1.5 1H531q45.55 0 75.28 29.72Q636-662.55 636-617Z" />
							</svg>
						</span>
						グループ
					</>
				)}
			</NavLink>
			<NavLink
				to="/payments"
				className={({ isActive }) =>
					cn("flex items-center gap-5", isActive && "text-blue-900")
				}
			>
				{({ isActive }) => (
					<>
						<span
							className={cn("px-3 py-1 rounded-2xl", isActive && "bg-blue-50")}
						>
							<svg
								role="img"
								aria-label="返済アイコン"
								xmlns="http://www.w3.org/2000/svg"
								height="32px"
								width="32px"
								viewBox="0 -960 960 960"
								className={isActive ? "fill-blue-900" : "fill-black"}
							>
								<path d="M464-220h30v-46q41-2 81.5-28.5T616-378q0-42-26-70t-98-54q-68-24-85-41t-17-49q0-32 25.5-54t66.5-22q30 0 51 13.5t35 34.5l26-10q-15-27-41.5-44.5T496-694v-46h-30v46q-53 8-79.5 37.5T360-592q0 42 27 67t93 49q65 24 86.5 43.5T588-378q0 45-33 64.5T486-294q-35 0-63.5-20T376-370l-26 12q18 39 46.5 60t67.5 30v48Zm16 88q-72 0-135.5-27.5T234-234q-47-47-74.5-110.5T132-480q0-72 27.5-135.5T234-726q47-47 110.5-74.5T480-828q72 0 135.5 27.5T726-726q47 47 74.5 110.5T828-480q0 72-27.5 135.5T726-234q-47 47-110.5 74.5T480-132Z" />
							</svg>
						</span>
						返済
					</>
				)}
			</NavLink>
			<Divider />
			<Form action="/api/auth/signout" method="post">
				<Button
					type="submit"
					variant="solid-fill"
					size="md"
					className="bg-red-900 hover:bg-red-1000 active:bg-red-1100 w-full"
				>
					ログアウト
				</Button>
			</Form>
		</div>
	);
}
