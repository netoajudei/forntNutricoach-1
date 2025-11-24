"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type NavItem = { path: string; label: string };
const navItems: NavItem[] = [
  { path: "/profissional/alunos", label: "Alunos" },
  { path: "/profissional/perfil", label: "Perfil" },
];

const Sidebar: React.FC<{ onLogout: () => void; role?: string | null }> = ({ onLogout, role }) => {
  const pathname = usePathname();

  const finalNavItems = [...navItems];
  if (role === 'dev') {
    finalNavItems.push({ path: "/profissional/cadastro-site", label: "Cadastro do Site" });
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-20 flex items-center justify-center px-4 border-b border-gray-200">
        <h1 className="text-2xl font-extrabold text-green-900">ZapNutri Pro</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {finalNavItems.map((item) => {
          const isActive = pathname?.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${isActive
                  ? "bg-green-50 text-green-600"
                  : "text-gray-500 hover:bg-green-50 hover:text-green-600"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-6 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-semibold rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600"
        >
          Sair
        </button>
      </div>
    </aside>
  );
};

export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('alunos')
          .select('role')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        if (data) {
          setRole(data.role);
        }
      }
    };
    fetchRole();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex">
        <Sidebar onLogout={handleLogout} role={role} />
      </div>
      <main className="flex-1 overflow-y-auto pb-0">{children}</main>
    </div>
  );
}


