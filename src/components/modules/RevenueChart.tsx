'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { RevenueByMonth } from '@/lib/types';

interface RevenueChartProps {
  data: RevenueByMonth[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-[#1F2937] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#6B7280]">{p.name === 'revenue' ? 'Receita' : 'Meta'}:</span>
          <span className="font-medium text-[#1F2937]">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FFB380" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#FFB380" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="goal"
          stroke="#FFB380"
          strokeWidth={2}
          strokeDasharray="5 4"
          fill="url(#goalGradient)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#FF6B00"
          strokeWidth={2.5}
          fill="url(#revenueGradient)"
          dot={{ fill: '#FF6B00', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#FF6B00' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
