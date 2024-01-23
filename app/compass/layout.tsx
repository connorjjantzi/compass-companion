import { MainNav } from "@/components/main-nav";
import { authOptions, getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

interface CompassPageLayoutProps {
  children: React.ReactNode;
}

export default async function CompassPageLayout({
  children,
}: CompassPageLayoutProps) {
  const session = await getServerAuthSession();

  if (!session) {
    // Redirect to login page
    redirect(authOptions?.pages?.signIn ?? "/login");
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <MainNav user={session.user} />
      </header>
      <main className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        {children}
      </main>
    </div>
  );
}
