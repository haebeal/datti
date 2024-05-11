import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { ProfileAction } from "~/.server/actions";
import { AuthLoader } from "~/.server/loaders";
import { ProfileForm } from "~/components/ProfileForm";

export { profileAction as action } from "~/.server/actions";
export { authLoader as loader } from "~/.server/loaders";

function LoadingSpinner() {
  return (
    <div className="w-full min-h-[60vh] grid place-content-center">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>
  );
}

export default function ProfileSetting() {
  const { profile } = useLoaderData<AuthLoader>();
  const lastResult = useActionData<ProfileAction>();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Await resolve={profile}>
        {(profile) => (
          <ProfileForm defaultValue={profile} lastResult={lastResult} />
        )}
      </Await>
    </Suspense>
  );
}
