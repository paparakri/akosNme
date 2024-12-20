import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { getClubEvents } from '@/app/lib/backendAPI';
import { motion, AnimatePresence } from 'framer-motion';

const CompactEventCarousel = ({ clubId, autofillFunction, matchingEvents }) => {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  console.log("Printing matching events: ", matchingEvents);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getClubEvents(clubId);
        setEvents(response);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [clubId]);

  const nextSlide = () => {
    setCurrentIndex((prev) => prev === events.length - 1 ? 0 : prev + 1);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => prev === 0 ? events.length - 1 : prev - 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-blue-400/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (events && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <p className="text-gray-400">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-md mx-auto">
      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div className="flex justify-center items-center h-64">
          <AnimatePresence mode="wait">
            {events && events.map((event, index) => {
              console.log("Event id: ", event._id);
              console.log("Matching events: ", matchingEvents.map((e) => e._id));
              console.log(matchingEvents.some(e => e._id === event._id));
              return (
                <motion.div
                key={event.id}
                className="absolute w-72"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: index === currentIndex ? 1 : 0.5,
                  scale: index === currentIndex ? 1 : 0.8,
                  x: `${(index - currentIndex) * 100}%`,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                style={{ zIndex: index === currentIndex ? 20 : 10 }}
              >
                <motion.div 
                  className={`backdrop-blur-sm rounded-xl overflow-hidden shadow-xl relative`}
                  animate={
                    matchingEvents.some(e => e._id === event._id)
                      ? {
                          boxShadow: [
                            '0 0 0 0 rgba(126, 34, 206, 0.4)', 
                            '0 0 15px 5px rgba(126, 34, 206, 0.5)', 
                            '0 0 0 0 rgba(126, 34, 206, 0.4)'
                          ]
                        }
                      : {}
                  }
                  transition={{
                    boxShadow: { 
                      repeat: Infinity, 
                      duration: 1, 
                      repeatType: 'reverse', 
                      ease: "easeInOut" 
                    }
                  }}
                  className={`${matchingEvents.some(e => e._id === event._id)
                    ? "border-2 border-purple-700/50 ring-2 ring-purple-500/30" 
                    : "border border-white/10"}
                    backdrop-blur-sm rounded-xl overflow-hidden`}
                >
                <div className={`${matchingEvents.some(e => e._id === event._id) 
                  ? "bg-purple-500/10 ring-2 ring-purple-500/30 border border-white/10" 
                  : "bg-white/5 border border-white/10"} 
                  backdrop-blur-sm rounded-xl overflow-hidden shadow-xl`}
                >
                  {event.images?.[0] && (
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={event.images[0]}
                        alt={event.name}
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 truncate">
                      {event.name}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-300 text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-300 text-sm">
                        <Clock className="w-4 h-4 mr-2 text-blue-400" />
                        <span>{new Date(event.startTime).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    
                    {index === currentIndex && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => autofillFunction(new Date(event.date), new Date(event.startTime), event.endTime)}
                        className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 
                                 rounded-lg font-medium transform transition-all duration-300 
                                 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                      >
                        Get Tickets
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
              </motion.div>
            )})}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation buttons */}
      {events && events.length > 1 && (
        <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center pointer-events-none">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white 
                     hover:bg-white/20 transition-colors shadow-lg pointer-events-auto"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white 
                     hover:bg-white/20 transition-colors shadow-lg pointer-events-auto"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* Dots indicator */}
      {events && events.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {events.map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-gradient-to-r from-blue-400 to-purple-500 w-4'
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

export default CompactEventCarousel;