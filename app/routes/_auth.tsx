import { Await, Outlet, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { AuthLoader } from "~/.server/loaders";
import { Header } from "~/components/Header";

export { authLoader as loader } from "~/.server/loaders";

export default function Auth() {
  const { profile } = useLoaderData<AuthLoader>();

  return (
    <div className="min-h-screen">
      <Suspense fallback={<p>プロフィールのローディング</p>}>
        <Await resolve={profile}>
          {(profile) => (
            <>
              <Header profile={profile} className="h-20 bg-white" />
              <div className="container py-3">
                <Outlet />
              </div>
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
