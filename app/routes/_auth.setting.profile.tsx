import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import type { ProfileAction } from "~/.server/actions";
import type { AuthLoader } from "~/.server/loaders";
import { ProfileForm } from "~/components/ProfileForm";
import { useToast } from "~/components/ui/use-toast";

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
	const { toast } = useToast();

	const { profile } = useLoaderData<AuthLoader>();
	const actionData = useActionData<ProfileAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<Suspense fallback={<LoadingSpinner />}>
			<Await resolve={profile}>
				{(profile) => <ProfileForm defaultValue={profile} />}
			</Await>
		</Suspense>
	);
}
