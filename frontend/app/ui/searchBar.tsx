"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchBars, getSearchSuggestions, geocode } from '../lib/backendAPI';
import debounce from 'lodash/debounce';
import { formatDateForAPI, parseDate } from '../lib/date-utils';

interface SearchSuggestion {
  _id: string;
  displayName: string;
  location: {
    address: string;
  };
  score: number;
}

interface SearchBarProps {
  currentFilter?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ currentFilter }) => {
  const router = useRouter();
  const [locationInput, setLocationInput] = useState('');
  const [locationCoords, setLocationCoords] = useState('');
  const [date, setDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [focusedInput, setFocusedInput] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchBarRef = useRef<HTMLDivElement>(null);

  // Handle location geocoding
  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    
    if (value.length > 2) {
      try {
        const geocodeResult = await geocode(value);
        if (geocodeResult.results && geocodeResult.results[0]) {
          const { lat, lng } = geocodeResult.results[0].geometry.location;
          setLocationCoords(`${lat},${lng}`);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setLocationCoords('');
      }
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      
      if (searchInput) searchParams.append('q', searchInput);
      if (locationCoords) {
        searchParams.append('location', locationCoords);
        searchParams.append('address', locationInput);
      } else if (locationInput) {
        searchParams.append('location', locationInput);
      }
      if (date) searchParams.append('date', formatDateForAPI(new Date(date)));
  
      if (currentFilter && currentFilter !== 'trending') {
        searchParams.append('filter', currentFilter);
      }
  
      router.push(`/search?${searchParams.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search suggestions
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await getSearchSuggestions(query);
        if (results) {
          setSuggestions(results);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchInput(suggestion.displayName);
    setShowSuggestions(false);
    handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto" ref={searchBarRef}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-xl" />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-full shadow-2xl flex items-center p-2">
        {/* Search Input */}
        <div className="flex-1 min-w-0 px-4 py-2 group relative">
          <div className={`flex items-center space-x-2 p-2 rounded-full transition-all duration-300 
            ${focusedInput === 'search' ? 'bg-blue-50 dark:bg-gray-700' : ''}`}>
            <Search className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''} text-gray-400`} />
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400">Search</label>
              <input
                type="text"
                placeholder="Find your perfect night out..."
                className="w-full bg-transparent border-none focus:outline-none dark:text-white"
                value={searchInput}
                onChange={handleSearchInputChange}
                onFocus={() => setFocusedInput('search')}
                onBlur={() => setFocusedInput('')}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="font-medium">{suggestion.displayName}</div>
                  <div className="text-sm text-gray-500">{suggestion.location.address}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Date Input */}
        <div className="flex-1 min-w-0 px-4 py-2">
          <div className={`flex items-center space-x-2 p-2 rounded-full transition-all duration-300
            ${focusedInput === 'date' ? 'bg-blue-50 dark:bg-gray-700' : ''}`}>
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400">Date</label>
              <input
                type="date"
                className="w-full bg-transparent border-none focus:outline-none dark:text-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onFocus={() => setFocusedInput('date')}
                onBlur={() => setFocusedInput('')}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Location Input */}
        <div className="flex-1 min-w-0 px-4 py-2">
          <div className={`flex items-center space-x-2 p-2 rounded-full transition-all duration-300
            ${focusedInput === 'location' ? 'bg-blue-50 dark:bg-gray-700' : ''}`}>
            <MapPin className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400">Location</label>
              <input
                type="text"
                placeholder="Where to?"
                className="w-full bg-transparent border-none focus:outline-none dark:text-white"
                value={locationInput}
                onChange={handleLocationChange}
                onFocus={() => setFocusedInput('location')}
                onBlur={() => setFocusedInput('')}
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className={`ml-2 px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full
                     transform transition-all duration-300 hover:scale-105 hover:shadow-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
                     disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;