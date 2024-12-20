'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedItem, fetchUserFeed, getActivityContext } from '@/app/lib/backendAPI';
import { MessageSquare, Share2, MoreVertical, Users, Lock, Clock, Calendar, Star, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

const timeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const elapsed = now.getTime() - past.getTime();

  if (elapsed < msPerHour) {
    const mins = Math.round(elapsed/msPerMinute);
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (elapsed < msPerDay) {
    const hours = Math.round(elapsed/msPerHour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.round(elapsed/msPerDay);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};

interface FeedItemProps {
  item: FeedItem;
}

const FeedItemCard: React.FC<FeedItemProps> = ({ item }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={item.actor.picturePath || '/api/placeholder/40/40'}
              alt={item.actor.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            {item.actor.userType === 'club' && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{item.actor.displayName}</h3>
            <span className="text-sm text-gray-400">{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {item.verb === 'posted_review' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <p className="text-yellow-500 font-medium">
                Reviewed {item.object.content.clubName}
              </p>
            </div>
            <p className="text-gray-200">{item.object.content.reviewText}</p>
            <div className="flex items-center space-x-1">
              {Array.from({ length: item.object.content.rating || 0 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
          </div>
        )}

        {item.verb === 'upcoming_event' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <p className="text-purple-400 font-medium">
                New Event: {item.object.content.eventName}
              </p>
            </div>
            <p className="text-gray-200">{item.object.content.description}</p>
            <div className="bg-purple-500/10 rounded-lg p-4">
              <p className="text-purple-400 font-medium">
                📅 {new Date(item.object.content.date || '').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}

        {item.verb === 'made_reservation' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-medium">
                Made a reservation at {item.object.content.clubName}
              </p>
            </div>
            {item.object.content.specialRequests && (
              <p className="text-gray-200">"{item.object.content.specialRequests}"</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center space-x-6">
        <button className="group flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors">
          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Comment</span>
        </button>
        
        <button className="group flex items-center space-x-2 text-gray-400 hover:text-purple-500 transition-colors">
          <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Share</span>
        </button>

        {item.verb === 'upcoming_event' && (
          <Link
            href={`/club/${item.object.content.clubUsername}/events/${item.object.targetId}`}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full 
                     hover:shadow-lg transition-all duration-200 text-sm font-medium ml-auto"
          >
            View Event
          </Link>
        )}
      </div>
    </motion.div>
  );
};

interface SocialFeedProps {
  userId: string;
  feedType?: 'all' | 'following' | 'recommended';
}

const SocialFeed: React.FC<SocialFeedProps> = ({ userId, feedType = 'all' }) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await fetchUserFeed(userId, pageNum);
      
      if (response) {
        if (append) {
          setFeedItems(prev => [...prev, ...response.feed]);
        } else {
          setFeedItems(response.feed);
        }
        setHasMore(response.hasMore);
        setPage(response.nextPage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeed(1, false);
  }, [userId, feedType]);

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-xl p-8 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => loadFeed(1, false)}
          className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {feedItems.map((item) => (
          <FeedItemCard key={item._id} item={item} />
        ))}
      </AnimatePresence>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
          <p className="text-gray-400 mt-2">Loading feed...</p>
        </div>
      )}

      {!isLoading && feedItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Your feed is empty
          </h3>
          <p className="text-gray-400 mb-6">
            Start following some venues and friends to see their updates here
          </p>
          <Link
            href="/explore"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg 
                     font-medium hover:shadow-lg transition-all duration-200 inline-block"
          >
            Discover People & Venues
          </Link>
        </div>
      )}

      {hasMore && !isLoading && feedItems.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => loadFeed(page, true)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;