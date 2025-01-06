import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, parse } from 'date-fns';

interface DatePickerProps {
  name?: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  isRequired?: boolean;
  isInvalid?: boolean;
  label?: string;
  errorMsg?: string;
  onCalendarClick?: (e: React.MouseEvent) => void;
}

const EnhancedDatePicker: React.FC<DatePickerProps> = ({
  name = 'date',
  value,
  onChange,
  isRequired = false,
  isInvalid = false,
  label = 'Date',
  errorMsg = '',
  onCalendarClick,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      try {
        // Parse DD-MM-YYYY to Date with explicit day-month order
        const [day, month, year] = value.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        if (isNaN(date.getTime()) || 
            date.getDate() !== day || 
            date.getMonth() !== month - 1 || 
            date.getFullYear() !== year) {
          throw new Error('Invalid date');
        }
        
        setDisplayValue(value);
        setSelectedDate(date);
        setCurrentMonth(date);
      } catch (error) {
        console.error('Error parsing date:', error);
        setDisplayValue('');
        setSelectedDate(null);
      }
    } else {
      setDisplayValue('');
      setSelectedDate(null);
    }
  }, [value]);

  const formatDateForInput = (inputValue: string) => {
    // Remove all non-digits and dashes
    let cleaned = inputValue.replace(/[^\d-]/g, '');
    
    // Handle backspace - if last character was removed, remove the dash too
    if (inputValue.endsWith('-')) {
      cleaned = cleaned.slice(0, -1);
    }
    
    // Format as DD-MM-YYYY
    if (cleaned.length >= 4) {
      cleaned = cleaned.slice(0, 8);
      const day = cleaned.slice(0, 2);
      const month = cleaned.slice(2, 4);
      const year = cleaned.slice(4);
      
      if (cleaned.length > 4) {
        return `${day}-${month}-${year}`;
      }
      return `${day}-${month}`;
    } else if (cleaned.length >= 2) {
      const day = cleaned.slice(0, 2);
      const month = cleaned.slice(2);
      return `${day}-${month}`;
    }
    
    return cleaned;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatDateForInput(inputValue);
    setDisplayValue(formattedValue);
  
    if (!inputValue) {
      onChange({ target: { name, value: '' } });
      setSelectedDate(null);
      return;
    }
  
    if (formattedValue.length === 10) {
      const [day, month, year] = formattedValue.split('-');
      try {
        // Force DD-MM-YYYY interpretation
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        // Create date with explicit day-month order
        const dateObj = new Date(yearNum, monthNum - 1, dayNum);
        
        // Verify the date is valid and matches our input
        if (
          dateObj.getDate() === dayNum &&
          dateObj.getMonth() === monthNum - 1 &&
          dateObj.getFullYear() === yearNum
        ) {
          setSelectedDate(dateObj);
          setCurrentMonth(dateObj);
          // Format as DD-MM-YYYY for the onChange event
          const formattedDate = `${String(dayNum).padStart(2, '0')}-${String(monthNum).padStart(2, '0')}-${yearNum}`;
          onChange({ target: { name, value: formattedDate } });
        }
      } catch (error) {
        console.error('Invalid date:', error);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Always keep dates in DD-MM-YYYY format
    const formattedDate = formatDateString(date);
    
    onChange({ target: { name, value: formattedDate } });
    setDisplayValue(formattedDate);
    setIsOpen(false);
  };

  // Helper function to ensure consistent date formatting
  const formatDateString = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = monthStart.getDay();

    return (
      <div className="p-4 min-w-[300px] bg-gray-900 rounded-xl border border-gray-700 shadow-xl">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            type='button'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-700 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <h3 className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          
          <motion.button
            type='button'
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-700 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {days.map(day => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            
            return (
              <motion.button
                type='button'
                key={day.toString()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDateSelect(day)}
                className={`
                  aspect-square rounded-lg text-sm font-medium
                  ${isSelected 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'hover:bg-gray-700'
                  }
                  ${isCurrentDay && !isSelected ? 'ring-2 ring-purple-500' : ''}
                  ${!isCurrentMonth ? 'text-gray-600' : ''}
                `}
              >
                {format(day, 'd')}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          placeholder="dd-mm-yyyy"
          maxLength={10}
          className={`
            w-full bg-gray-800 border ${isInvalid ? 'border-red-500' : 'border-gray-600'} 
            rounded-lg px-4 py-2 pr-12 text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-all duration-200
          `}
        />
        
        <div className="absolute right-2 flex items-center pointer-events-none">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              onCalendarClick?.(e);
              setIsOpen(!isOpen);
            }}
            type="button"
            className="p-1 hover:bg-gray-700 rounded-full transition-colors pointer-events-auto"
          >
            <Calendar className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </div>

      {isInvalid && errorMsg && (
        <p className="mt-1 text-sm text-red-500">{errorMsg}</p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={calendarRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 mt-2 z-50"
          >
            {renderCalendar()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedDatePicker;