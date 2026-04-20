'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Megaphone, TrendingUp, Zap, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/campaigns', label: 'Campanhas', icon: Megaphone },
  { href: '/revenue', label: 'Receita', icon: TrendingUp },
  { href: '/automation', label: 'Automação', icon: Zap },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
  agencyName: string;
}

export default function Sidebar({ userName, userEmail, agencyName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-[#E5E7EB] flex flex-col shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-md shadow-orange-200 transition-transform duration-200 hover:scale-110">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-heading font-bold text-[#1F2937] text-lg tracking-tight">
            Agency<span className="text-[#FF6B00]">Flow</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-[#FFF0E6] text-[#FF6B00]'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1F2937]'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#FF6B00] rounded-r-full" />
              )}
              <Icon className={`w-4 h-4 ${active ? 'text-[#FF6B00]' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-1">
        <Link
          href="/settings"
          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            pathname === '/settings'
              ? 'bg-[#FFF0E6] text-[#FF6B00]'
              : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1F2937]'
          }`}
        >
          {pathname === '/settings' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#FF6B00] rounded-r-full" />
          )}
          <Settings className="w-4 h-4" />
          Configurações
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>

        {/* User card */}
        <div className="mt-2 px-3 py-3 rounded-xl bg-gradient-to-br from-[#FFF0E6] to-[#FFE4CC] border border-[#FFD4A8]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#FF6B00] font-heading truncate">{agencyName}</p>
              <p className="text-xs text-[#9A5200] truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
