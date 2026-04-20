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
      className={`rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 ${
        accent
          ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] border-transparent text-white shadow-lg shadow-orange-200'
          : 'bg-white border-[#E5E7EB] text-[#1F2937] shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium uppercase tracking-wide ${accent ? 'text-orange-100' : 'text-[#9CA3AF]'}`}>
            {title}
          </p>
          <p className={`text-2xl font-heading font-bold mt-1.5 ${accent ? 'text-white' : 'text-[#1F2937]'}`}>
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className={`w-3 h-3 ${accent ? 'text-orange-200' : 'text-emerald-500'}`} />
              ) : (
                <TrendingDown className={`w-3 h-3 ${accent ? 'text-orange-200' : 'text-red-400'}`} />
              )}
              <span
                className={`text-xs font-medium ${
                  accent
                    ? 'text-orange-100'
                    : isPositive
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }`}
              >
                {isPositive ? '+' : ''}
                {change.toFixed(1)}% {changeLabel ?? 'vs mês anterior'}
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${
            accent ? 'bg-white/20' : 'bg-[#FFF0E6]'
          }`}
        >
          <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-[#FF6B00]'}`} />
        </div>
      </div>
    </div>
  );
}
