import React, { useState } from 'react';
import { Star, Droplets, Accessibility, Baby, Sparkles, Clock, DollarSign, ShieldCheck } from 'lucide-react';
import { AmenityTag, CrowdLevel } from '../types/facility';

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

export const FountainPinIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-8' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <Droplets className={`${className} text-[#059669]`} aria-hidden="true" />;
  }

  return (
    <img
      src="https://sgtoilets.web.app/fountain-pin.svg"
      alt="Drinking water fountain pin"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} object-contain shrink-0`}
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
  const map: Record<AmenityTag, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
    wheelchair: { label: 'Wheelchair', Icon: Accessibility },
    'baby-care': { label: 'Baby Care', Icon: Baby },
    nursing: { label: 'Nursing Room', Icon: ShieldCheck },
    bidet: { label: 'Bidet', Icon: Sparkles },
    free: { label: 'Free', Icon: DollarSign },
    '24h': { label: '24 Hours', Icon: Clock },
  };

  const item = map[tag];
  if (!item) return null;
  const Icon = item.Icon;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 whitespace-nowrap shrink-0">
      <Icon className="w-3 h-3 text-slate-500 dark:text-slate-400" aria-hidden="true" />
      <span>{item.label}</span>
    </span>
  );
};
