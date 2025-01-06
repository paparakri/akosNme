import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { getClubEvents } from '@/app/lib/backendAPI';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  images?: string[];
  availableTickets: number;
  price: string;
}

const EventCarousel = ({ clubId }: { clubId: string }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [touchPosition, setTouchPosition] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await getClubEvents(clubId);
        setEvents(response);
      } catch (err) {
        setError('Failed to fetch events');
        console.error('Error fetching events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [clubId]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === events.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touchDown = e.touches[0].clientX;
    setTouchPosition(touchDown);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchPosition === null) return;
    const currentTouch = e.touches[0].clientX;
    const diff = touchPosition - currentTouch;
    if (Math.abs(diff) > 5) {
      if (diff > 0) nextSlide();
      else prevSlide();
      setTouchPosition(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchPosition(null);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchPosition(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchPosition === null) return;
    const currentPosition = e.clientX;
    const diff = touchPosition - currentPosition;
    if (Math.abs(diff) > 5) {
      if (diff > 0) nextSlide();
      else prevSlide();
      setTouchPosition(null);
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setTouchPosition(null);
    setIsDragging(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-400/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center p-8 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20">
          <span className="text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  // No events state
  if (!events || events.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center p-8 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <h3 className="text-xl font-medium text-white mb-2">No events available</h3>
          <p className="text-gray-400">This club hasn&apos;t posted any events yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Upcoming Events
        </h2>
        {events.length > 1 && (
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevSlide}
              className="p-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextSlide}
              className="p-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Carousel */}
      <div 
        className="relative overflow-hidden"
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex justify-center items-center h-96">
          <AnimatePresence mode="wait">
            {events.map((event, index) => {
              const diff = index - currentIndex;
              let translateX = diff * 100;
              let isVisible = Math.abs(diff) <= 1;

              if (!isVisible) return null;

              return (
                <motion.div
                  key={event.id}
                  className="absolute w-80"
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{
                    scale: index === currentIndex ? 1 : 0.75,
                    opacity: index === currentIndex ? 1 : 0.5,
                    x: `${translateX}%`,
                  }}
                  exit={{ scale: 0.75, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ zIndex: index === currentIndex ? 20 : 10 }}
                >
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-xl">
                    {event.images && event.images[0] && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.images[0]}
                          alt={event.name}
                          className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                          draggable="false"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {event.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-300">
                          <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                          <span className="text-sm">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-5 h-5 mr-2 text-blue-400" />
                          <span className="text-sm">
                            {new Date(event.startTime).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-300">
                          <Users className="w-5 h-5 mr-2 text-blue-400" />
                          <span className="text-sm">
                            {event.availableTickets} tickets available
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-300">
                          <DollarSign className="w-5 h-5 mr-2 text-blue-400" />
                          <span className="text-sm">
                            ${parseFloat(event.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      {index === currentIndex && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-2 px-4 rounded-full
                                   transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25
                                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                          onClick={() => {/* Add your ticket purchase logic here */}}
                        >
                          Get Tickets
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Dots indicator */}
      {events.length > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          {events.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500 w-4' 
                  : 'bg-white/20'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventCarousel;