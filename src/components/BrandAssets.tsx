import React, { useState } from 'react';
import { Star, Sparkles, Clock, DollarSign, Users } from 'lucide-react';
import { AmenityTag, CrowdLevel } from '../types/facility';

export const WheelchairIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="11" cy="4.5" r="1.75" fill="currentColor" stroke="none" />
    <path d="M11 8.5v5.5h5.5l2 4.5" />
    <path d="M11 11.5h4" />
    <path d="M14.5 16.5a5 5 0 1 1-5.8-6.4" />
  </svg>
);

export const NursingBottleIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M10 3.5a2 2 0 0 1 4 0v1.5h-4V3.5Z" />
    <path d="M8.5 5h7l.5 2.5H8L8.5 5Z" />
    <rect x="7.5" y="7.5" width="9" height="13" rx="2.5" />
    <path d="M10.5 11.5h2.5" />
    <path d="M10.5 14.5h2.5" />
    <path d="M10.5 17.5h2" />
  </svg>
);

export const BabyChangingIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="8" cy="7" r="2" />
    <path d="M5 14c1.5-2.2 4.5-2.5 7.5-1.5l3.5 1.2" />
    <path d="M4 17.5h16" />
    <path d="M6 17.5V20" />
    <path d="M18 17.5V20" />
    <path d="M14.5 9.5h3" />
  </svg>
);

export const BrandLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`${className} inline-flex items-center justify-center rounded-lg bg-[#2563EB] text-white text-xs font-extrabold`}
        aria-hidden="true"
      >
        SG
      </span>
    );
  }

  return (
    <img
      src="https://sgtoilets.web.app/favicon.svg"
      alt="sgtoilets logo"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} rounded-lg object-contain shrink-0`}
    />
  );
};

export const CrowdBadge: React.FC<{ crowd: CrowdLevel; compact?: boolean }> = ({ crowd, compact = false }) => {
  const config: Record<
    CrowdLevel,
    { label: string; dotClass: string; badgeClass: string }
  > = {
    low: {
      label: compact ? 'Low crowd' : 'Crowd: Low',
      dotClass: 'bg-[#059669] dark:bg-emerald-400',
      badgeClass:
        'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/70',
    },
    moderate: {
      label: compact ? 'Moderate' : 'Crowd: Moderate',
      dotClass: 'bg-[#D97706] dark:bg-amber-400',
      badgeClass:
        'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A] dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/70',
    },
    busy: {
      label: compact ? 'Busy' : 'Crowd: Busy',
      dotClass: 'bg-[#DC2626] dark:bg-red-400',
      badgeClass:
        'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] dark:bg-red-950/70 dark:text-red-300 dark:border-red-800/70',
    },
  };

  const c = config[crowd];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap shrink-0 ${c.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dotClass}`} aria-hidden="true" />
      <span>{c.label}</span>
    </span>
  );
};

export const RatingScore: React.FC<{ rating: number; count?: number }> = ({ rating, count }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-xs font-bold text-slate-900 dark:text-amber-200 tabular-nums whitespace-nowrap shrink-0">
      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
      <span>{rating.toFixed(1)}</span>
      {typeof count === 'number' && (
        <span className="font-medium text-slate-500 dark:text-amber-300/75">({count})</span>
      )}
    </span>
  );
};

export const AmenityBadge: React.FC<{ tag: AmenityTag }> = ({ tag }) => {
  const map: Record<
    AmenityTag,
    { label: string; iconColor: string; Icon: React.ComponentType<{ className?: string }> }
  > = {
    wheelchair: {
      label: 'Wheelchair',
      iconColor: 'text-[#2563EB] dark:text-blue-400',
      Icon: WheelchairIcon,
    },
    'baby-care': {
      label: 'Baby Changing',
      iconColor: 'text-[#0D8B99] dark:text-cyan-400',
      Icon: BabyChangingIcon,
    },
    nursing: {
      label: 'Nursing Room',
      iconColor: 'text-[#DB2777] dark:text-pink-400',
      Icon: NursingBottleIcon,
    },
    unisex: {
      label: 'All-Gender / Unisex',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      Icon: Users,
    },
    bidet: {
      label: 'Bidet',
      iconColor: 'text-slate-500 dark:text-slate-400',
      Icon: Sparkles,
    },
    free: {
      label: 'Free',
      iconColor: 'text-slate-500 dark:text-slate-400',
      Icon: DollarSign,
    },
    '24h': {
      label: '24 Hours',
      iconColor: 'text-slate-500 dark:text-slate-400',
      Icon: Clock,
    },
  };

  const item = map[tag];
  if (!item) return null;
  const Icon = item.Icon;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 whitespace-nowrap shrink-0">
      <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
      <span>{item.label}</span>
    </span>
  );
};
