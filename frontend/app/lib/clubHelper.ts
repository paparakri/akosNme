import { fetchClubInfo, fetchClubReservations, fetchEventById, fetchNormalUser, fetchReviewById } from "./backendAPI"

export const fetchTodayStats = async (clubId: string) => {
    const club = await fetchClubInfo(clubId);
    const reservations = await fetchClubReservations(clubId);

    const today = new Date();
    const todayReservations = reservations.filter((reservation: any) => {
        //reservation.Date is a string in this format DD-MM-YYYY. it needs to be converted to a date object
        const reservationDate = new Date(reservation.date) instanceof Date && !isNaN(new Date(reservation.date).getTime()) ? 
            new Date(reservation.date) : 
            new Date(reservation.date.split('-')[2], reservation.date.split('-')[1] - 1, reservation.date.split('-')[0]);

        return reservationDate.getDate() === today.getDate() &&
            reservationDate.getMonth() === today.getMonth() &&
            reservationDate.getFullYear() === today.getFullYear();
    });

    const todayReservationsWithUsers = await Promise.all(todayReservations.map(async (reservation: any) => {
        const user = await fetchNormalUser(reservation.user);
        return {
            ...reservation,
            firstName: user.firstName,
            lastName: user.lastName
        }
    }))

    const expectedGuests = todayReservations.reduce((total: number, reservation: any) => total + reservation.numOfGuests, 0);

    const revenue = 1240;

    const informedClubReviews = await Promise.all(club.reviews.map(async (review: any) => {
        return await fetchReviewById(review);
    }));

    const newReviews = informedClubReviews.filter((review: any) => {
        const reviewDate = new Date(review.createdAt) instanceof Date && !isNaN(new Date(review.createdAt).getTime()) ? 
        new Date(review.createdAt) : 
        new Date(review.createdAt.split('-')[2], review.createdAt.split('-')[1] - 1, review.createdAt.split('-')[0]);


        return reviewDate.getDate() === today.getDate() &&
            reviewDate.getMonth() === today.getMonth() &&
            reviewDate.getFullYear() === today.getFullYear();
    });

    /*console.log({
        reservations: todayReservations,
        expectedGuests: expectedGuests,
        revenue: revenue,
        reviews: newReviews
    });*/

    return {
        reservations: todayReservationsWithUsers,
        expectedGuests: expectedGuests,
        revenue: revenue,
        reviews: newReviews.length
    }
}

