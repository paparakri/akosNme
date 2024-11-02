import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { getClubEvents } from '@/app/lib/backendAPI';

const EventCarousel = ({ clubId }) => {
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [touchPosition, setTouchPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef(null);

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

  // Touch and mouse event handlers
  const handleTouchStart = (e) => {
    const touchDown = e.touches[0].clientX;
    setTouchPosition(touchDown);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchPosition === null) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchPosition - currentTouch;

    if (Math.abs(diff) > 5) {  // Add a small threshold to prevent accidental swipes
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setTouchPosition(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchPosition(null);
    setIsDragging(false);
  };

  const handleMouseDown = (e) => {
    setTouchPosition(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || touchPosition === null) return;

    const currentPosition = e.clientX;
    const diff = touchPosition - currentPosition;

    if (Math.abs(diff) > 5) {  // Same threshold for mouse events
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 text-center h-96 flex items-center justify-center">
        {error}
      </div>
    );
  }

  // No events state
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-4">No events available</h3>
        <p className="text-gray-500">This club hasn't posted any events yet.</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
        {events.length > 1 && (
          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

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
        {events.map((event, index) => {
        const diff = index - currentIndex;
        let translateX = diff * 100;
        let isVisible = Math.abs(diff) <= 1; // Only show current, next, and previous slides

        // Set the translate position based on relative index (no wrap-around)
        if (!isVisible) {
          return null; // Hide items that are not adjacent to the current slide
        }

        return (
          <div
            key={event.id}
            className={`absolute w-80 transition-all duration-300 ease-out`}
            style={{
              transform: `translateX(${translateX}%) scale(${index === currentIndex ? 1 : 0.75})`,
              opacity: index === currentIndex ? 1 : 0.5,
              zIndex: index === currentIndex ? 20 : 10
            }}
          >
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              {event.images && event.images[0] && (
                <div className="relative h-48">
                  <img
                    src={event.images[0]}
                    alt={event.name}
                    className="w-full h-full object-cover"
                    draggable="false"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      {new Date(event.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      {event.availableTickets} tickets available
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      ${parseFloat(event.price).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {index === currentIndex && (
                  <button
                    className="mt-6 w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                    onClick={() => {/* Add your ticket purchase logic here */}}
                  >
                    Get Tickets
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

        </div>
      </div>

      {/* Dots indicator */}
      {events.length > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
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

export default EventCarousel;