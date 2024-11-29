import React, { useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseDate } from '../lib/date-utils';

interface OpeningHourDay {
  isOpen: boolean;
  open: string;
  close: string;
}

interface OpeningHours {
  monday?: OpeningHourDay;
  tuesday?: OpeningHourDay;
  wednesday?: OpeningHourDay;
  thursday?: OpeningHourDay;
  friday?: OpeningHourDay;
  saturday?: OpeningHourDay;
  sunday?: OpeningHourDay;
  [key: string]: OpeningHourDay | undefined;
}

interface AvailabilityDay {
  date: string;
  totalTables: number;
  reservedTables: number;
  availableTables: number;
  hasAvailability: boolean;
}

interface AvailabilityDisplayProps {
  availableDays: AvailabilityDay[];
  selectedDate?: string | null;
  onDateSelect?: (date: Date) => void;
  openingHours?: OpeningHours;
}

const AvailabilityDisplay: React.FC<AvailabilityDisplayProps> = ({
  availableDays,
  selectedDate = null,
  onDateSelect,
  openingHours = {}
}) => {

  console.log("Printing Availability through the availabilty display: ", availableDays)

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getDayOfWeek = (date: Date): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayIndex = date.getDay();
    return days[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  const isClubOpen = (date: Date): boolean => {
    const dayName = getDayOfWeek(date);
    return openingHours[dayName]?.isOpen ?? false;
  };

  const getDatesToShow = () => {
    const dates = [];

    console.log("Printing availabilty date: ", parseDate(availableDays[0]?.date));

    const startDate = parseDate(availableDays[0]?.date);

    
    
    // Show next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDatesToShow();

  const scroll = (direction: 'left' | 'right', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollPosition = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleDateClick = (date: Date, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isClubOpen(date) && onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleComponentClick = (e: React.MouseEvent) => {
    // Prevent the click from bubbling up to the parent link
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className="w-full p-2 bg-black/20 backdrop-blur-sm rounded-xl"
      onClick={handleComponentClick}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="text-xs @[400px]:text-sm text-white font-medium">
            Table Availability
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => scroll('left', e)}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => scroll('right', e)}
            className="p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scroll-smooth"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {dates.map((date, index) => {
            date = new Date(date.getTime() + 46400000); // Adding .5 day in milliseconds
            const dateString = date.toISOString().split('T')[0].split('-').reverse().join('-');
            const availability = availableDays?.find(day => day.date === dateString);
            
            const isOpen = isClubOpen(date);

            console.log("availability inside rendering loop: ", availability);
            
            return (
              <button
                key={dateString}
                onClick={(e) => handleDateClick(date, e)}
                disabled={!isOpen}
                className={`
                  flex-shrink-0 relative p-3 rounded-lg transition-all duration-300 min-w-[70px]
                  ${isOpen 
                    ? availability?.hasAvailability 
                      ? 'bg-purple-500/20 hover:bg-purple-500/30' 
                      : 'bg-red-500/20'
                    : 'bg-gray-500/20 cursor-not-allowed'}
                  ${selectedDate && dateString === selectedDate.split('T')[0].split('-').reverse().join('-')
                    ? 'ring-1 ring-purple-500'
                    : ''}
                `}
              >
                <div className="text-center">
                  <div className="text-xs text-gray-400">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-xs text-gray-400">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-medium text-white">
                    {date.getDate()}
                  </div>
                  {isOpen ? (
                    availability?.hasAvailability && (
                      <div className="flex items-center justify-center">
                        <span className="text-sm text-green-400">
                          {availability.availableTables}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="text-xs text-gray-500">
                      Closed
                    </div>
                  )}
                </div>

                <div className={`
                  absolute bottom-1 left-1/2 -translate-x-1/2 
                  h-1.5 w-1.5 rounded-full
                  ${isOpen 
                    ? availability?.hasAvailability 
                      ? 'bg-green-400' 
                      : 'bg-red-400'
                    : 'bg-gray-500'}
                `} />
              </button>
            );
          })}
        </div>

        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AvailabilityDisplay;