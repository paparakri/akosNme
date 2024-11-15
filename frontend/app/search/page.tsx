"use client"

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Moon, Music, Star, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '../ui/searchBar';
import { searchBars } from '../lib/backendAPI';
import Link from 'next/link';
import BarCard from '../ui/barCard';

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const [results, setResults] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0
  });

  // Get search parameters
  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const dateParam = searchParams.get('date') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const filters = [
    { id: 'all', label: 'All Venues', icon: Moon },
    { id: 'trending', label: 'Trending', icon: Star },
    { id: 'events', label: 'Live Events', icon: Music },
    { id: 'nearby', label: 'Nearby', icon: MapPin },
  ];

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResponse = await searchBars({
          searchQuery: query,
          location,
          date: dateParam,
          page,
          limit: 10
        });

        if (searchResponse) {
          setResults(searchResponse.results);
          setPagination({
            currentPage: page,
            totalPages: searchResponse.pagination.pages,
            totalResults: searchResponse.pagination.total
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, location, dateParam, page]); // Dependencies from searchParams

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Search */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-black/50 to-black pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Discover Your Perfect Night
          </h1>
          
          <div className="max-w-4xl mx-auto">
            <SearchBar />

            {/* Filters */}
            <div className="mt-6 flex justify-center space-x-4">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 ${
                    selectedFilter === filter.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <filter.icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search info */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            {isLoading ? (
              'Searching...'
            ) : error ? (
              'Error loading results'
            ) : (
              `${pagination.totalResults} results found ${query ? `for "${query}"` : ''} ${location ? `in ${location}` : ''}`
            )}
          </h2>
          {dateParam && (
            <p className="text-gray-400">
              For {new Date(dateParam).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.length > 0 ? (
              results.map((club) => (
                <BarCard
                  username={club.username}
                  imageUrl={club.images ? club.images[0].toString() : '/default-club.jpeg'}
                  imageAlt={club.displayName}
                  title={club.displayName}
                  description={club.description}
                  formattedPrice={club.formattedPrice}
                  reviewCount={club.reviews.length}
                  location={club.address}
                  rating={club.rating}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">No results found. Try adjusting your search.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => {
                    const newSearchParams = new URLSearchParams(searchParams.toString());
                    newSearchParams.set('page', pageNum.toString());
                    window.history.pushState({}, '', `?${newSearchParams.toString()}`);
                  }}
                  className={`px-4 py-2 rounded-md ${
                    pageNum === pagination.currentPage
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;