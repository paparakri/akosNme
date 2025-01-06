"use client"
import { useState } from "react";

interface CustomCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  reservationDates: string[];
}

export const CustomCalendar = ({ selectedDate, onDateSelect, reservationDates }: CustomCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
    const today = new Date();
    
    // Format date to DD/MM/YYYY to match your reservation dates format
    const formatDate = (date: Date): string => {
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    // Check if a date has reservations
    const hasReservation = (date: Date): boolean => {
        const dateString = formatDate(date);
        return reservationDates.includes(dateString);
    };

    // Check if two dates are the same day
    const isSameDay = (date1: Date, date2: Date): boolean => {
        return formatDate(date1) === formatDate(date2);
    };
  
    const renderCalendar = () => {
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startingDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
  
      const weeks = [];
      let days = [];
      
      // Add empty cells for days before the first of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(
          <td key={`empty-${i}`} className="text-center p-0">
            <div className="aspect-square" />
          </td>
        );
      }
  
      // Add the days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const isSelected = isSameDay(date, selectedDate);
        const hasReservationDot = hasReservation(date);
  
        const isToday = (date: Date): boolean => formatDate(date) === formatDate(today);
  
        days.push(
        <td key={day} className="text-center p-0">
            <div className="aspect-square relative">
            <button
                onClick={() => onDateSelect((date))}
                className={`
                w-full h-full flex flex-col items-center justify-center gap-1
                ${isSelected ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800'}
                ${isToday(date) ? 'border-2 border-orange-300' : ''}
                rounded-full relative
                `}
            >
                <span className="text-sm">{day}</span>
                {hasReservationDot && (
                <div className="absolute -bottom-0 h-1.5 w-1.5 rounded-full bg-orange-500" />
                )}
            </button>
            </div>
        </td>
        );
  
        if ((startingDayOfWeek + day) % 7 === 0 || day === daysInMonth) {
          weeks.push(<tr key={day} className="h-10">{days}</tr>);
          days = [];
        }
      }
  
      return weeks;
    };
  
    return (
      <div className="bg-gray-900/50 p-6 rounded-xl backdrop-blur-lg">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
          >
            ←
          </button>
          <h2 className="text-white font-semibold">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
          >
            →
          </button>
        </div>
        <table className="w-full table-fixed border-separate border-spacing-1">
          <thead>
            <tr>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th key={day} className="text-sm font-medium text-gray-400 p-1">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderCalendar()}</tbody>
        </table>
      </div>
    );
  };