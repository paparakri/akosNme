'use client'

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Star, Users, RefreshCcw, ChevronDown,
  MapPin, Music, Award, Text,
  Compass
} from 'lucide-react';
import { fetchFeedPosts } from '../../lib/backendAPI';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Actor {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  address?: string;
}

interface Club {
  displayName: string;
}

interface EventMetadata {
  eventName: string;
  eventDescription: string;
  eventDate: string;
}

interface ReservationMetadata {
  reservationDate: string;
  guestCount: number;
  tableNumber?: string;
}

interface ReviewMetadata {
  rating: number;
  reviewText: string;
}

interface Post {
  _id: string;
  postType: 'event' | 'reservation' | 'review';
  actor: Actor;
  createdAt: string;
  metadata: EventMetadata | ReservationMetadata | ReviewMetadata;
  club: Club;
  groupedPosts?: Post[];
}

interface CardStyle {
  gradient: string;
  border: string;
  icon: React.ComponentType<any>;
  iconColor: string;
}

interface ActivityCardProps {
  post: Post;
  onExpand: () => void;
}

interface TrendingSidebarProps {
  events: Post[];
}

const formatDate = (dateString: string | Date): string => {
  try {
    let date;
    
    // If it's already a Date object
    if (dateString instanceof Date) {
      date = dateString;
    }
    // If it's a string
    else if (typeof dateString === 'string') {
      // Handle different formats
      if (dateString.includes('GMT')) {
        // GMT locale string format
        date = new Date(dateString);
      }
      else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        // dd-mm-yyyy format
        const [day, month, year] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      }
      else if (dateString.includes('T')) {
        // ISO format (2025-01-03T20:16:41.958+00:00)
        date = new Date(dateString);
      }
      else if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
        // yyyy-mm-dd format
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      }
      else {
        // Try direct parsing as last resort
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    // Final validation
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid date';
    }
    
    // Format as dd-MM-yyyy
    return format(date, 'dd-MM-yyyy');
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Invalid date';
  }
};

