import { redirect } from "@remix-run/cloudflare";

export const loader = async () => {
	throw redirect("/setting/profile");
};
