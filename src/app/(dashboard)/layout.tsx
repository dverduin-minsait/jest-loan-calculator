import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />
      <OfflineBanner />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