// Activity Card Component
const ActivityCard: React.FC<ActivityCardProps> = ({ post, onExpand }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCardStyle = (type: 'event' | 'reservation' | 'review'): CardStyle => {
    switch (type) {
      case 'event':
        return {
          gradient: 'from-purple-500/10 to-blue-500/10',
          border: 'border-purple-500/20',
          icon: Music,
          iconColor: 'text-purple-400'
        };
      case 'reservation':
        return {
          gradient: 'from-blue-500/10 to-green-500/10',
          border: 'border-blue-500/20',
          icon: Calendar,
          iconColor: 'text-blue-400'
        };
      case 'review':
        return {
          gradient: 'from-pink-500/10 to-red-500/10',
          border: 'border-pink-500/20',
          icon: Star,
          iconColor: 'text-pink-400'
        };
    }
  };

  const style = getCardStyle(post.postType);
  const IconComponent = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-xl border ${style.border} mb-6`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${style.gradient} opacity-50`} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-white/5 ${style.iconColor}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {post.actor.firstName && post.actor.lastName 
                  ? `${post.actor.firstName} ${post.actor.lastName}`
                  : post.actor.displayName}
              </h3>
              <p className="text-sm text-gray-400">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
          
          {post.groupedPosts && post.groupedPosts.length > 0 && (
            <div className="px-3 py-1 rounded-full bg-white/5 text-sm">
              +{post.groupedPosts.length} more
            </div>
          )}
        </div>

        {post.postType === 'event' && (
          <div className="space-y-3">
            <p className="text-xl font-semibold">{(post.metadata as EventMetadata).eventName}</p>
            <p className="text-gray-300">{(post.metadata as EventMetadata).eventDescription}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate((post.metadata as EventMetadata).eventDate)}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {post.actor.address}
              </div>
            </div>
          </div>
        )}

        {post.postType === 'reservation' && (
          <div className="space-y-3">
            <p className="text-lg">
              Made a reservation at <span className="font-semibold">{post.club.displayName}</span>
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate((post.metadata as ReservationMetadata).reservationDate)}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {(post.metadata as ReservationMetadata).guestCount} guests
              </div>
              {(post.metadata as ReservationMetadata).tableNumber && (
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Table {(post.metadata as ReservationMetadata).tableNumber}
                </div>
              )}
            </div>
          </div>
        )}

        {post.postType === 'review' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < (post.metadata as ReviewMetadata).rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
            <p className="text-lg">{(post.metadata as ReviewMetadata).reviewText}</p>
            <p className="text-sm text-gray-400">
              Review for {post.club.displayName}
            </p>
          </div>
        )}

        {isHovered && post.groupedPosts && post.groupedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <p className="text-sm text-gray-400 mb-2">Similar activities:</p>
            {post.groupedPosts.map((groupedPost: Post, index: number) => (
              <div key={index} className="text-sm text-gray-300 mb-1">
                • {groupedPost.actor.firstName} {groupedPost.actor.lastName}
                {' - '}
                {formatDate(groupedPost.createdAt)}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Trending Sidebar Component
const TrendingSidebar: React.FC<TrendingSidebarProps> = ({ events }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
    <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
      Trending Events
    </h2>
    <div className="space-y-4">
      {events.map((event: Post, index: number) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <h3 className="font-medium mb-2">{(event.metadata as EventMetadata).eventName}</h3>
          <div className="flex items-center text-sm text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate((event.metadata as EventMetadata).eventDate)}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// Main Feed Component
const SocialFeed: React.FC = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement>(null);

  const loadPosts = async (pageNum = 1, refresh = false) => {
    try {
      setIsLoading(true);
      const response = await fetchFeedPosts(pageNum);
      const newPosts = response || [];
      
      setPosts(prev => {
        if (refresh) return newPosts;
        const existingIds = new Set(prev.map(post => post._id));
        const uniqueNewPosts = newPosts.filter((post: { _id: string; }) => !existingIds.has(post._id));
        return [...prev, ...uniqueNewPosts];
      });
      
      setHasMore(newPosts.length === 20);
      setError(null);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load feed');
      setPosts(prev => refresh ? [] : prev);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadPosts(1, true);
  };

  useEffect(() => {
    loadPosts(page);
  }, [page]);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        await loadPosts(1, true);
      } catch (err) {
        console.error('Failed to load initial posts:', err);
        setError('Failed to load feed');
        setIsLoading(false);
      }
    };

    fetchInitialPosts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  const trendingEvents = posts
    .filter(post => post.postType === 'event')
    .sort((a, b) => {
      const dateA = new Date((a.metadata as EventMetadata).eventDate);
      const dateB = new Date((b.metadata as EventMetadata).eventDate);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 3);

  if (posts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 m-32"
      >
        <div className="w-16 h-16 mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Compass className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Your Feed is Empty
        </h3>
        <p className="text-gray-400 text-center max-w-md mb-8">
          Follow clubs and connect with friends to see their latest activities and upcoming events.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/explore')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-medium text-white 
                   shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200"
        >
          Discover Clubs
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="mb-6 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full
                       flex items-center space-x-2 text-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Refresh Feed</span>
            </motion.button>

            {isLoading && posts.length === 0 ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white/5 rounded-xl p-6 mb-6"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-white/10 rounded" />
                      <div className="h-3 w-24 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="h-4 w-1/2 bg-white/10 rounded" />
                  </div>
                </div>
              ))
            ) : (
              <AnimatePresence>
                {posts.map((post) => (
                  <ActivityCard
                    key={post._id}
                    post={post}
                    onExpand={() => {}}
                  />
                ))}
              </AnimatePresence>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center text-red-400"
              >
                {error}
              </motion.div>
            )}

            <div ref={loader} className="h-20 flex items-center justify-center">
              {isLoading && hasMore && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full"
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <TrendingSidebar events={trendingEvents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;