import { Sidebar } from "@/components/sidebar";
import { getAllGroups } from "@/features/group/actions/getAllGroups";
import { cn } from "@/utils/cn";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const groupsResponse = await getAllGroups();
  const groups = groupsResponse.success ? groupsResponse.result : [];

  return (
    <div className={cn("min-h-screen", "flex", "bg-background")}>
      <Sidebar groups={groups} />
      <main className={cn("flex-1 px-4 sm:px-6 lg:px-8 py-8", "flex flex-col")}>
        {children}
      </main>
    </div>
  );
}
