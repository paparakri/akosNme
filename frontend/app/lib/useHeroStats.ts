import { useState, useEffect } from 'react';
import { fetchEventById } from './backendAPI';

interface HeroStats {
  eventNumber: number;
  venueNumber: number;
  nearVenueNumber: number | string;
  isLoading: boolean;
  error: Error | null;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface OpeningHours {
  isOpen: boolean;
  open: string;
  close: string;
}

interface ClubOpeningHours {
  [key: string]: OpeningHours;
}

export const useHeroStats = (
  clubs: any[],
  userCoordinates?: Coordinates
): HeroStats => {
  const [stats, setStats] = useState<HeroStats>({
    eventNumber: 0,
    venueNumber: 0,
    nearVenueNumber: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const calculateStats = async () => {
      try {
        const now = new Date();
        const currentDay = now.getDay();
        const daysUntilFriday = currentDay <= 5 ? 5 - currentDay : 6;
        
        const weekendStart = new Date(now);
        weekendStart.setDate(now.getDate() + daysUntilFriday);
        weekendStart.setHours(0, 0, 0, 0);
        
        const weekendEnd = new Date(weekendStart);
        weekendEnd.setDate(weekendStart.getDate() + 2);
        weekendEnd.setHours(23, 59, 59, 999);

        // Calculate weekend events with proper async handling
        let weekendEvents = 0;
        for (const club of clubs) {
          if (club.events && club.events.length > 0) {
            for (const eventId of club.events) {
              try {
                const eventObj = await fetchEventById(eventId);
                if (eventObj) {
                  //console.log(eventObj);
                  const eventDate = new Date(eventObj.date);
                  //console.log(`Made new date with ${eventObj.date} and got: ${eventDate}`)
                  if (eventDate >= weekendStart && eventDate <= weekendEnd) {
                    weekendEvents++;
                  }
                }
              } catch (error) {
                console.error('Error fetching event:', error);
              }
            }
          }
        }

        // Calculate open venues for the weekend
        const openVenues = clubs.filter(club => {
          if (!club.openingHours) {
            return false;
          }

          const weekendDays = ['Friday', 'Saturday', 'Sunday'];
          const hours = club.openingHours as ClubOpeningHours;

          return weekendDays.some(day => hours[day]?.isOpen);
        }).length;

        // Handle nearby venues
        let nearbyVenues: number | string = "Location access needed";
        
        if (userCoordinates) {
          const EARTH_RADIUS = 6371;
          const MAX_DISTANCE = 1;

          const nearbyCount = clubs.filter(club => {
            if (!club.location?.coordinates) return false;

            const [venueLng, venueLat] = club.location.coordinates;
            const dLat = toRad(venueLat - userCoordinates.lat);
            const dLon = toRad(venueLng - userCoordinates.lng);

            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(toRad(userCoordinates.lat)) * Math.cos(toRad(venueLat)) * 
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = EARTH_RADIUS * c;

            return distance <= MAX_DISTANCE;
          }).length;

          nearbyVenues = nearbyCount;
        }

        setStats({
          eventNumber: weekendEvents,
          venueNumber: openVenues,
          nearVenueNumber: nearbyVenues,
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('Error in calculateStats:', error);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('An error occurred')
        }));
      }
    };

    calculateStats();
  }, [clubs, userCoordinates?.lat, userCoordinates?.lng]);

  return stats;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};