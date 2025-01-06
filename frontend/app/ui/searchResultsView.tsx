import React, { useState } from 'react';
import { MapIcon, LayoutGrid, ArrowUpDown, Search } from 'lucide-react';
import dynamic from 'next/dynamic';
import BarCard from '../ui/barCard';
import { Menu } from '@headlessui/react';
import { LatLngTuple } from 'leaflet';

// Dynamically import map component to prevent SSR issues
const Map = dynamic(() => import('../ui/map'), { 
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full animate-pulse rounded-lg bg-gray-800" />
  )
});

// Mock data for demonstration - replace with API call
const MOCK_RESULTS = [{
  _id: '1',
  username: 'club1',
  displayName: 'Awesome Club',
  description: 'The best club in town with amazing music and atmosphere.',
  formattedPrice: 3,
  reviews: Array(12),
  rating: 4.5,
  location: {
    coordinates: [23.72754, 37.97914] // Athens coordinates
  },
  address: 'Ermou 1, Athens',
  capacity: 300,
  minAge: 21,
  genres: ['House', 'Techno'],
  images: ['/club1.jpg'],
  features: ['VIP Area', 'Smoking Area', 'Dance Floor'],
  dressCode: 'Smart Casual',
  openingHours: {
    monday: { isOpen: true, open: '22:00', close: '04:00' },
    tuesday: { isOpen: true, open: '22:00', close: '04:00' },
    wednesday: { isOpen: true, open: '22:00', close: '04:00' },
    thursday: { isOpen: true, open: '22:00', close: '04:00' },
    friday: { isOpen: true, open: '22:00', close: '05:00' },
    saturday: { isOpen: true, open: '22:00', close: '05:00' },
    sunday: { isOpen: true, open: '22:00', close: '04:00' }
  }
}];

const SORT_OPTIONS = [
  { label: 'Best Match', value: 'relevance' },
  { label: 'Rating: High to Low', value: 'rating-desc' },
  { label: 'Rating: Low to High', value: 'rating-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Price: Low to High', value: 'price-asc' }
];

// Add interfaces at the top of the file
interface Club {
  _id: string;
  username: string;
  displayName: string;
  description: string;
  formattedPrice: number;
  reviews: any[];
  rating: number;
  location: {
    coordinates: number[];
  };
  address: string;
  capacity: number;
  minAge: number;
  genres: string[];
  images: string[];
  features: string[];
  dressCode: string;
  openingHours: {
    [key: string]: {
      isOpen: boolean;
      open: string;
      close: string;
    };
  };
}

interface ViewToggleProps {
  view: 'grid' | 'map';
  onViewChange: (view: 'grid' | 'map') => void;
}

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

interface ResultsInfoProps {
  total: number;
  query?: string;
  location?: string;
}

interface MapViewProps {
  results: Club[];
  onMarkerClick: (club: Club) => void;
}

interface GridViewProps {
  results: Club[];
}

interface MapMarker {
  id: string;
  position: number[];
  popup: string;
  onClick: () => void;
}

interface MapProps {
  center: number[];
  zoom: number;
  markers: MapMarker[];
  onMarkerClick: (club: Club) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => (
  <div className="inline-flex rounded-lg bg-gray-800 p-1">
    <button
      onClick={() => onViewChange('grid')}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors
        ${view === 'grid' 
          ? 'bg-orange-500 text-white' 
          : 'text-gray-400 hover:text-white'}`}
    >
      <LayoutGrid className="h-4 w-4" />
      <span>Grid</span>
    </button>
    <button
      onClick={() => onViewChange('map')}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors
        ${view === 'map' 
          ? 'bg-orange-500 text-white' 
          : 'text-gray-400 hover:text-white'}`}
    >
      <MapIcon className="h-4 w-4" />
      <span>Map</span>
    </button>
  </div>
);

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => (
  <Menu as="div" className="relative">
    <Menu.Button className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
      <ArrowUpDown className="h-4 w-4" />
      <span>Sort by: {SORT_OPTIONS.find(opt => opt.value === value)?.label}</span>
    </Menu.Button>
    
    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-gray-900 p-1 shadow-lg ring-1 ring-white/10 focus:outline-none">
      {SORT_OPTIONS.map((option) => (
        <Menu.Item key={option.value}>
          {({ active }) => (
            <button
              onClick={() => onChange(option.value)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm text-white
                ${active ? 'bg-orange-500' : 'hover:bg-gray-800'}`}
            >
              {option.label}
            </button>
          )}
        </Menu.Item>
      ))}
    </Menu.Items>
  </Menu>
);

const ResultsInfo: React.FC<ResultsInfoProps> = ({ total, query, location }) => (
  <div className="rounded-lg bg-gray-900 p-4">
    <h2 className="text-lg font-semibold text-white">
      {total} {total === 1 ? 'result' : 'results'} found
      {query && <span> for &quot;{query}&quot;</span>}
      {location && <span> in {location}</span>}
    </h2>
    <p className="mt-1 text-sm text-gray-400">
      Click on a club to see more details
    </p>
  </div>
);

const MapView: React.FC<MapViewProps> = ({ results, onMarkerClick }) => (
  <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
    <Map
      center={[23.72754, 37.97914] as LatLngTuple}
      zoom={13}
      markers={results.map(club => ({
        id: club._id,
        position: club.location.coordinates.reverse() as LatLngTuple,
        title: club.displayName,
        rating: club.rating,
        reviewCount: club.reviews.length,
        address: club.address
      }))}
      selectedMarkerId={null}
      onMarkerClick={(id) => {
        const club = results.find(c => c._id === id);
        if (club) onMarkerClick(club);
      }}
    />
  </div>
);

const GridView: React.FC<GridViewProps> = ({ results }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {results.map((club) => (
      <BarCard
        key={club._id}
        _id={club._id}
        username={club.username}
        imageUrl={club.images[0]}
        imageAlt={club.displayName}
        title={club.displayName}
        description={club.description}
        formattedPrice={club.formattedPrice}
        reviewCount={club.reviews.length}
        location={club.address}
        rating={club.rating}
        features={club.features}
        capacity={club.capacity}
        dressCode={club.dressCode}
        openingHours={club.openingHours}
      />
    ))}
  </div>
);

const NoResults = () => (
  <div className="flex h-96 flex-col items-center justify-center rounded-lg bg-gray-900 text-center">
    <div className="rounded-full bg-gray-800 p-4">
      <Search className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="mt-4 text-xl font-semibold text-white">No results found</h3>
    <p className="mt-2 text-gray-400">
      Try adjusting your search filters or try a different location
    </p>
  </div>
);

const SearchResultsView: React.FC = () => {
  const [view, setView] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [results, setResults] = useState<Club[]>(MOCK_RESULTS);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Here you would fetch results based on filters
  // useEffect(() => {
  //   const fetchResults = async () => {
  //     setIsLoading(true);
  //     try {
  //       const data = await searchClubs({ filters, sortBy });
  //       setResults(data);
  //     } catch (error) {
  //       console.error('Error fetching results:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchResults();
  // }, [filters, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-gray-800" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-lg bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ResultsInfo
          total={results.length}
          query="nightclub"
          location="Athens"
        />
        <div className="flex items-center gap-4">
          <SortDropdown value={sortBy} onChange={setSortBy} />
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {results.length > 0 ? (
        view === 'grid' ? (
          <GridView results={results} />
        ) : (
          <MapView
            results={results}
            onMarkerClick={setSelectedClub}
          />
        )
      ) : (
        <NoResults />
      )}
    </div>
  );
};

export default SearchResultsView;