import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = () => {
    console.log('Search params:', { location, checkIn, searchInput });
    // Here you would typically call an API or update the parent component
  };

  return (
    <div className="w-full bg-white shadow-lg h-[55px] rounded-full flex justify-center text-xs">
      <div className="w-[38%] rounded-full p-3 hover:bg-gray-100 transition-colors duration-250 relative">
        <p>Search</p>
        <input
          type="text"
          placeholder="Search for a club, event, or artist"
          className="bg-transparent border-none pt-2 pb-1 focus:outline-none placeholder:text-xs w-full" // Added w-full
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <div className="w-[25%] rounded-full p-3 hover:bg-gray-100 transition-colors duration-250 relative before:absolute before:content-[''] before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[1px] before:h-[55%] before:bg-gray-200 hover:before:bg-transparent">
        <p>Date</p>
        <input
          type="date"
          placeholder="Add dates"
          className="bg-transparent border-none pt-2 pb-1 focus:outline-none placeholder:text-xs w-full" // Added w-full
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />
      </div>
      <div className="w-[37%] rounded-full p-3 hover:bg-gray-100 transition-colors duration-250 relative">
        <p>Location</p>
        <input
          type="text"
          placeholder="Where are you going?"
          className="bg-transparent border-none pt-2 pb-1 focus:outline-none placeholder:text-xs w-full" // Added w-full
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 bg-[#ED8936] text-white text-xs p-2 rounded-full"
        >
          <Search size={16} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;