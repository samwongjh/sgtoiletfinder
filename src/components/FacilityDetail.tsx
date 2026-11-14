import React, { useState } from 'react';
import {
  ArrowLeft,
  Navigation,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
} from 'lucide-react';
import { CrowdLevel, FacilityWithDistance } from '../types/facility';
import { formatDistance } from '../data/singaporeFacilities';
import { AmenityBadge, CrowdBadge, FountainPinIcon, RatingScore } from './BrandAssets';

interface FacilityDetailProps {
  facility: FacilityWithDistance;
  isNavigating: boolean;
  onBack: () => void;
  onNavigate: (facility: FacilityWithDistance) => void;
  onStopNavigate: () => void;
  onUpdateCrowd: (facilityId: string, crowd: CrowdLevel) => void;
  onSubmitReview: (
    facilityId: string,
    payload: { rating: number; crowd: CrowdLevel; comment: string }
  ) => void;
}

export const FacilityDetail: React.FC<FacilityDetailProps> = ({
  facility,
  isNavigating,
  onBack,
  onNavigate,
  onStopNavigate,
  onUpdateCrowd,
  onSubmitReview,
}) => {
  const [draftRating, setDraftRating] = useState<number>(5);
  const [draftCrowd, setDraftCrowd] = useState<CrowdLevel>(facility.crowd);
  const [draftComment, setDraftComment] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview(facility.id, {
      rating: draftRating,
      crowd: draftCrowd,
      comment: draftComment.trim(),
    });
    setDraftComment('');
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 3000);
  };

  const hygieneItems =
    facility.type === 'fountain'
      ? [
          { label: 'Clean Spout', ok: facility.hygiene.ventilation },
          { label: 'Dry Surroundings', ok: facility.hygiene.dryFloor },
        ]
      : [
          { label: 'Hand Soap', ok: facility.hygiene.soap },
          { label: 'Toilet Paper', ok: facility.hygiene.tissue },
          { label: 'Dry Floor', ok: facility.hygiene.dryFloor },
          { label: 'Ventilation', ok: facility.hygiene.ventilation },
        ];

  const externalMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}&travelmode=walking`;

  return (
    <div className="flex flex-col h-full">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/70 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[40px] inline-flex items-center gap-1.5 px-2.5 py-1.5 -ml-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>All nearby</span>
        </button>

        <RatingScore rating={facility.rating} count={facility.ratingCount} />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto thin-scrollbar py-4 space-y-5 pr-1">
        {/* Title & Metadata */}
        <div>
          <div className="flex items-start gap-2.5">
            {facility.type === 'fountain' && <FountainPinIcon className="w-5 h-8 mt-0.5 shrink-0" />}
            <div>
              <h2 className="text-lg font-extrabold text-[#131b2e] dark:text-slate-50 leading-snug">
                {facility.name}
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                {formatDistance(facility.distanceMeters)}
                <span aria-hidden="true"> · </span>
                {facility.walkMinutes} min walk
                <span aria-hidden="true"> · </span>
                {facility.feeText}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <CrowdBadge crowd={facility.crowd} />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Updated {facility.lastUpdated}
            </span>
          </div>
        </div>

        {/* Access & Hours */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-[#0D8B99] dark:text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Access Note: </span>
              <span>{facility.floorNote}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-[#0D8B99] dark:text-cyan-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Hours: </span>
              <span className="tabular-nums">{facility.hours}</span>
            </div>
          </div>
        </div>

        {/* Accessibility & Amenities */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
            Accessibility &amp; Amenities
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {facility.amenities.map((tag) => (
              <AmenityBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>

        {/* Hygiene Breakdown */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
            Sanitation Check
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {hygieneItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
              >
                {item.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-emerald-400 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#D97706] dark:text-amber-400 shrink-0" aria-hidden="true" />
                )}
                <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Live Crowd Report */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
            Report Live Crowd
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'low', label: 'Low', active: 'bg-[#ECFDF5] text-[#065F46] border-[#059669] dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500' },
                { id: 'moderate', label: 'Moderate', active: 'bg-[#FFFBEB] text-[#92400E] border-[#D97706] dark:bg-amber-950 dark:text-amber-300 dark:border-amber-500' },
                { id: 'busy', label: 'Busy', active: 'bg-[#FEF2F2] text-[#991B1B] border-[#DC2626] dark:bg-red-950 dark:text-red-300 dark:border-red-500' },
              ] as { id: CrowdLevel; label: string; active: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateCrowd(facility.id, opt.id)}
                className={`min-h-[38px] px-2 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  facility.crowd === opt.id
                    ? opt.active
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rate & Review Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Rate Cleanliness
            </h3>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Cleanliness rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setDraftRating(star)}
                  aria-label={`Rate ${star} out of 5`}
                  className="p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B99] rounded"
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      star <= draftRating
                        ? 'fill-[#F59E0B] text-[#F59E0B]'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={draftComment}
            onChange={(e) => setDraftComment(e.target.value)}
            rows={2}
            maxLength={180}
            placeholder="Share a quick cleanliness or access tip..."
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D8B99] resize-none"
          />

          <div className="flex items-center justify-between gap-2">
            <select
              value={draftCrowd}
              onChange={(e) => setDraftCrowd(e.target.value as CrowdLevel)}
              aria-label="Crowd level during your visit"
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="low">Crowd: Low</option>
              <option value="moderate">Crowd: Moderate</option>
              <option value="busy">Crowd: Busy</option>
            </select>

            <button
              type="submit"
              className="min-h-[36px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D8B99] hover:bg-[#0b7884] text-white text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Post</span>
            </button>
          </div>

          {submittedNotice && (
            <p className="text-xs font-semibold text-[#059669] dark:text-emerald-400">
              Thanks! Rating &amp; crowd status updated.
            </p>
          )}
        </form>

        {/* Recent Reviews */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
            Community Notes ({facility.reviews.length})
          </h3>
          {facility.reviews.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No notes yet. Be the first to rate this spot.
            </p>
          ) : (
            <div className="space-y-2.5">
              {facility.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {rev.author}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {rev.rating}.0 ★ · {rev.timestamp}
                    </span>
                  </div>
                  {rev.comment && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2">
        {isNavigating ? (
          <button
            type="button"
            onClick={onStopNavigate}
            className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <span>Stop Walking Route</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate(facility)}
            className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D8B99] hover:bg-[#0b7884] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-sm font-semibold shadow-[0_8px_20px_-4px_rgba(13,139,153,0.35)] transition-colors"
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            <span>Walk Here ({facility.walkMinutes} min)</span>
          </button>
        )}

        <a
          href={externalMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Google Maps"
          aria-label="Open walking directions in Google Maps"
          className="min-w-[46px] min-h-[46px] inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
