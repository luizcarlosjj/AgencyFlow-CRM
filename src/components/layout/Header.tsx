'use client';

import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] shadow-sm flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-heading font-semibold text-[#1F2937]">{title}</h1>
        {subtitle && <p className="text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="pl-9 pr-4 py-2 text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/25 focus:border-[#FF6B00] focus:bg-white w-48 transition-all duration-200"
          />
        </div>

        <button className="relative p-2 rounded-xl hover:bg-[#F9FAFB] transition-all duration-200 hover:scale-105">
          <Bell className="w-5 h-5 text-[#6B7280]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6B00] rounded-full ring-2 ring-white" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] flex items-center justify-center text-white text-sm font-semibold shadow-md shadow-orange-200 cursor-pointer hover:scale-105 transition-transform duration-200">
          A
        </div>
      </div>
    </header>
  );
}
