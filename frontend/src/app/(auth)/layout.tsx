import { MobileMenu } from "@/components/mobile-menu";
import { Sidebar } from "@/components/sidebar";
import { getAllGroups } from "@/features/group/actions/getAllGroups";
import { getMe } from "@/features/user/actions/getMe";
import { cn } from "@/utils/cn";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const groupsResponse = await getAllGroups();
  const groups = groupsResponse.success ? groupsResponse.result : [];

  const userResponse = await getMe();
  const user = userResponse.success ? userResponse.user : null;

  return (
    <>
      <div className={cn("h-screen bg-blue-500", "flex", "bg-background")}>
        <Sidebar groups={groups} user={user} />
        <main
          className={cn("flex-1 px-4 sm:px-6 lg:px-8 py-8", "flex flex-col")}
        >
          {children}
        </main>
      </div>
      <MobileMenu />
    </>
  );
}
