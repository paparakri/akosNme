import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, CalendarDays, MapPin, Music, Users, DollarSign } from 'lucide-react';
import { Popover, Transition } from '@headlessui/react'
import { format } from 'date-fns';

interface PriceRangeInputProps {
  value: string;
  onChange: (value: string) => void;
}

interface FilterButtonProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

interface FilterPopoverProps {
  children: React.ReactNode;
  buttonIcon: React.ElementType;
  buttonLabel: string;
}

interface Filters {
  date: string;
  location: string;
  radius: string;
  minPrice: string;
  maxPrice: string;
  genres: string[];
  capacity: string;
}

const RADIUS_OPTIONS = [
  { value: '1', label: '1 km' },
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '25', label: '25 km' }
];

const GENRES = [
  'House',
  'Techno',
  'Hip-Hop',
  'R&B',
  'Latin',
  'Pop',
  'Rock',
  'Jazz',
  'Live Music'
];

const CAPACITY_RANGES = [
  { value: '0-100', label: 'Up to 100' },
  { value: '100-250', label: '100-250' },
  { value: '250-500', label: '250-500' },
  { value: '500+', label: '500+' }
];

const PriceRangeInput = ({ value, onChange }: PriceRangeInputProps) => {
  const [min, max] = value.split('-').map(Number);

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={min}
        onChange={(e) => onChange(`${e.target.value}-${max}`)}
        className="w-20 rounded-md bg-gray-800 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        placeholder="Min"
      />
      <span className="text-gray-400">-</span>
      <input
        type="number"
        min="0"
        value={max}
        onChange={(e) => onChange(`${min}-${e.target.value}`)}
        className="w-20 rounded-md bg-gray-800 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        placeholder="Max"
      />
    </div>
  );
};

const FilterButton = ({ icon: Icon, label, active = false, onClick }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300
      ${active 
        ? 'bg-orange-500 text-white' 
        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

const FilterPopover = ({ children, buttonIcon: Icon, buttonLabel }: FilterPopoverProps) => (
  <Popover className="relative">
    {({ open }) => (
      <>
        <Popover.Button
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300
            ${open 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          <Icon className="h-4 w-4" />
          <span>{buttonLabel}</span>
        </Popover.Button>

        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Popover.Panel className="absolute z-10 mt-2 w-60 rounded-lg bg-gray-900 p-4 shadow-lg ring-1 ring-white/10">
            {children}
          </Popover.Panel>
        </Transition>
      </>
    )}
  </Popover>
);

const EnhancedSearchFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    date: searchParams.get('date') || '',
    location: searchParams.get('location') || '',
    radius: searchParams.get('radius') || '10',
    minPrice: searchParams.get('minPrice') || '0',
    maxPrice: searchParams.get('maxPrice') || '100',
    genres: searchParams.get('genres')?.split(',') || [],
    capacity: searchParams.get('capacity') || '0-100'
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleGenreToggle = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleFilterClear = (key: keyof Filters) => {
    setFilters(prev => ({
      ...prev,
      [key]: Array.isArray(prev[key]) ? [] : ''
    }));
  };

  return (
    <div className="space-y-6">
      {/* Main Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clubs..."
            className="w-full rounded-full bg-gray-800 py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="rounded-full bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
        >
          Search
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* Date Filter */}
        <FilterPopover buttonIcon={CalendarDays} buttonLabel="Date">
          <div className="space-y-4">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-md bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </FilterPopover>

        {/* Location Radius Filter */}
        <FilterPopover buttonIcon={MapPin} buttonLabel="Distance">
          <div className="space-y-2">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilters(prev => ({ ...prev, radius: option.value }))}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors
                  ${filters.radius === option.value
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterPopover>

        {/* Price Range Filter */}
        <FilterPopover buttonIcon={DollarSign} buttonLabel="Price">
          <div className="space-y-4">
            <label className="text-sm text-gray-400">Price Range</label>
            <PriceRangeInput
              value={`${filters.minPrice}-${filters.maxPrice}`}
              onChange={(value) => {
                const [min, max] = value.split('-');
                setFilters(prev => ({
                  ...prev,
                  minPrice: min,
                  maxPrice: max
                }));
              }}
            />
          </div>
        </FilterPopover>

        {/* Music Genres Filter */}
        <FilterPopover buttonIcon={Music} buttonLabel="Genres">
          <div className="grid grid-cols-2 gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreToggle(genre)}
                className={`rounded-md px-3 py-2 text-sm transition-colors
                  ${filters.genres.includes(genre)
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800'}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </FilterPopover>

        {/* Capacity Filter */}
        <FilterPopover buttonIcon={Users} buttonLabel="Capacity">
          <div className="space-y-2">
            {CAPACITY_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setFilters(prev => ({ ...prev, capacity: range.value }))}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors
                  ${filters.capacity === range.value
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800'}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </FilterPopover>
      </div>

      {/* Active Filters Display */}
      {Object.values(filters).some(value => 
        value && (!Array.isArray(value) || value.length > 0)
      ) && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            return (
              <div
                key={key}
                className="flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1 text-sm text-orange-400"
              >
                <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                <button
                  onClick={() => handleFilterClear(key as keyof Filters)}
                  className="hover:text-white"
                >
                  ×
                </button>
              </div>
            );
          })}
          <button
            onClick={() => setFilters({
              date: '',
              location: '',
              radius: '10',
              minPrice: '0',
              maxPrice: '100',
              genres: [],
              capacity: '0-100'
            })}
            className="text-sm text-gray-400 hover:text-white"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchFilters;