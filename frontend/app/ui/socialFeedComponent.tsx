import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Star, Clock, MessageCircle, Heart, Share2, ChevronDown } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { fetchUserFeed } from '@/app/lib/backendAPI';

interface FeedItem {
  _id: string;
  actor: {
    displayName: string;
    picturePath?: string;
  };
  verb: 'posted_review' | 'made_reservation' | 'followed_club' | 'followed_provider' | 'upcoming_event';
  object: {
    content: {
      rating?: number;
      reviewText?: string;
      clubName?: string;
      clubUsername?: string;
      date?: string;
      eventName?: string;
      description?: string;
      specialRequests?: string;
    };
  };
  createdAt: string;
}

interface FeedItemProps {
  item: FeedItem;
}

interface SocialFeedProps {
  userId: string;
  feedType?: 'all' | 'following' | 'recommended';
}

const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'Date not available';
  
  try {
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [day, month, year] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (isValid(date)) {
        return format(date, 'PPP');
      }
    }

    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (isValid(date)) {
      return format(date, 'PPP');
    }

    return 'Invalid date';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const ActionBadge: React.FC<{ type: FeedItem['verb'] }> = ({ type }) => {
  const badges = {
    posted_review: { color: 'bg-blue-500', icon: Star, text: 'Review' },
    made_reservation: { color: 'bg-green-500', icon: Calendar, text: 'Reservation' },
    followed_club: { color: 'bg-blue-500', icon: Heart, text: 'New Follow' },
    followed_provider: { color: 'bg-purple-500', icon: Heart, text: 'New Follow' },
    upcoming_event: { color: 'bg-pink-500', icon: Calendar, text: 'Event' }
  };

  const { color, icon: Icon, text } = badges[type];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} text-white`}>
      <Icon className="w-3 h-3 mr-1" />
      {text}
    </span>
  );
};

const FeedItemCard: React.FC<FeedItemProps> = ({ item }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50));

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md 
                 transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src={item.actor.picturePath || '/default-avatar.svg'}
                  alt={item.actor.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {item.actor.displayName}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <ActionBadge type={item.verb} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {item.verb === 'posted_review' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${
                    index < (item.object.content.rating || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {item.object.content.reviewText}
            </p>
            <Link
              href={`/club/${item.object.content.clubUsername}`}
              className="inline-flex items-center space-x-1 text-blue-500 hover:text-blue-600 
                         transition-colors duration-200"
            >
              <span>{item.object.content.clubName}</span>
            </Link>
          </div>
        )}

        {item.verb === 'made_reservation' && (
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-900 dark:text-white">
                  Reserved at{' '}
                  <Link
                    href={`/club/${item.object.content.clubUsername}`}
                    className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    {item.object.content.clubName}
                  </Link>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(item.object.content.date)}
                </p>
              </div>
            </div>
            {item.object.content.specialRequests && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                  "{item.object.content.specialRequests}"
                </p>
              </div>
            )}
          </div>
        )}

        {item.verb === 'upcoming_event' && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {item.object.content.eventName}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {item.object.content.description}
            </p>
            <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(item.object.content.date)}</span>
              </div>
              <Link
                href={`/club/${item.object.content.clubUsername}`}
                className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
              >
                {item.object.content.clubName}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1.5 ${
              isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            } hover:text-red-500 transition-colors duration-200`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likes}</span>
          </button>
          <button className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400 
                           hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">Comment</span>
          </button>
          <button className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400 
                           hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
            <Share2 className="w-5 h-5" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SocialFeed: React.FC<SocialFeedProps> = ({ userId, feedType = 'all' }) => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    try {
      const data = await fetchUserFeed(userId, page, 20);
      
      if (!data) {
        throw new Error('Failed to fetch feed data');
      }
      
      setFeed(prev => [...prev, ...data.feed]);
      setHasMore(data.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error('Feed fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred loading your feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setFeed([]);
    setPage(1);
    setHasMore(true);
    loadMore();
  }, [userId, feedType]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-lg text-center">
        <p>{error}</p>
      </div>
    );
  }

  if (feed.length === 0 && !isLoading) {
    return (
      <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full 
                      flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Activity Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Follow some clubs or friends to see their activity here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {feed.map((item) => (
          <FeedItemCard key={item._id} item={item} />
        ))}
      </AnimatePresence>
      
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl h-48 animate-pulse"
            />
          ))}
        </div>
      )}
      
      {hasMore && !isLoading && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={loadMore}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-pink-500 text-white 
                     rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200
                     flex items-center justify-center space-x-2"
        >
          <span>Load More</span>
          <ChevronDown className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
};

export default SocialFeed;