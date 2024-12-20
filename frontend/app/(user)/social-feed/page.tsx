'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import {
  MessageSquare,
  Share2,
  MoreVertical,
  Users,
  Lock,
  Clock,
  Calendar,
  Star,
  UserPlus,
  Loader2
} from 'lucide-react';
import { fetchNormalUser, switchUsername2Id } from '@/app/lib/backendAPI';
import SocialFeed from '@/app/ui/socialFeedComponent';

// Mock feed data matching the schema
const MOCK_FEED_ITEMS = [
  {
    _id: '1',
    actor: {
      userId: '507f1f77bcf86cd799439011',
      userType: 'normal',
      displayName: 'Alex Thompson',
      picturePath: '/api/placeholder/400/400'
    },
    verb: 'posted_review',
    object: {
      targetId: '507f1f77bcf86cd799439021',
      targetType: 'club',
      content: {
        rating: 5,
        reviewText: 'Amazing night at Club Horizon! The atmosphere was electric and the staff was incredibly friendly. Will definitely be coming back! 🎉',
        clubName: 'Club Horizon'
      }
    },
    metadata: {
      privacy: 'public',
      location: 'Athens, Greece',
      tags: ['nightlife', 'clubbing', 'athens']
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    _id: '2',
    actor: {
      userId: '507f1f77bcf86cd799439012',
      userType: 'club',
      displayName: 'Luna Lounge',
      picturePath: '/api/placeholder/400/400'
    },
    verb: 'upcoming_event',
    object: {
      targetId: '507f1f77bcf86cd799439022',
      targetType: 'event',
      content: {
        eventName: 'Summer Sensation',
        eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        description: 'Join us for our biggest event of the summer! International DJs, special performances, and unforgettable moments.',
        image: '/api/placeholder/800/600'
      }
    },
    metadata: {
      privacy: 'public',
      location: 'Luna Lounge, Athens',
      tags: ['event', 'summer', 'party']
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
  },
  // ... more mock items as before
];

const FeedItem = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800"
    >
      {/* Feed Item Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={item.actor.picturePath || '/default-avatar.png'}
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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                })}
              </span>
              {item.metadata.location && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-400">
                    📍 {item.metadata.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {item.metadata.privacy !== 'public' && (
            <span className="text-gray-400">
              {item.metadata.privacy === 'followers' ? (
                <Users className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </span>
          )}
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Feed Item Content */}
      <div className="space-y-4">
        {/* Render different content based on verb type */}
        {item.verb === 'posted_review' && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <p className="text-yellow-500 font-medium">Reviewed {item.object.content.clubName}</p>
            </div>
            <p className="text-gray-200">{item.object.content.reviewText}</p>
          </div>
        )}

        {item.verb === 'upcoming_event' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <p className="text-purple-400 font-medium">New Event: {item.object.content.eventName}</p>
            </div>
            <p className="text-gray-200">{item.object.content.description}</p>
            {item.object.content.image && (
              <img
                src={item.object.content.image}
                alt={item.object.content.eventName}
                className="rounded-xl w-full object-cover max-h-96"
              />
            )}
            <div className="bg-purple-500/10 rounded-lg p-4">
              <p className="text-purple-400 font-medium">
                📅 {new Date(item.object.content.eventDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-gray-400 mt-1">
                📍 {item.metadata.location}
              </p>
            </div>
          </div>
        )}

        {/* Tags */}
        {item.metadata.tags && item.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {item.metadata.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-800 rounded-full text-gray-400 text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Feed Item Actions */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button className="group flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors">
            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Comment</span>
          </button>
          
          <button className="group flex items-center space-x-2 text-gray-400 hover:text-purple-500 transition-colors">
            <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Share</span>
          </button>
        </div>

        {/* Context-specific buttons */}
        {item.verb === 'upcoming_event' && (
          <Link
            href={`/event/${item.object.targetId}`}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full 
                     hover:shadow-lg transition-all duration-200 text-sm font-medium"
          >
            View Event
          </Link>
        )}
      </div>

      {/* Timestamp and Privacy */}
      <div className="mt-4 flex items-center text-xs text-gray-400">
        <Clock className="w-3 h-3 mr-1" />
        <span>
          {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
            -Math.round((new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60)), 
            'hour'
          )}
        </span>
        {item.metadata.privacy !== 'public' && (
          <>
            <span className="mx-1">•</span>
            <span className="flex items-center">
              {item.metadata.privacy === 'followers' ? (
                <>
                  <Users className="w-3 h-3 mr-1" />
                  Followers only
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </>
              )}
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
};

const SocialFeedPage = () => {
  const [userId, setUserId] = useState(null);
  const [feedItems, setFeedItems] = useState(MOCK_FEED_ITEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const initializePage = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          router.push('/sign-in');
          return;
        }

        const decoded = jwtDecode(token);
        if (!decoded.username) throw new Error('Invalid token');

        const id = await switchUsername2Id(decoded.username);
        setUserId(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto" />
          <p className="text-gray-400">Loading your feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-8 max-w-md mx-auto text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Feed Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Your Social Feed
          </h1>
          <p className="text-gray-400 mt-2">
            Stay updated with your favorite venues and friends
          </p>
        </motion.div>

        {/* Feed Items */}
        <AnimatePresence mode="popLayout">
          <SocialFeed userId={userId} feedType="all" />
        </AnimatePresence>

        {/* Empty State */}
        {!isLoading && feedItems?.length === 0 && (
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
      </div>
    </div>
  );
};

export default SocialFeedPage;