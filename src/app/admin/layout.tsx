import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = { title: { default: "Admin · Passion Spark", template: "%s · Admin" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, name: true, email: true },
  });

  if (user?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">

      {/* ── Sidebar ── */}
      <AdminSidebar adminName={user.name} adminEmail={user.email} />

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile header */}
        <header className="sm:hidden sticky top-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-[#1e1e1e] px-4 h-12 flex items-center justify-between">
          <span className="font-display text-lg text-white">ADMIN</span>
          <span className="font-display-md text-[10px] text-red-500 border border-red-500/30 px-2 py-0.5">
            RESTRICTED
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
