/**
 * Format a date to YYYY-MM-DD format for API requests
 */
export const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  /**
   * Format a date to DD-MM-YYYY format for display
   */
  export const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-GB').split('/').join('-');
  };
  
  /**
   * Parse a date string from any common format
   */
  export const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    
    // Handle YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(dateString);
    }
    
    // Handle DD-MM-YYYY format
    if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const [day, month, year] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Default to parsing the string directly
    return new Date(dateString);
  };
  
  /**
   * Get the day name from a date
   */
  export const getDayOfWeek = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()].toLowerCase();
  };
  
  /**
   * Get the next 30 days starting from a given date
   */
  export const getNextDays = (startDate: Date = new Date(), days: number = 30): Date[] => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });
  };
  
  /**
   * Check if a date is today
   */
  export const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  /**
   * Check if a club is open on a given date based on opening hours
   */
  export const isClubOpen = (date: Date, openingHours: any): boolean => {
    // Default to false if no opening hours provided
    if (!openingHours) return false;
  
    const dayName = getDayOfWeek(date);
    const dayHours = openingHours[dayName];
  
    // If we have explicit opening hours for this day
    if (dayHours && typeof dayHours === 'object') {
      return dayHours.isOpen === true;
    }
  
    // If we just have an isOpen boolean for the day
    if (typeof openingHours[dayName] === 'boolean') {
      return openingHours[dayName];
    }
  
    return false;
  };
  
  /**
   * Calculate availability for a specific date
   */
  export const calculateAvailability = (date: Date, totalTables: number = 20, reservedTables: number = 0): {
    hasAvailability: boolean;
    availableTables: number;
    totalTables: number;
    reservedTables: number;
  } => {
    const availableTables = Math.max(0, totalTables - reservedTables);
    return {
      hasAvailability: availableTables > 0,
      availableTables,
      totalTables,
      reservedTables
    };
  };
  
  /**
   * Convert availability data for display
   */
  export const convertAvailabilityForDisplay = (date: Date, openingHours: any, reservations: any[] = []): {
    date: string;
    hasAvailability: boolean;
    availableTables: number;
    totalTables: number;
    reservedTables: number;
  } => {
    const dateStr = formatDateForDisplay(date);
    
    // If the club is closed on this day, return no availability
    if (!isClubOpen(date, openingHours)) {
      return {
        date: dateStr,
        hasAvailability: false,
        availableTables: 0,
        totalTables: 0,
        reservedTables: 0
      };
    }
  
    // Count reservations for this date
    const dateReservations = reservations.filter(res => 
      res.date === formatDateForAPI(date)
    ).length;
  
    // Calculate availability
    return {
      date: dateStr,
      ...calculateAvailability(date, 20, dateReservations)
    };
  };