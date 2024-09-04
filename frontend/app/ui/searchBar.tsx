import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const handleSearch = () => {
    console.log('Search params:', { location, checkIn, checkOut, guests });
    // Here you would typically call an API or update the parent component
  };

  return (
    <div className="w-[100%] bg-white shadow-lg h-[55px] rounded-full flex justify-center text-xs">
      <div className="w-[34%] rounded-full p-3 hover:bg-gray-100 transition-colors duration-250 relative">
        <p>Location</p>
        <input
          type="text"
          placeholder="Where are you going?"
          className="bg-transparent border-none pt-1 focus:outline-none placeholder:text-xs"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="w-[22%] rounded-full p-3 hover:bg-gray-100 transition-colors duration-250 relative before:absolute before:content-[''] before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[1px] before:h-[55%] before:bg-gray-200 hover:before:bg-transparent">
        <p>Check in</p>
        <input
          type="date"
          placeholder="Add dates"
          className="bg-transparent border-none pt-1 focus:outline-none placeholder:text-xs"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />
      </div>
      <div className="w-[22%] rounded-full p-3 hover:bg-gray-100 transition-colors duration-250 relative before:absolute before:content-[''] before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[1px] before:h-[55%] before:bg-gray-200 hover:before:bg-transparent">
        <p>Check out</p>
        <input
          type="date"
          placeholder="Add dates"
          className="bg-transparent border-none pt-1 focus:outline-none placeholder:text-xs"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </div>
      <div className="w-[22%] rounded-full p-3 hover:bg-gray-100 transition-colors duration-250 relative before:absolute before:content-[''] before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[1px] before:h-[55%] before:bg-gray-200 hover:before:bg-transparent">
        <p>Guests</p>
        <input
          type="number"
          placeholder="Add guests"
          className="bg-transparent border-none pt-1 focus:outline-none placeholder:text-xs"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
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