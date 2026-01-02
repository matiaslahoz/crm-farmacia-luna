import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="h-dvh overflow-hidden flex bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6 overflow-hidden min-h-0">{children}</main>
      </div>
    </AuthGuard>
  );
}
