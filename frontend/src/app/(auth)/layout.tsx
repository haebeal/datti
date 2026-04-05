import { Header } from "@/components/header";
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
      <div className={cn("h-screen", "flex")}>
        <Sidebar groups={groups} user={user} />
        <div className={cn("flex-1 min-w-0", "flex flex-col")}>
          <Header />
          <main
            className={cn(
              "flex-1 overflow-y-auto",
              "px-4 sm:px-6 lg:px-8",
              "py-5 sm:py-8",
              "pb-20 sm:pb-8",
            )}
          >
            {children}
          </main>
        </div>
      </div>
      <MobileMenu />
    </>
  );
}
