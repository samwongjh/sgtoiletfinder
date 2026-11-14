import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AmenityTag, FacilityType } from '../types/facility';
import { FountainPinIcon } from './BrandAssets';

interface AddPinModalProps {
  isOpen: boolean;
  coords: { lat: number; lng: number };
  pinType: FacilityType;
  onChangeType: (t: FacilityType) => void;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: FacilityType;
    floorNote: string;
    district: string;
    amenities: AmenityTag[];
    isFree: boolean;
  }) => void;
}

export const AddPinModal: React.FC<AddPinModalProps> = ({
  isOpen,
  coords,
  pinType,
  onChangeType,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [floorNote, setFloorNote] = useState('');
  const [district, setDistrict] = useState('Central Singapore');
  const [amenities, setAmenities] = useState<AmenityTag[]>(['wheelchair', 'free']);

  if (!isOpen) return null;

  const toggleAmenity = (tag: AmenityTag) => {
    setAmenities((prev) => (prev.includes(tag) ? prev.filter((a) => a !== tag) : [...prev, tag]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      type: pinType,
      floorNote: floorNote.trim() || 'Ground floor public access',
      district: district.trim() || 'Singapore',
      amenities,
      isFree: amenities.includes('free'),
    });
    setName('');
    setFloorNote('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-pin-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-xs"
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="add-pin-title" className="text-lg font-extrabold text-[#131b2e] dark:text-slate-50">
            Map New Facility
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onChangeType('toilet')}
            className={`min-h-[42px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-colors ${
              pinType === 'toilet'
                ? 'bg-[#0D8B99] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>Public Toilet</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeType('fountain')}
            className={`min-h-[42px] flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-colors ${
              pinType === 'fountain'
                ? 'bg-[#059669] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <FountainPinIcon className="w-3.5 h-5" />
            <span>Drinking Bubbler</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="pin-name"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Location Name
            </label>
            <input
              id="pin-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                pinType === 'toilet'
                  ? 'e.g. Raffles City B1 Restroom'
                  : 'e.g. Marina Promenade Water Point'
              }
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D8B99]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="pin-floor"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Floor / Access Note
              </label>
              <input
                id="pin-floor"
                type="text"
                value={floorNote}
                onChange={(e) => setFloorNote(e.target.value)}
                placeholder="e.g. Level 2 near lift lobby"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D8B99]"
              />
            </div>
            <div>
              <label
                htmlFor="pin-district"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                District / Area
              </label>
              <input
                id="pin-district"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Clarke Quay"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0D8B99]"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Features
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'wheelchair', label: 'Wheelchair' },
                  { id: 'baby-care', label: 'Baby Care' },
                  { id: 'nursing', label: 'Nursing Room' },
                  { id: 'bidet', label: 'Bidet' },
                  { id: 'free', label: 'Free Access' },
                  { id: '24h', label: '24 Hours' },
                ] as { id: AmenityTag; label: string }[]
              ).map((item) => {
                const selected = amenities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAmenity(item.id)}
                    className={`min-h-[34px] inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      selected
                        ? 'bg-[#0D8B99]/12 border-[#0D8B99] text-[#006671] dark:bg-cyan-500/20 dark:border-cyan-400 dark:text-cyan-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" aria-hidden="true" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            Pin coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[44px] rounded-xl bg-[#0D8B99] hover:bg-[#0b7884] text-white text-sm font-semibold shadow-md transition-colors"
            >
              Save Pin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
