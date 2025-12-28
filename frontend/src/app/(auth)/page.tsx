import { redirect } from "next/navigation";

export default function HomePage() {
	// Redirect to credit page as the default view
	redirect("/credit");
}
