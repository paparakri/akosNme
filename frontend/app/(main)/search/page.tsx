"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaFire, FaGlassMartini, FaGraduationCap, FaUsers, FaHeart, FaGuitar, FaSort } from 'react-icons/fa';
import { Filter, DollarSign, Clock, Music } from 'lucide-react';
import Link from 'next/link';
import { Popover, Transition } from '@headlessui/react';
import BarCard from '../../ui/barCard';
import SearchBar from '../../ui/searchBar';
import { searchBars } from '../../lib/backendAPI';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import PaginatedBarCards from '../../ui/paginatedBarCards';

// Types
interface Bar {
  _id: string;
  username: string;
  displayName: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  formattedPrice: number;
  rating: number;
  reviews: string[];
  images?: string[];
  amenities?: string[];
  score?: number;
}

interface SearchParams {
  searchQuery: string;
  location: string;
  date: string;
  page: number;
  limit: number;
  filter: string;
  sort: string;
  minPrice?: number;
  minAge?: string;
  features?: string[];
}

interface AdditionalFilters {
  minPrice: string;
  minAge: string;
  features: string[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  rating: number;
  reviewCount: number;
  address: string;
}

interface MapProps {
  center: [number, number];
  markers: MapMarker[];
  onMarkerClick: (id: string) => void;
}

const Map = dynamic(() => import('../../ui/map').then(mod => mod.default as unknown as React.ComponentType<MapProps>), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full animate-pulse rounded-lg bg-gray-800 relative z-[20]" />
  )
});

const FEATURES = [
  { value: 'VIP Tables', label: 'VIP Tables' },
  { value: 'Smoking Area', label: 'Smoking Area' },
  { value: 'Dance Floor', label: 'Dance Floor' },
  { value: 'Live Music', label: 'Live Music' },
  { value: 'Outdoor Seating', label: 'Outdoor Seating' },
  { value: 'Parking', label: 'Parking Available' },
  { value: 'Food Service', label: 'Food Service' },
  { value: 'Bottle Service', label: 'Bottle Service' }
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated', icon: FaStar },
  { value: 'price_low', label: 'Price: Low to High', icon: FaArrowDown },
  { value: 'price_high', label: 'Price: High to Low', icon: FaArrowUp },
  { value: 'popularity', label: 'Most Popular', icon: FaFire }
];

interface SortingControlProps {
  value: string;
  onChange: (value: string) => void;
}

const SortingControl: React.FC<SortingControlProps> = ({ value, onChange }) => (
  <Popover className="relative">
    {({ open }) => (
      <>
        <Popover.Button
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300
            ${open 
              ? 'bg-purple-600 text-white' 
              : 'bg-white/5 hover:bg-white/10'}`}
        >
          <FaSort className="h-4 w-4" />
          <span>Sort By</span>
          {value !== 'rating' && (
            <span className="ml-2 text-xs text-purple-400">
              {SORT_OPTIONS.find(opt => opt.value === value)?.label || 'Rating'}
            </span>
          )}
        </Popover.Button>

        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Popover.Panel className="absolute right-0 z-[60] mt-2 w-56 rounded-lg bg-gray-900 p-2 shadow-lg ring-1 ring-white/10">
            <div className="space-y-1">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onChange(option.value)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors
                    ${value === option.value 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-300 hover:bg-white/5'}`}
                >
                  <option.icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </Popover.Panel>
        </Transition>
      </>
    )}
  </Popover>
);

interface AdditionalFiltersProps {
  filters: AdditionalFilters;
  onChange: (key: keyof AdditionalFilters, value: string | string[]) => void;
}

