import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getClubEvents } from '@/app/lib/backendAPI';

const CompactEventCarousel = ({ clubId, autofillFunction } : { clubId: string, autofillFunction: (date: Date, startTime: Date, endTime: string) => void }) => {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 text-sm">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-md mx-auto px-2 py-4">
      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div className="flex justify-center items-center h-48">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="absolute w-64 transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%) scale(${index === currentIndex ? 1 : 0.8})`,
                opacity: index === currentIndex ? 1 : 0.5,
                zIndex: index === currentIndex ? 20 : 10
              }}
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {event.images?.[0] && (
                  <div className="relative h-32">
                    <img
                      src={event.images[0]}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                    {event.name}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 text-xs">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(event.date).toDateString()}</span>
                  </div>
                  
                  {index === currentIndex && (
                    <button className="mt-2 w-full bg-orange-500 text-white py-1 px-2 rounded text-xs hover:bg-orange-600 transition-colors" onClick={autofillFunction.bind(null, new Date(event.date), new Date(event.startTime), event.endTime)}>
                      Get Tickets
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      {events.length > 1 && (
        <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center pointer-events-none">
          <button
            onClick={prevSlide}
            className="p-1 rounded-full bg-white/80 text-gray-800 hover:bg-white transition-colors shadow-md pointer-events-auto"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="p-1 rounded-full bg-white/80 text-gray-800 hover:bg-white transition-colors shadow-md pointer-events-auto"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dots indicator */}
      {events.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-orange-500' : 'bg-gray-300'
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