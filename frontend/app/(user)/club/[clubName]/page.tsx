"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Badge,
  Image,
  VStack,
  HStack,
  Skeleton,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Divider,
  IconButton,
  Tooltip,
  useDisclosure,
  ScaleFade,
  SlideFade,
  useToast
} from '@chakra-ui/react';
import { StarIcon, CheckIcon, PhoneIcon, EmailIcon, InfoIcon } from '@chakra-ui/icons';
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaClock, FaUsers } from 'react-icons/fa';
import { fetchClubByName, switchUsername2Id, addReview, fetchNormalUser, followClub, unfollowClub } from '@/app/lib/backendAPI';
import ReservationModal from '@/app/ui/reservationModel';
import LayoutDisplay from '@/app/ui/seatingLayout';
import { OpeningHoursInfo, openingHoursToString } from '@/app/ui/openHoursPicker';
import ReviewComponent from '@/app/ui/clubProfile/reviewComponent';
import CreateReviewModal from '@/app/ui/clubProfile/createReviewModal';
import { jwtDecode } from 'jwt-decode';
import { useRouter, usePathname } from 'next/navigation';
import Subtitle from '@/app/ui/subtitle';
import EventCarousel from '@/app/ui/eventCarousel';
import FollowButton from '@/app/ui/FollowButton';
import { Check, Clock, Info, Mail, MapPin, Phone, Star, Users } from 'lucide-react';

interface ClubData {
  _id: string;
  displayName: string;
  images: string[];
  rating: number;
  reviews: string[];
  capacity: number;
  minAge: number;
  dressCode: string;
  genres: string[];
  tableLayout: any[];
  longDescription: string;
  description: string;
  features: string[];
  openingHours: any;
  contactInfo: {
    phone: string;
    email: string;
  };
  socialMediaLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  address: string;
}

const ClubProfile: React.FC<{ params: { clubName: string } }> = ({ params }) => {
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [layoutContainerSize, setLayoutContainerSize] = useState({ width: 0, height: 0 });
  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const layoutContainerRef = useRef<HTMLDivElement>(null);
  const bgGradient = useColorModeValue(
    'linear(to-b, blue.50, white)',
    'linear(to-b, gray.900, gray.800)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const fetchClubData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchClubByName(params.clubName);
      if (!data) throw new Error("No data received from API");
      setClubData(data);
    } catch (error) {
      console.error("Error in fetchClubData:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [params.clubName]);

  const handleCreateReview = async (review: { rating: number; reviewText: string }) => {
    if (!currentUserId || !clubData) return;
    try {
      await addReview(clubData._id, currentUserId, review);
      await fetchClubData();
      setIsCreateReviewModalOpen(false);
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const handleFollow = async (clubId: string) => {
    try {
      await followClub(currentUserId!, clubId);
      setIsFollowing(true);
    } catch (error: any) {
      console.error('Error following club:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to follow club',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleUnfollow = async (clubId: string) => {
    try {
      await unfollowClub(currentUserId!, clubId);
      setIsFollowing(false);
    } catch (error: any) {
      console.error('Error unfollowing club:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to unfollow club',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (currentUserId && clubData) {
        try {
          const user = await fetchNormalUser(currentUserId);
          setIsFollowing(user.clubInterests.includes(clubData._id));
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      }
    };
  
    checkFollowStatus();
  }, [currentUserId, clubData]);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      const decoded = jwtDecode<{ username: string }>(token);
      if (decoded.username) {
        switchUsername2Id(decoded.username).then(setCurrentUserId);
      }
    }

    fetchClubData();

    const handleScroll = () => setShowFloatingButton(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchClubData]);

  useEffect(() => {
    const updateLayoutSize = () => {
      if (layoutContainerRef.current) {
        setLayoutContainerSize({
          width: layoutContainerRef.current.offsetWidth,
          height: layoutContainerRef.current.offsetHeight,
        });
      }
    };

    updateLayoutSize();
    window.addEventListener('resize', updateLayoutSize);
    return () => window.removeEventListener('resize', updateLayoutSize);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="animate-pulse h-[500px] rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-4">
            <div className="animate-pulse h-15 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="animate-pulse h-50 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="text-center py-20">
      <Info className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Error Loading Club Profile</h2>
      <p className="text-gray-600 dark:text-gray-300">{error}</p>
    </div>
  );

  if (!clubData) return (
    <div className="text-center py-20">
      <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold">No Club Data Available</h2>
    </div>
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${
              index < rating
                ? 'fill-blue-400 text-blue-400'
                : 'fill-gray-300 text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={clubData.images !== null ? clubData.images[0] : "/default-club.jpeg"}
            alt={clubData.displayName}
            className="object-cover object-bottom w-full h-full transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-8 animate-fade-in-up">
              <div className="flex justify-between items-end flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-3">
                    {clubData.displayName}
                  </h1>
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="px-3 py-1 bg-blue-500 text-white text-md rounded-full">
                      Nightclub
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {Array(5).fill('').map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < (clubData.rating || 0)
                                ? 'text-blue-400 fill-blue-400'
                                : 'text-gray-300 fill-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white text-lg">
                        ({clubData.reviews?.length || 0} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-white">
                    <MapPin className="w-5 h-5" />
                    <span>{clubData.address}</span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  {currentUserId && (
                    <FollowButton
                      clubId={clubData._id}
                      isFollowing={isFollowing}
                      onFollow={handleFollow}
                      onUnfollow={handleUnfollow}
                    />
                  )}
                  <button
                    onClick={() => router.push(`${pathname}/reservation`)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full
                             shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
                             active:translate-y-0 active:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Reserve a Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
                          transition-transform duration-200 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-blue-500 mb-4">
                Quick Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Users className="text-blue-500" />
                    <span className="font-bold">Capacity</span>
                  </div>
                  <span>{clubData.capacity} people</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Info className="text-blue-500" />
                    <span className="font-bold">Minimum Age</span>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {clubData.minAge}+
                  </span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-blue-500" />
                    <span className="font-bold">Dress Code</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {clubData.dressCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Music Genres Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
                          transition-transform duration-200 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-blue-500 mb-4">
                Music Genres
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {clubData.genres?.map((genre: string) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm text-center"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Seating Layout Card */}
            {clubData.tableLayout[0] !== undefined && clubData.tableLayout[0].tableLayout !== undefined && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
                            transition-transform duration-200 hover:-translate-y-2">
                <h3 className="text-xl font-bold text-blue-500 mb-4">
                  Seating Layout
                </h3>
                <div ref={layoutContainerRef} className="h-[300px] w-full">
                  <LayoutDisplay 
                    tableList={clubData.tableLayout[0].tableLayout.tables || null}
                    containerWidth={layoutContainerSize.width}
                    containerHeight={layoutContainerSize.height}
                  />
                </div>
              </div>
            )}

            {/* Contact Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
                          transition-transform duration-200 hover:-translate-y-2">
              <h3 className="text-xl font-bold text-blue-500 mb-4">
                Contact
              </h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span className="font-medium truncate">
                      {clubData.contactInfo?.phone || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="font-medium truncate">
                      {clubData.contactInfo?.email || 'N/A'}
                    </span>
                  </div>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="space-y-2">
                  <span className="font-medium text-sm">Follow us:</span>
                  <div className="flex space-x-2">
                    {clubData.socialMediaLinks?.facebook && (
                      <a
                        href={clubData.socialMediaLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      >
                        <FaFacebook className="w-4 h-4" />
                      </a>
                    )}
                    {clubData.socialMediaLinks?.instagram && (
                      <a
                        href={clubData.socialMediaLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
                      >
                        <FaInstagram className="w-4 h-4" />
                      </a>
                    )}
                    {clubData.socialMediaLinks?.twitter && (
                      <a
                        href={clubData.socialMediaLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors"
                      >
                        <FaTwitter className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Middle and Right Columns */}
          <div className="col-span-1 md:col-span-2">
            <div className="space-y-8">
              {/* About Section */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
                            transition-transform duration-200 hover:-translate-y-2">
                <h2 className="text-3xl font-bold text-blue-500 mb-6">
                  About {clubData.displayName}
                </h2>
                <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-gray-300">
                  {clubData.longDescription || clubData.description}
                </p>
                <h3 className="text-xl font-bold text-blue-500 mb-4">
                  Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {clubData.features?.map((feature: string) => (
                    <div
                      key={feature}
                      className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <Check className="text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <OpeningHoursInfo 
                  label="Opening Hours"
                  value={openingHoursToString(clubData.openingHours)}
                />
              </div>

              {/* Events Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
                            transition-transform duration-200 hover:-translate-y-2">
                <EventCarousel clubId={clubData._id} />
              </div>

              {/* Reviews Section */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
                            transition-transform duration-200 hover:-translate-y-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-blue-500">
                    Reviews
                  </h2>
                  <button
                    onClick={() => setIsCreateReviewModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg
                              hover:bg-blue-600 transition-colors"
                  >
                    <Star className="w-5 h-5" />
                    <span>Write a Review</span>
                  </button>
                </div>
                {clubData.reviews && clubData.reviews.length > 0 ? (
                  <ReviewComponent 
                    reviews={clubData.reviews} 
                    currentUserId={currentUserId}
                    onReviewUpdate={fetchClubData}
                  />
                ) : (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No reviews available yet. Be the first to review!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        clubName={clubData.displayName}
      />
      <CreateReviewModal
        isOpen={isCreateReviewModalOpen}
        onClose={() => setIsCreateReviewModalOpen(false)}
        onSubmit={handleCreateReview}
      />
    </div>
  </div>
  );
};

export default ClubProfile;