const AdditionalFilters: React.FC<AdditionalFiltersProps> = ({ filters, onChange }) => (
  <Popover className="relative">
    {({ open }) => (
      <>
        <Popover.Button
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300
            ${open 
              ? 'bg-purple-600 text-white' 
              : 'bg-white/5 hover:bg-white/10'}`}
        >
          <Filter className="h-4 w-4" />
          <span>More Filters</span>
          {Object.values(filters).some(Boolean) && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </Popover.Button>

        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Popover.Panel
            className="absolute right-0 z-[60] mt-2 w-80 rounded-lg bg-gray-900 p-4 shadow-lg ring-1 ring-white/10"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Maximum Price</label>
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => onChange('minPrice', e.target.value)}
                  className="mt-1 w-full rounded-md bg-gray-800 px-3 py-2 text-white"
                  placeholder="Enter maximum price"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Show venues within your budget
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Your Age</label>
                <select
                  value={filters.minAge}
                  onChange={(e) => onChange('minAge', e.target.value)}
                  className="mt-1 w-full rounded-md bg-gray-800 px-3 py-2 text-white"
                >
                  <option value="">Any age</option>
                  <option value="18">18+</option>
                  <option value="21">21+</option>
                  <option value="23">23+</option>
                  <option value="25">25+</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Show venues suitable for your age
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Features</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {FEATURES.map((feature) => (
                    <label key={feature.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.features?.includes(feature.value)}
                        onChange={(e) => {
                          const newFeatures = e.target.checked
                            ? [...(filters.features || []), feature.value]
                            : (filters.features || []).filter(f => f !== feature.value);
                          onChange('features', newFeatures);
                        }}
                        className="mr-2 rounded border-gray-600 bg-gray-700 text-purple-500"
                      />
                      <span className="text-sm text-gray-300">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </>
    )}
  </Popover>
);

// Create a client component that uses useSearchParams
const SearchResultsContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSort = searchParams.get('sort') || 'rating';
  const initialFilter = searchParams.get('filter') || 'all';
  const initialView = searchParams.get('view') || 'grid';
  const initialPage = parseInt(searchParams.get('page') || '1');
  
  const initialAdditionalFilters: AdditionalFilters = {
    minPrice: searchParams.get('minPrice') || '',
    minAge: searchParams.get('minAge') || '',
    features: searchParams.get('features')?.split(',').filter(Boolean) || []
  };

  const [results, setResults] = useState<Bar[]>([]);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState(initialView);
  const [additionalFilters, setAdditionalFilters] = useState<AdditionalFilters>(initialAdditionalFilters);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: initialPage,
    totalPages: 1,
    totalResults: 0
  });
  const [allResults, setAllResults] = useState<Bar[]>([]);
  const [sortBy, setSortBy] = useState(initialSort);

  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const dateParam = searchParams.get('date') || '';

  const filters = [
    { id: 'all', label: 'All Venues', icon: FaGlassMartini },
    { id: 'trending', label: 'Trending', icon: FaFire },
    { id: 'luxury', label: 'Luxury', icon: FaGlassMartini },
    { id: 'student', label: 'Student Friendly', icon: FaGraduationCap },
    { id: 'groups', label: 'Group Friendly', icon: FaUsers },
    { id: 'date', label: 'Date Night', icon: FaHeart },
    { id: 'live', label: 'Live Music', icon: FaGuitar }
  ];

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`/search?${params.toString()}`);
  }, [view, router, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (additionalFilters.minPrice) {
      params.set('minPrice', additionalFilters.minPrice);
    } else {
      params.delete('minPrice');
    }
    
    if (additionalFilters.minAge) {
      params.set('minAge', additionalFilters.minAge);
    } else {
      params.delete('minAge');
    }
    
    if (additionalFilters.features.length > 0) {
      params.set('features', additionalFilters.features.join(','));
    } else {
      params.delete('features');
    }
    
    router.push(`/search?${params.toString()}`);
  }, [additionalFilters, router, searchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
    
      try {
        const searchParams: SearchParams = {
          searchQuery: query,
          location,
          date: dateParam,
          page: 1,
          limit: 10,
          filter: selectedFilter,
          sort: sortBy,
          minPrice: additionalFilters.minPrice ? Number(additionalFilters.minPrice) : undefined,
          minAge: additionalFilters.minAge,
          features: additionalFilters.features
        };

        const initialResponse = await searchBars(searchParams);

        if (!initialResponse) {
          throw new Error('Failed to fetch initial results');
        }

        const totalPages = Math.ceil(initialResponse.pagination.total / 10);
        const allResponse = totalPages > 1 ? await Promise.all(
          Array.from({ length: totalPages }, (_, i) =>
            searchBars({
              ...searchParams,
              page: i + 1
            })
          )
        ).then(responses => ({
          results: responses.filter(Boolean).flatMap(r => r?.results || []),
          pagination: initialResponse.pagination
        })) : initialResponse;
    
        if (allResponse) {
          setAllResults(allResponse.results);
        }
    
        if (view === 'grid') {
          const paginatedResponse = await searchBars({
            ...searchParams,
            page: pagination.currentPage
          });
    
          if (paginatedResponse) {
            setResults(paginatedResponse.results);
            setPagination(prev => ({
              ...prev,
              totalPages: paginatedResponse.pagination.pages,
              totalResults: paginatedResponse.pagination.total
            }));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    const debounced = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounced);
  }, [
    query, 
    location, 
    dateParam, 
    selectedFilter, 
    sortBy,
    pagination.currentPage,
    view === 'grid' ? view : null,
    JSON.stringify(additionalFilters)
  ]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-black/50 to-black pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Discover Your Perfect Night
          </h1>
          
          <div className="max-w-4xl mx-auto">
            <SearchBar />

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setSelectedFilter(filter.id);
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('filter', filter.id);
                    params.set('page', '1');
                    router.push(`/search?${params.toString()}`);
                  }}
                  className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300
                    ${selectedFilter === filter.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <filter.icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              ))}
              
              <AdditionalFilters
                filters={additionalFilters}
                onChange={(key, value) => {
                  setAdditionalFilters(prev => ({
                    ...prev,
                    [key]: value
                  }));
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', '1');
                  router.push(`/search?${params.toString()}`);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-xl font-semibold">
            {isLoading ? (
              'Searching...'
            ) : error ? (
              'Error loading results'
            ) : (
              `${(view === 'grid') ? pagination.totalResults : allResults.length} results found`
            )}
          </h2>
          <div className="flex items-center gap-4">
            <SortingControl
              value={sortBy}
              onChange={(value) => {
                setSortBy(value);
                const params = new URLSearchParams(searchParams.toString());
                params.set('sort', value);
                params.set('page', '1');
                router.push(`/search?${params.toString()}`);
              }}
            />
            {view === 'grid' ? (
              <button
                onClick={() => setView('map')}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Show Map
              </button>
            ) : (
              <button
                onClick={() => setView('grid')}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Show Grid
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500 p-4 text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          view === 'grid' ? (
            <PaginatedBarCards
              results={allResults}
            />
          ) : (
            <div className="h-[600px] rounded-lg overflow-hidden">
              <Map
                center={[37.97914, 23.72754]}
                markers={allResults.map((club): MapMarker => ({
                  id: club._id,
                  position: [
                    club.location.coordinates[1],
                    club.location.coordinates[0]
                  ] as [number, number],
                  title: club.displayName,
                  rating: club.rating,
                  reviewCount: club.reviews?.length || 0,
                  address: club.location.address
                }))}
                onMarkerClick={(id: string) => {
                  const club = allResults.find(c => c._id === id);
                  if (club) {
                    router.push(`/club/${club.username}`);
                  }
                }}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Create a loading component
const SearchResultsLoading = () => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
  </div>
);

// Main page component that wraps the content in Suspense
const SearchResultsPage: React.FC = () => {
  return (
    <Suspense fallback={<SearchResultsLoading />}>
      <SearchResultsContent />
    </Suspense>
  );
};

export default SearchResultsPage;