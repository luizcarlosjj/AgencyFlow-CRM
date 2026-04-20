import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  accent?: boolean;
}

export default function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  accent = false,
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={`rounded-xl p-5 border ${
        accent
          ? 'bg-[#FF6B00] border-[#FF6B00] text-white'
          : 'bg-white border-[#E5E7EB] text-[#1F2937]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${accent ? 'text-orange-100' : 'text-[#6B7280]'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${accent ? 'text-white' : 'text-[#1F2937]'}`}>
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className={`w-3 h-3 ${accent ? 'text-orange-200' : 'text-emerald-500'}`} />
              ) : (
                <TrendingDown className={`w-3 h-3 ${accent ? 'text-orange-200' : 'text-red-500'}`} />
              )}
              <span
                className={`text-xs font-medium ${
                  accent
                    ? 'text-orange-100'
                    : isPositive
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                {isPositive ? '+' : ''}
                {change.toFixed(1)}% {changeLabel ?? 'vs mês anterior'}
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            accent ? 'bg-white/20' : 'bg-[#FFF0E6]'
          }`}
        >
          <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-[#FF6B00]'}`} />
        </div>
      </div>
    </div>
  );
}
