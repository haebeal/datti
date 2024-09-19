import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	throw redirect(`${request.url}/events`);
};
