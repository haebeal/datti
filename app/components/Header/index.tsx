import { FaceIcon, GearIcon } from "@radix-ui/react-icons";
import { Await, Form, Link, NavLink, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { AuthLoader } from "~/.server/loaders";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";

export function Header() {
  const { profile } = useLoaderData<AuthLoader>();

  return (
    <div className="h-20 bg-white">
      <div className="container h-full flex items-center">
        <Link to="/" className="font-bold text-2xl">
          Datti
        </Link>
        <div className="flex items-center gap-12 m-auto font-bold">
          <NavLink
            className={({ isActive }) =>
              !isActive ? "text-gray-400" : undefined
            }
            to="/"
          >
            ホーム
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              !isActive ? "text-gray-400" : undefined
            }
            to="/groups"
          >
            グループ
          </NavLink>
        </div>

        <Suspense
          fallback={
            <Skeleton className="h-12 w-12 rounded-full border border-gray-200" />
          }
        >
          <Await resolve={profile}>
            {(profile) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-12 w-12 border border-gray-200 hover:cursor-pointer">
                    <AvatarImage src={profile.photoUrl} />
                    <AvatarFallback>
                      <Skeleton className="h-12 w-12 rounded-full border border-gray-200" />
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{profile.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/setting">
                    <DropdownMenuItem className="hover:cursor-pointer flex gap-2">
                      <GearIcon />
                      設定
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/friends">
                    <DropdownMenuItem className="hover:cursor-pointer flex gap-2">
                      <FaceIcon />
                      フレンド
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Form action="/api/auth/signout" method="post">
                    <DropdownMenuItem asChild>
                      <input
                        className="hover:cursor-pointer w-full h-full"
                        type="submit"
                        value="ログアウト"
                      />
                    </DropdownMenuItem>
                  </Form>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
