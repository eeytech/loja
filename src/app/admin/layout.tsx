import { requireAdmin } from "@/lib/admin";

import { Sidebar } from "./_components/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
