'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Music, Calendar, Users, Clock, MapPin,
  Star, PartyPopper, Award, Search, X, Filter, ArrowRight, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fetchClubInfo, getAllEvents } from '../../lib/backendAPI';
import { sortEventsByType } from '../../lib/eventSorting';
import debounce from 'lodash/debounce';

interface Club {
  _id: string;
  displayName: string;
  [key: string]: any;
}

interface Event {
  _id: string;
  name: string;
  date: string;
  startTime: string;
  price: number;
  availableTickets: number;
  images: string[];
  club: Club;
  description?: string;
  [key: string]: any;
}

interface EventCategory {
  _id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

// Event categories configuration
const EVENT_CATEGORIES: EventCategory[] = [
  {
    _id: 'featured',
    title: 'Featured Events',
    description: 'Handpicked events you can\'t miss',
    icon: Star,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    _id: 'today',
    title: 'Happening Today',
    description: 'Don\'t miss out on tonight\'s excitement',
    icon: Calendar,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    _id: 'weekend',
    title: 'Weekend Highlights',
    description: 'Plan your weekend festivities',
    icon: PartyPopper,
    gradient: 'from-amber-500 to-red-500'
  },
  {
    _id: 'concerts',
    title: 'Live Performances',
    description: 'Experience live music and shows',
    icon: Music,
    gradient: 'from-green-500 to-teal-500'
  },
  {
    _id: 'exclusive',
    title: 'VIP Events',
    description: 'Exclusive gatherings and premium experiences',
    icon: Award,
    gradient: 'from-indigo-500 to-purple-500'
  }
];

interface SearchBarProps {
  onSearch: (term: string) => void;
  onClear: () => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear, isSearching }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useRef(
    debounce((term: string) => {
      onSearch(term);
    }, 300)
  ).current;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      debouncedSearch(value);
    } else {
      onClear();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onClear();
  };

  return (
    <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl" />
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search events, artists, or venues..."
          className="w-full bg-white/10 backdrop-blur-xl text-white placeholder-gray-400 
                   px-12 py-4 rounded-2xl border border-white/10 focus:border-purple-500
                   focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        {searchTerm && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 
                     hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="relative group min-w-[300px] max-w-[300px] bg-white/5 backdrop-blur-xl 
                 rounded-2xl overflow-hidden border border-white/10"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.images[0] || '/default-event.jpg'}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full 
                      border border-white/20 text-white text-sm font-medium">
          €{event.price}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-white line-clamp-2">
          {event.name}
        </h3>

        <div className="space-y-2 text-gray-300">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{format(new Date(event.date), 'EEEE, MMMM do')}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{format(new Date(event.startTime), 'h:mm a')}</span>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm line-clamp-1">{event.club?.displayName || 'Venue TBA'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">{event.availableTickets} tickets left</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 mt-2 bg-gradient-to-r from-blue-500 to-purple-500 
                   rounded-lg text-white font-medium shadow-lg shadow-purple-500/20 
                   hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
        >
          Get Tickets
        </motion.button>
      </div>
    </motion.div>
  );
};

interface ScrollableEventListProps {
  title: string;
  description: string;
  events: Event[];
  icon: React.ElementType;
  gradient: string;
}

const ScrollableEventList: React.FC<ScrollableEventListProps> = ({ title, description, events, icon: Icon, gradient }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [events]);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 100);
    }
  };

  if (!events || events.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent
                       flex items-center gap-2`}>
            <Icon className="w-6 h-6" />
            {title}
          </h2>
          <p className="text-gray-400">{description}</p>
        </div>

        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full ${
              canScrollLeft ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full ${
              canScrollRight ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        onScroll={checkScroll}
      >
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
};

interface SearchResultsProps {
  events: Event[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ events }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </motion.div>
  );
};

interface EventsState {
  featured: Event[];
  today: Event[];
  weekend: Event[];
  concerts: Event[];
  exclusive: Event[];
}

const ExploreEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventsState>({
    featured: [],
    today: [],
    weekend: [],
    concerts: [],
    exclusive: []
  });
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsObj = await getAllEvents();
        const futureEvents = eventsObj.filter((event: { date: string | number | Date; }) => new Date(event.date) >= new Date());
        
        const eventsWithClubNames = await Promise.all(
          futureEvents.map(async (event: { club: any; _id: any; }) => {
            try {
              const club = await fetchClubInfo(event.club);
              return {
                ...event,
                club: {
                  ...event.club,
                  displayName: club.displayName
                }
              };
            } catch (error) {
              console.error(`Error fetching club info for event ${event._id}:`, error);
              return {
                ...event,
                club: {
                  ...event.club,
                  displayName: 'Venue TBA'
                }
              };
            }
          })
        );

        const sortedEvents = sortEventsByType(eventsWithClubNames);
        setEvents(sortedEvents as EventsState);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents({
          featured: [],
          today: [],
          weekend: [],
          concerts: [],
          exclusive: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSearch = (term: string) => {
    setIsSearching(true);
    const allEvents = [
      ...events.featured,
      ...events.today,
      ...events.weekend,
      ...events.concerts,
      ...events.exclusive
    ];

    const filtered = allEvents.filter((event) => {
      const searchTerm = term.toLowerCase();
      return (
        event.name.toLowerCase().includes(searchTerm) ||
        event.club?.displayName.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm)
      );
    });

    setSearchResults(filtered);
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Hero Section */}
      <div className="relative h-[50vh] mb-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-black/50 to-black" />
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            style={{
              position: 'absolute',
              inset: '-10%',
              backgroundImage: 'url("/events-hero.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
                      flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-3xl"
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 
                             bg-clip-text text-transparent">
                  Discover Amazing Events
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Experience unforgettable nights with the hottest events in town
              </p>
            </div>

            {/* Search Section */}
            <SearchBar 
              onSearch={handleSearch}
              onClear={clearSearch}
              isSearching={isSearching}
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {searchResults.length ? (
                    `Found ${searchResults.length} events`
                  ) : (
                    'No events found'
                  )}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearSearch}
                  className="px-4 py-2 bg-white/10 rounded-lg text-white 
                           hover:bg-white/20 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Clear Search</span>
                </motion.button>
              </div>

              {searchResults.length > 0 ? (
                <SearchResults events={searchResults} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white/5 rounded-2xl border border-white/10"
                >
                  <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                  <p className="text-gray-400">Try adjusting your search terms</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="category-lists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              {EVENT_CATEGORIES.map((category) => (
                <ScrollableEventList
                  key={category._id}
                  title={category.title}
                  description={category.description}
                  events={events[category._id as keyof EventsState]} // Type assertion to fix the error
                  icon={category.icon}
                  gradient={category.gradient}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExploreEventsPage;