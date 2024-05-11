import { useActionData, useLoaderData } from "@remix-run/react";
import { ProfileAction } from "~/.server/actions";
import { AuthLoader } from "~/.server/loaders";
import { ProfileForm } from "~/components/ProfileForm";

export { profileAction as action } from "~/.server/actions";
export { authLoader as loader } from "~/.server/loaders";

export default function ProfileSetting() {
  const { profile } = useLoaderData<AuthLoader>();
  const lastResult = useActionData<ProfileAction>();

  return (
    <>
      <ProfileForm defaultValue={profile} lastResult={lastResult} />
    </>
  );
}
