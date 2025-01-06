"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import { Calendar, Star, Clock, Users, Wine, Music, MapPin, PartyPopper, 
         DollarSign, X, AlertCircle, Info, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { fetchClubByName, fetchEventById, postReservation, switchUsername2Id } from '@/app/lib/backendAPI';
import ChakraDatePicker from '@/app/ui/datepicker';
import CompactEventCarousel from '@/app/ui/compactEventCarousel';
import { useReservation } from '@/app/ui/reservationContext';
import { getDefaultClubImage } from '@/app/lib/imageSelector';

interface ReservationData {
  user: string;
  club: string;
  event: string;
  tableNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  numOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  specialRequests: string;
  minPrice: number;
}

interface ValidationErrors {
  date: string;
  startTime: string;
  endTime: string;
  numOfGuests: string;
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient?: string;
}

interface PolicyItemProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient = "from-blue-500 to-pink-500" 
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 
               dark:border-gray-700 transition-all duration-200"
  >
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center 
                     justify-center text-white mb-4`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
  </motion.div>
);

const PolicyItem: React.FC<PolicyItemProps> = ({ title, description, icon: Icon }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
  >
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  </motion.div>
);

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto relative">
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading reservation details...</p>
    </div>
  </div>
);

const ReservationPage: React.FC = () => {
  const { selectedDate, setSelectedDate } = useReservation();

  const [reservation, setReservation] = useState<ReservationData>({
    user: '',
    club: '',
    event: '',
    tableNumber: '',
    date: '',
    startTime: '',
    endTime: '',
    numOfGuests: 4,
    status: 'pending',
    specialRequests: '',
    minPrice: 20
  });

  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isReservationComplete, setIsReservationComplete] = useState(false);
  const [clubId, setClubId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({
    date: '',
    startTime: '',
    endTime: '',
    numOfGuests: ''
  });
  const [matchingEvents, setMatchingEvents] = useState<any[]>([]);

  const router = useRouter();
  const pathname = usePathname();
  const clubName = pathname?.split('/')[2] || '';
  const [clubDisplayName, setClubDisplayName] = useState(clubName);
  const [clubDetails, setClubDetails] = useState<any>(null);

  useEffect(() => {
    const fetchMatchingEvents = async () => {
      if (reservation.date && clubDetails?.events) {
        try {
          const eventPromises = clubDetails.events.map(async (eventId: string) => {
            const eventObj = await fetchEventById(eventId);
            const eventDate = new Date(eventObj.date).toISOString().split('T')[0];
            return eventDate === reservation.date ? eventObj : null;
          });

          const resolvedEvents = await Promise.all(eventPromises);
          const validEvents = resolvedEvents.filter(event => event !== null);
          
          setMatchingEvents(validEvents);
        } catch (error) {
          console.error('Error fetching matching events:', error);
        }
      }
    };

    fetchMatchingEvents();
  }, [reservation.date, clubDetails]);

  useEffect(() => {
    console.log(`SelectedDate context hook: ${selectedDate}`)
    if (selectedDate) {
      setReservation(prev => ({
        ...prev,
        date: selectedDate
      }));
      // Clear the date from context after using it
      setSelectedDate(null);
    }
  }, [selectedDate, setSelectedDate]);

  useEffect(() => {
    const initializeReservation = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          router.push('/sign-in');
          return;
        }

        const decodedToken = jwtDecode<{ username: string }>(token);
        if (!decodedToken.username) {
          throw new Error('Invalid token');
        }

        const userId = await switchUsername2Id(decodedToken.username);
        const clubData = await fetchClubByName(clubName);

        setReservation(prev => ({
          ...prev,
          user: userId,
          club: clubData._id
        }));

        setClubId(clubData._id);
        setClubDisplayName(clubData.displayName);
        setClubDetails(clubData);

      } catch (error) {
        console.error('Error initializing reservation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeReservation();
  }, [clubName, router]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      date: '',
      startTime: '',
      endTime: '',
      numOfGuests: ''
    };

    // Date validation
    if (!reservation.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(reservation.date);
      const today = new Date();
      // Reset the time part to compare just the dates
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Please select today or a future date';
      }
    }

    // Time validation
    if (!reservation.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    // Guest number validation
    if (reservation.numOfGuests < 1) {
      newErrors.numOfGuests = 'At least one guest is required';
    } else if (reservation.numOfGuests > 20) {
      newErrors.numOfGuests = 'Maximum 20 guests allowed';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsConfirmationVisible(true);
    } catch (error) {
      console.error('Error processing reservation:', error);
    }
  };

  const confirmReservation = async () => {
    try {
      await postReservation(reservation);
      setIsConfirmationVisible(false);
      setIsReservationComplete(true);
    } catch (error) {
      console.error('Error confirming reservation:', error);
    }
  };

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    console.log(`Input name: ${name} && Input value: ${value}`);
    setReservation(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberInputChange = (value: number) => {
    setReservation(prev => ({ ...prev, numOfGuests: value }));
    if (errors.numOfGuests) {
      setErrors(prev => ({ ...prev, numOfGuests: '' }));
    }
  };

  const autofillEvent = (date: Date, startTime: Date) => {
    console.log(`Date: ${date} && Start Time: ${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`)
    setReservation(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0],
      startTime: new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) ,
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-16">
      {/* Club Header */}
      <div className="relative mb-12">
        <div className="relative h-[50vh] overflow-hidden">
          <img 
            src={`/default-images/${getDefaultClubImage(clubDetails)}.jpg`}
            alt={clubDisplayName}
            className="w-full h-full object-cover transform scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl font-bold text-white">
                {clubDisplayName}
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                {clubDetails?.description}
              </p>
              
              <div className="flex items-center space-x-6 text-gray-300">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Open Thu-Sat, 10 PM - 4 AM</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{clubDetails?.address}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span>Min. spend: €{reservation.minPrice}/person</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
                {/* Date Field */}
                <div className="space-y-6">
                  <div>
                    <ChakraDatePicker
                      value={reservation.date}
                      onChange={handleInputChange}
                      isRequired={true}
                      isInvalid={!!errors.date}
                      errorMsg={errors.date}
                      label="Select Date"
                    />
                    
                    {/* Event Alert */}
                    {matchingEvents.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <PartyPopper className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-purple-400 mb-1">Special Event!</h4>
                            {matchingEvents.map((event, index) => (
                              <p key={index} className="text-sm text-gray-300">
                                {event.name} starting at {new Date(event.startTime).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Time Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Select Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        name="startTime"
                        value={reservation.startTime}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.startTime 
                            ? 'border-red-500' 
                            : 'border-white/10'
                        } bg-white/5 backdrop-blur-sm focus:border-purple-500 transition-colors`}
                      />
                      <Clock className="absolute right-4 top-3.5 text-gray-400" />
                    </div>
                    {errors.startTime && (
                      <p className="text-sm text-red-400 mt-1">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  {/* Number of Guests */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Number of Guests
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="numOfGuests"
                        value={reservation.numOfGuests}
                        onChange={(e) => handleNumberInputChange(parseInt(e.target.value))}
                        min="1"
                        max="20"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          errors.numOfGuests 
                            ? 'border-red-500' 
                            : 'border-white/10'
                        } bg-white/5 backdrop-blur-sm focus:border-purple-500 transition-colors`}
                      />
                      <Users className="absolute right-4 top-3.5 text-gray-400" />
                    </div>
                    {errors.numOfGuests && (
                      <p className="text-sm text-red-400 mt-1">
                        {errors.numOfGuests}
                      </p>
                    )}
                  </div>

                  {/* Table Preference */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Preferred Table (Optional)
                    </label>
                    <input
                      type="text"
                      name="tableNumber"
                      value={reservation.tableNumber}
                      onChange={handleInputChange}
                      placeholder="Enter table number if you have a preference"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm 
                               focus:border-purple-500 transition-colors"
                    />
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      value={reservation.specialRequests}
                      onChange={handleInputChange}
                      placeholder="Any special requirements or requests?"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm 
                               focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-medium 
                             text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                  >
                    Reserve Now
                  </motion.button>
                </div>
              </div>

              {/* Venue Policies */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
                <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Venue Policies
                </h3>
                <div className="space-y-4">
                  <PolicyItem
                    icon={Info}
                    title="Age Requirement"
                    description="All guests must be 21 or older with valid ID"
                  />
                  <PolicyItem
                    icon={Star}
                    title="Dress Code"
                    description="Smart casual attire required. No sportswear"
                  />
                  <PolicyItem
                    icon={Clock}
                    title="Arrival Time"
                    description="Please arrive within 30 minutes of your reservation time"
                  />
                </div>
              </div>
            </motion.div>

            {/* Event & Club Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Upcoming Events */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
                <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Upcoming Events
                </h3>
                <CompactEventCarousel
                  matchingEvents={matchingEvents} 
                  clubId={clubId}
                  autofillFunction={autofillEvent}
                />
              </div>

              {/* Venue Features */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
                <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Venue Highlights
                </h3>
                <div className="grid gap-6">
                  <FeatureCard
                    icon={Music}
                    title="Premium Sound System"
                    description="State-of-the-art audio equipment and live performances"
                    gradient="from-purple-500 to-blue-500"
                  />
                  <FeatureCard
                    icon={Wine}
                    title="VIP Service"
                    description="Exclusive bottle service and signature cocktails"
                    gradient="from-pink-500 to-purple-500"
                  />
                  <FeatureCard
                    icon={Users}
                    title="Private Areas"
                    description="Reserved sections for you and your guests"
                    gradient="from-blue-500 to-purple-500"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmationVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-white/10 shadow-2xl"
            >
              <h3 className="text-2xl font-semibold mb-6">
                Confirm Your Reservation
              </h3>
              
              <div className="space-y-6 mb-8">
                {/* Reservation Details */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Date', value: reservation.date },
                    { label: 'Time', value: reservation.startTime },
                    { label: 'Guests', value: reservation.numOfGuests },
                    { label: 'Table', value: reservation.tableNumber || 'Not specified' }
                  ].map((detail) => (
                    <div key={detail.label}>
                      <p className="text-sm text-gray-400">{detail.label}</p>
                      <p className="font-medium">{detail.value}</p>
                    </div>
                  ))}
                </div>

                {/* Special Requests */}
                {reservation.specialRequests && (
                  <div>
                    <p className="text-sm text-gray-400">Special Requests</p>
                    <p className="font-medium">{reservation.specialRequests}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmReservation}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-medium
                           shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                >
                  Confirm Reservation
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsConfirmationVisible(false)}
                  className="flex-1 py-3 bg-white/5 rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Modify
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReservationPage;