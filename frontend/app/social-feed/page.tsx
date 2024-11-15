"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { Globe, Users, Star, Search, Compass, Calendar, Loader } from 'lucide-react';

import SocialFeed from '@/app/ui/socialFeedComponent';
import SearchBar from '@/app/ui/searchBar';
import BarCard from '@/app/ui/barCard';
import { fetchNormalUser, switchUsername2Id, fetchFeaturedClubsDetails } from '@/app/lib/backendAPI';

interface Location {
  type: string;
  coordinates: [number, number];
}

interface BarCardData {
  _id: string;
  username: string;
  displayName: string;
  description: string;
  formattedPrice: number;
  reviews: Array<{ id: string }>;
  location: Location;
  address: string;
  rating: number;
}

interface TabItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200
      ${isActive 
        ? 'bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-md' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
  >
    <Icon className="w-4 h-4" />
    <span className="font-medium">{label}</span>
  </motion.button>
);

const FeedPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedClubs, setRecommendedClubs] = useState<BarCardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'recommended'>('all');
  const router = useRouter();

  useEffect(() => {
    const initializePage = async () => {
      try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const decoded = jwtDecode<{ username: string }>(token);
        if (!decoded.username) {
          throw new Error('Invalid token');
        }

        const id = await switchUsername2Id(decoded.username);
        setUserId(id);

        const location = { lat: 37.9838, lng: 23.7275 };
        const clubs = await fetchFeaturedClubsDetails(location);
        setRecommendedClubs(clubs.filter(club => club !== null));

      } catch (err) {
        console.error('Error initializing feed page:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [router]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-6 rounded-xl text-center"
        >
          <p className="text-lg">Error loading feed: {error}</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading || !userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <div className="h-14 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
          <div className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SearchBar />
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feed Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm"
              >
                <div className="flex space-x-2">
                  <TabItem
                    icon={Globe}
                    label="All Activity"
                    isActive={activeTab === 'all'}
                    onClick={() => setActiveTab('all')}
                  />
                  <TabItem
                    icon={Users}
                    label="Following"
                    isActive={activeTab === 'following'}
                    onClick={() => setActiveTab('following')}
                  />
                  <TabItem
                    icon={Star}
                    label="Recommended"
                    isActive={activeTab === 'recommended'}
                    onClick={() => setActiveTab('recommended')}
                  />
                </div>
              </motion.div>

              {/* Feed Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SocialFeed userId={userId} feedType={activeTab} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Recommended Clubs */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                  Recommended Clubs
                </h2>
                <div className="space-y-4">
                  {recommendedClubs.slice(0, 3).map((club) => (
                    <Link key={club._id} href={`/club/${club.username}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition-all duration-200"
                      >
                        <BarCard
                          imageUrl=""
                          imageAlt=""
                          title={club.displayName}
                          description={club.description}
                          formattedPrice={club.formattedPrice}
                          reviewCount={club.reviews.length}
                          location={club.address}
                          rating={club.rating}
                        />
                      </motion.div>
                    </Link>
                  ))}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/explore"
                      className="block w-full py-3 text-center bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-lg
                               font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      Discover More Clubs
                    </Link>
                  </motion.div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/reservations"
                      className="flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-blue-500 to-pink-500
                               text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Make a Reservation</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/explore"
                      className="flex items-center justify-center space-x-2 w-full py-3 border-2 border-blue-500 text-blue-500
                               rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    >
                      <Compass className="w-5 h-5" />
                      <span>Browse Venues</span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;