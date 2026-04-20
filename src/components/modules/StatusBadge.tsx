import type { ClientStatus, CampaignStatus, PaymentStatus } from '@/lib/types';

type StatusValue = ClientStatus | CampaignStatus | PaymentStatus;

const statusConfig: Record<StatusValue, { label: string; classes: string }> = {
  active:   { label: 'Ativo',     classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paused:   { label: 'Pausado',   classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  churned:  { label: 'Cancelado', classes: 'bg-red-50 text-red-700 border-red-200' },
  ended:    { label: 'Encerrado', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  paid:     { label: 'Pago',      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending:  { label: 'Pendente',  classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  overdue:  { label: 'Atrasado',  classes: 'bg-red-50 text-red-700 border-red-200' },
};

export default function StatusBadge({ status }: { status: StatusValue }) {
  const config = statusConfig[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  );
}