export const fetchWeatherData = async (point: { lat: number, lng: number }) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lng}&current=temperature_2m,weather_code,precipitation,wind_speed_10m`
      );
  
      if (!response.ok) throw new Error('Weather data fetch failed');
      
      const data = await response.json();
      
      // Get weather condition based on WMO Weather interpretation codes
      const getCondition = (code: number): string => {
        if (code <= 1) return 'Clear';
        if (code <= 3) return 'Partly Cloudy';
        if (code <= 49) return 'Foggy';
        if (code <= 69) return 'Rainy';
        if (code <= 79) return 'Snowy';
        if (code <= 99) return 'Thunderstorm';
        return 'Unknown';
      };
  
      // Enhanced outdoor activity assessment
      const getOutdoorAssessment = (
        temp: number,
        weatherCode: number,
        precipitation: number,
        windSpeed: number
      ): { 
        suitable: boolean,
        recommendation: string 
      } => {
        // Temperature-based recommendations
        let tempAdvice = '';
        if (temp < -10) {
          return {
            suitable: false,
            recommendation: 'Too cold for most outdoor activities. If necessary, wear extreme cold weather gear.'
          };
        } else if (temp < 0) {
          tempAdvice = 'Very cold - wear warm winter clothing, layers, and protect extremities.';
        } else if (temp < 10) {
          tempAdvice = 'Cold - wear a warm jacket, hat, and gloves.';
        } else if (temp < 20) {
          tempAdvice = 'Cool - bring a light jacket or sweater.';
        } else if (temp < 28) {
          tempAdvice = 'Pleasant temperature for outdoor activities.';
        } else if (temp < 35) {
          tempAdvice = 'Warm - bring water and sun protection.';
        } else {
          return {
            suitable: false,
            recommendation: 'Too hot for most outdoor activities. If necessary, limit exposure and stay hydrated.'
          };
        }
  
        // Weather condition assessment
        if (weatherCode > 79) {
          return {
            suitable: false,
            recommendation: 'Severe weather conditions - outdoor activities not recommended.'
          };
        }
  
        // Precipitation assessment
        const precipitationAdvice = precipitation > 0 
          ? precipitation < 0.5
            ? 'Light precipitation - bring rain gear.'
            : 'Significant precipitation - consider indoor alternatives.'
          : '';
  
        // Wind assessment
        let windAdvice = '';
        if (windSpeed >= 20) {
          return {
            suitable: false,
            recommendation: 'High winds make outdoor activities unsafe.'
          };
        } else if (windSpeed >= 15) {
          windAdvice = 'Strong winds - take precautions with lightweight equipment.';
        } else if (windSpeed >= 10) {
          windAdvice = 'Moderate winds - may affect some activities.';
        }
  
        // Combine all factors
        const suitable = weatherCode <= 3 && precipitation < 0.5 && windSpeed < 15;
        const recommendations = [tempAdvice, precipitationAdvice, windAdvice]
          .filter(advice => advice)
          .join(' ');
  
        return {
          suitable,
          recommendation: recommendations || 'Ideal conditions for outdoor activities.'
        };
      };
  
      const outdoorAssessment = getOutdoorAssessment(
        data.current.temperature_2m,
        data.current.weather_code,
        data.current.precipitation,
        data.current.wind_speed_10m
      );
  
      return {
        temp: Math.round(data.current.temperature_2m),
        condition: getCondition(data.current.weather_code),
        isGoodForOutdoor: outdoorAssessment.suitable,
        outdoorRecommendation: outdoorAssessment.recommendation
      };
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  };

export const fetchUpcomingReservations = async (clubId: string) => {
    const reservations = await fetchClubReservations(clubId);
    const upcomingReservations = reservations.filter((reservation: { date: string | number | Date; }) => {
        const reservationDate = new Date(reservation.date);
        return reservationDate > new Date();
    });
    return upcomingReservations;
}

export const fetchUpcomingEvents = async (clubId: string) => {
    const club = await fetchClubInfo(clubId);
    const events = await Promise.all(
        club.events.map((event: string) => fetchEventById(event))
    );
    return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > new Date();
    });
};

export const fetchRecentReviews = async (clubId: string) => {
    const club = await fetchClubInfo(clubId);
    const reviews = await Promise.all(
        club.reviews.map((review: string) => fetchReviewById(review))
    );
    const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
            const user = await fetchNormalUser(review.user);
            return { ...review, username: user.username };
        })
    );
    return reviewsWithUsers.filter(review => {
        const reviewDate = new Date(review.createdAt);
        return reviewDate > new Date(new Date().setDate(new Date().getDate() - 7));
    });
};

export const fetchClubChartData = async (clubId: string) => {
    const reservations = await fetchClubReservations(clubId);
    
    // Function to standardize date format
    const standardizeDate = (dateStr: string): string => {
        let date: Date;
        
        // Check if it's the DD-MM-YYYY format
        if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
            const [day, month, year] = dateStr.split('-');
            date = new Date(`${year}-${month}-${day}`);
        } else {
            // Handle the full date string format
            date = new Date(dateStr);
        }
        
        // Format to YYYY-MM-DD
        return date.toISOString().split('T')[0];
    };

    // Initialize an object to hold the reservation counts by date
    const reservationCounts: { [key: string]: number } = {};

    // Iterate through the reservations to count them by date
    reservations.forEach((reservation: any) => {
        const standardizedDate = standardizeDate(reservation.date);
        
        if (reservationCounts[standardizedDate]) {
            reservationCounts[standardizedDate] += 1;
        } else {
            reservationCounts[standardizedDate] = 1;
        }
    });

    // Convert the counts object into the desired array format and sort by date
    const chartData = Object.entries(reservationCounts)
        .map(([date, count]) => ({
            date,
            reservations: count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return chartData;
};