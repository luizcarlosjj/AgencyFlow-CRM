'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  TrendingUp,
  Zap,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/campaigns', label: 'Campanhas', icon: Megaphone },
  { href: '/revenue', label: 'Receita', icon: TrendingUp },
  { href: '/automation', label: 'Automação', icon: Zap },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#F9FAFB] border-r border-[#E5E7EB] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-[#1F2937] text-lg tracking-tight">
            Agency<span className="text-[#FF6B00]">Flow</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#FFF0E6] text-[#FF6B00]'
                  : 'text-[#6B7280] hover:bg-white hover:text-[#1F2937]'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-[#FF6B00]' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-white hover:text-[#1F2937] transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configurações
        </Link>
        <div className="mt-3 px-3 py-3 rounded-lg bg-[#FFF0E6]">
          <p className="text-xs font-semibold text-[#FF6B00]">AgencyFlow Demo</p>
          <p className="text-xs text-[#6B7280] mt-0.5">Plano Pro · Abril 2026</p>
        </div>
      </div>
    </aside>
  );
}
