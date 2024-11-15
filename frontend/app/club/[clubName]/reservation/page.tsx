"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import { Calendar, Star, Clock, Users, Wine, Music, MapPin, PartyPopper, 
         DollarSign, X, AlertCircle, Info, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { fetchClubByName, postReservation, switchUsername2Id } from '@/app/lib/backendAPI';
import ChakraDatePicker from '@/app/ui/datepicker';
import CompactEventCarousel from '@/app/ui/compactEventCarousel';

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

  const router = useRouter();
  const pathname = usePathname();
  const clubName = pathname?.split('/')[2] || '';
  const [clubDisplayName, setClubDisplayName] = useState(clubName);
  const [clubDetails, setClubDetails] = useState<any>(null);

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
      if (selectedDate < today) {
        newErrors.date = 'Please select a future date';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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

  const autofillEvent = (date: Date, startTime: string, endTime: string) => {
    setReservation(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0],
      startTime,
      endTime
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-10">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {isReservationComplete ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center space-y-8"
            >
              <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full 
                          flex items-center justify-center">
                <PartyPopper className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Reservation Confirmed!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Get ready for an amazing night at {clubDisplayName}. We've sent the confirmation 
                details to your email.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/my-profile/bookings')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-pink-500 text-white 
                           rounded-xl font-medium shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  View My Reservations
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsReservationComplete(false)}
                  className="px-6 py-3 border-2 border-blue-500 text-blue-500 rounded-xl 
                           font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 
                           transition-all duration-200"
                >
                  Make Another Reservation
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
              >
                <img
                  src="/Designer.jpeg"
                  alt="Club atmosphere"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 
                            flex items-center">
                  <div className="px-8">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                      Reserve Your Night at{" "}
                      <span className="bg-gradient-to-r from-blue-400 to-pink-500 
                                   bg-clip-text text-transparent">
                        {clubDisplayName}
                      </span>
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-200 text-lg max-w-2xl"
                    >
                      Experience an unforgettable night at one of the city's most exclusive venues. 
                      Secure your spot and enjoy premium service.
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Reservation Form Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-8"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border 
                              border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-400 
                               to-pink-500 bg-clip-text text-transparent">
                      Make Your Reservation
                    </h2>

                    {/* Reservation Form Fields */}
                    <div className="space-y-6">
                      {/* Date Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Select Date
                        </label>
                        <ChakraDatePicker
                          value={reservation.date}
                          onChange={handleInputChange}
                          isRequired={true}
                          isInvalid={!!errors.date}
                          errorMsg={errors.date}
                          label="Date"
                        />
                      </div>

                      {/* Time Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Select Time
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={reservation.startTime}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            errors.startTime 
                              ? 'border-red-500 dark:border-red-400' 
                              : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200`}
                        />
                        {errors.startTime && (
                          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                            {errors.startTime}
                          </p>
                        )}
                      </div>
                      {/* Number of Guests Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            className={`w-full px-4 py-2 rounded-lg border ${
                              errors.numOfGuests 
                                ? 'border-red-500 dark:border-red-400' 
                                : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200`}
                          />
                          <Users className="absolute right-3 top-2.5 text-gray-400" />
                        </div>
                        {errors.numOfGuests && (
                          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                            {errors.numOfGuests}
                          </p>
                        )}
                      </div>

                      {/* Table Number Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Preferred Table (Optional)
                        </label>
                        <input
                          type="text"
                          name="tableNumber"
                          value={reservation.tableNumber}
                          onChange={handleInputChange}
                          placeholder="Enter table number if you have a preference"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                   transition-all duration-200"
                        />
                      </div>

                      {/* Special Requests Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Special Requests
                        </label>
                        <textarea
                          name="specialRequests"
                          value={reservation.specialRequests}
                          onChange={handleInputChange}
                          placeholder="Any special requirements or requests?"
                          rows={4}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                   transition-all duration-200 resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-pink-500 text-white 
                                 rounded-xl font-medium shadow-sm hover:shadow-lg transition-all duration-200"
                      >
                        Reserve Now
                      </motion.button>
                    </div>
                  </div>

                  {/* Club Policies */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border 
                              border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-400 
                               to-pink-500 bg-clip-text text-transparent">
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

                {/* Sidebar Content */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-8"
                >
                  {/* Club Features */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border 
                              border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-400 
                               to-pink-500 bg-clip-text text-transparent">
                      Venue Highlights
                    </h3>
                    <div className="grid gap-6">
                      <FeatureCard
                        icon={Music}
                        title="Premium Sound System"
                        description="State-of-the-art audio equipment and live performances"
                      />
                      <FeatureCard
                        icon={Wine}
                        title="VIP Service"
                        description="Exclusive bottle service and signature cocktails"
                      />
                      <FeatureCard
                        icon={Users}
                        title="Private Areas"
                        description="Reserved sections for you and your guests"
                      />
                    </div>
                  </div>

                  {/* Events Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border 
                              border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-400 
                               to-pink-500 bg-clip-text text-transparent">
                      Upcoming Events
                    </h3>
                    <CompactEventCarousel clubId={clubId} autofillFunction={(date, startTime, endTime) => autofillEvent(date, startTime.toString(), endTime)} />
                  </div>
                </motion.div>
              </div>

              {/* Footer Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
              >
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5" />
                  <span>Open Thu-Sat, 10 PM - 4 AM</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>{clubDetails?.address || 'Location information unavailable'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-5 h-5" />
                  <span>Minimum spend: €{reservation.minPrice} per person</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {isConfirmationVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-xl"
              >
                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Confirm Your Reservation
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{reservation.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                      <p className="font-medium text-gray-900 dark:text-white">{reservation.startTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Guests</p>
                      <p className="font-medium text-gray-900 dark:text-white">{reservation.numOfGuests}</p>
                    </div>
                    {reservation.tableNumber && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Table</p>
                        <p className="font-medium text-gray-900 dark:text-white">{reservation.tableNumber}</p>
                      </div>
                    )}
                  </div>
                  {reservation.specialRequests && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Special Requests</p>
                      <p className="font-medium text-gray-900 dark:text-white">{reservation.specialRequests}</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmReservation}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-pink-500 text-white 
                             rounded-xl font-medium shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    Confirm Reservation
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsConfirmationVisible(false)}
                    className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 
                             dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 
                             dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Modify
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReservationPage;