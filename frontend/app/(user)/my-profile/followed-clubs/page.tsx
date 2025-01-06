'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Grid, List, UserMinus, Users } from 'lucide-react';
import { fetchClubFollowers, switchUsername2Id, fetchNormalUser, unfollowClub, fetchClubInfo } from '@/app/lib/backendAPI';
import { getCurrentUser } from '@/app/lib/userStatus';

interface Club {
  _id: string;
  username: string;
  displayName: string;
  followers: string[];
}

interface User {
  username: string;
  friends: string[];
  clubInterests: string[];
}

const FollowedClubsPage = () => {
  const router = useRouter();
  const [followedClubs, setFollowedClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const calculateFriendsFollowing = (clubFollowers: string[]) => {
    if (!user?.friends) return 0;
    return user.friends.filter(friend => clubFollowers.includes(friend)).length;
  }

  useEffect(() => {
    const initializePage = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.username) {
          router.push('/sign-in');
          return;
        }

        const id = await switchUsername2Id(currentUser.username);
        setUserId(id);

        const userData = await fetchNormalUser(id);
        setUser(userData);

        const clubObjects = await Promise.all(userData.clubInterests.map(async (clubId: string) => {
          const clubData = await fetchClubInfo(clubId);
          return clubData;
        }));

        setFollowedClubs(clubObjects);
        setFilteredClubs(clubObjects);
      } catch (error) {
        console.error('Error fetching followed clubs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [router]);

  useEffect(() => {
    const filtered = followedClubs.filter(club =>
      club.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClubs(filtered);
  }, [searchQuery, followedClubs]);

  const handleUnfollow = async (clubId: string) => {
    if (!userId) return;
    try {
      await unfollowClub(userId, clubId);
      setFollowedClubs(prev => prev.filter(club => club._id !== clubId));
    } catch (error) {
      console.error('Error unfollowing club:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Followed Clubs
          </h1>
          
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Clubs Display */}
        <AnimatePresence mode="wait">
          {filteredClubs.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={viewMode === 'grid' ? 
                'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 
                'space-y-4'
              }
            >
              {filteredClubs.map((club) => (
                <motion.div
                  key={club._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden
                    ${viewMode === 'grid' ? '' : 'flex items-center'}`}
                >
                  <div 
                    className={`relative cursor-pointer group ${viewMode === 'grid' ? 'p-6' : 'p-4 flex-1'}`}
                    onClick={() => router.push(`/club/${club.username}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative">
                      <h3 className="text-xl font-semibold mb-2">{club.displayName}</h3>
                      {calculateFriendsFollowing(club.followers) !== 0 && 
                        <div className="flex items-center text-gray-400 text-sm">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Followed by {calculateFriendsFollowing(club.followers)} friends</span>
                        </div>
                      }
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnfollow(club._id)}
                    className={`flex items-center justify-center text-red-400 hover:text-red-300 transition-colors
                      ${viewMode === 'grid' ? 'w-full p-3 bg-white/5 border-t border-white/10' : 'p-4 border-l border-white/10'}`}
                  >
                    <UserMinus className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/5">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Clubs Found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try adjusting your search' : 'Start following some clubs to see them here'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FollowedClubsPage;