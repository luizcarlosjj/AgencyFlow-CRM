import type { Platform } from '@/lib/types';

const config: Record<Platform, { label: string; bg: string; text: string }> = {
  google: { label: 'Google Ads', bg: 'bg-blue-50', text: 'text-blue-700' },
  meta:   { label: 'Meta Ads',   bg: 'bg-indigo-50', text: 'text-indigo-700' },
};

export default function PlatformBadge({ platform }: { platform: Platform }) {
  const c = config[platform];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {platform === 'google' ? '🔵' : '🟣'} {c.label}
    </span>
  );
}
