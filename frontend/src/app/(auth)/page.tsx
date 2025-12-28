import { redirect } from "next/navigation";

export default function HomePage() {
	// Redirect to lending page as the default view
	redirect("/lending");
}
