import { Await, useActionData, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { Spinner } from "~/components";
import { useToast } from "~/components/ui/use-toast";

import type { UpdateProfileAction } from "~/features/profile/actions";
import { UpdateProfileForm } from "~/features/profile/components";
import type { ProfileLoader } from "~/features/profile/loaders";
export { updateProfileAction as action } from "~/features/profile/actions";
export { profileLoader as loader } from "~/features/profile/loaders";

export default function ProfileSetting() {
	const { toast } = useToast();

	const { profile } = useLoaderData<ProfileLoader>();
	const actionData = useActionData<UpdateProfileAction>();
	useEffect(() => {
		if (actionData) {
			toast({
				title: actionData.message,
			});
		}
	}, [actionData, toast]);

	return (
		<Suspense fallback={<Spinner />}>
			<Await resolve={profile}>
				{(profile) => <UpdateProfileForm defaultValue={profile} />}
			</Await>
		</Suspense>
	);
}
