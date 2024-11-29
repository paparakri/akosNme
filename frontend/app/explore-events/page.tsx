'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Music, Calendar, Users, Clock, MapPin, Star, PartyPopper, Award, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fetchClubInfo, getAllEvents } from '../lib/backendAPI';
import { sortEventsByType } from '../lib/eventSorting';

// Event categories with their respective properties
const EVENT_CATEGORIES = [
  {
    id: 'featured',
    title: 'Featured Events',
    description: 'Handpicked events you can\'t miss',
    icon: Star,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'today',
    title: 'Happening Today',
    description: 'Don\'t miss out on tonight\'s excitement',
    icon: Calendar,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'weekend',
    title: 'Weekend Highlights',
    description: 'Plan your weekend festivities',
    icon: PartyPopper,
    gradient: 'from-amber-500 to-red-500'
  },
  {
    id: 'concerts',
    title: 'Live Performances',
    description: 'Experience live music and shows',
    icon: Music,
    gradient: 'from-green-500 to-teal-500'
  },
  {
    id: 'exclusive',
    title: 'VIP Events',
    description: 'Exclusive gatherings and premium experiences',
    icon: Award,
    gradient: 'from-indigo-500 to-purple-500'
  }
];

const EventCard = ({ event }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="relative group min-w-[300px] max-w-[300px] bg-white/5 backdrop-blur-xl 
                 rounded-2xl overflow-hidden border border-white/10"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.images[0] || '/default-event.jpg'}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Price Tag */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full 
                      border border-white/20 text-white text-sm font-medium">
          €{event.price}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-white line-clamp-2">
          {event.name}
        </h3>

        <div className="space-y-2 text-gray-300">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {format(new Date(event.date), 'EEEE, MMMM do')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {format(new Date(event.startTime), 'h:mm a')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm line-clamp-1">
              {event.club?.displayName || 'Venue TBA'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {event.availableTickets} tickets left
            </span>
          </div>
        </div>

        {/* Action Button */}
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

const ScrollableEventList = ({ title, description, events, icon: Icon, gradient }) => {
  const containerRef = React.useRef(null);
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

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 100);
    }
  };

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
              canScrollLeft
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-white/5 cursor-not-allowed'
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
              canScrollRight
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-white/5 cursor-not-allowed'
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

const ExploreEventsPage = () => {
  const [events, setEvents] = useState({
    featured: [],
    today: [],
    weekend: [],
    concerts: [],
    exclusive: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsObj = await getAllEvents();
        const futureEvents = eventsObj.filter((event) => new Date(event.date) >= new Date());
        
        // First, process the events to add display names
        const eventsWithClubNames = await Promise.all(
          futureEvents.map(async (event) => {
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
                  displayName: 'Venue TBA'  // Fallback if club fetch fails
                }
              };
            }
          })
        );

        // After all club names are fetched, sort the events
        const sortedEvents = sortEventsByType(eventsWithClubNames);
        
        console.log("Sorted Events: ", sortedEvents, " from Events: ", eventsWithClubNames);

        setEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Set mock data as fallback in case of error
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
      <div className="relative h-[40vh] mb-16">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/events-hero.jpg"
            alt="Events"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 
                      flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 
                           bg-clip-text text-transparent">
                Discover Amazing Events
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Experience unforgettable nights with the hottest events in town
            </p>
          </motion.div>
        </div>
      </div>

      {/* Events Lists */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
        {EVENT_CATEGORIES.map((category) => (
          <ScrollableEventList
            key={category.id}
            title={category.title}
            description={category.description}
            events={events[category.id]}
            icon={category.icon}
            gradient={category.gradient}
          />
        ))}
      </div>
    </div>
  );
};

export default ExploreEventsPage;