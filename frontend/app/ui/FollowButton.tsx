"use client";

import React, { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { UserPlus2, UserMinus2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FollowButtonProps {
  clubId: string;
  isFollowing: boolean;
  onFollow: (clubId: string) => Promise<void>;
  onUnfollow: (clubId: string) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
}

const FollowButton: React.FC<FollowButtonProps> = ({
  clubId,
  isFollowing,
  onFollow,
  onUnfollow,
  size = 'md',
  variant = 'solid'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const toast = useToast();

  // Size mappings
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-2.5 text-lg'
  };

  // Variant mappings
  const getVariantClasses = (isFollowing: boolean, isHovered: boolean) => {
    if (isFollowing) {
      return isHovered
        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20';
    }
    
    switch (variant) {
      case 'outline':
        return 'bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-400/10';
      case 'ghost':
        return 'bg-transparent hover:bg-blue-400/10 text-blue-400';
      default: // solid
        return 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white';
    }
  };

  const handleAction = async () => {
    try {
      setIsLoading(true);
      if (isFollowing) {
        await onUnfollow(clubId);
        toast({
          title: "Unfollowed successfully",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
          render: ({ onClose }) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-white/10 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <UserMinus2 className="w-5 h-5 text-blue-400" />
                <p>Unfollowed successfully</p>
              </div>
            </motion.div>
          )
        });
      } else {
        await onFollow(clubId);
        toast({
          title: "Following successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right",
          render: ({ onClose }) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-white/10 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <UserPlus2 className="w-5 h-5 text-green-400" />
                <p>Following successfully</p>
              </div>
            </motion.div>
          )
        });
      }
    } catch (error: any) {
      toast({
        title: isFollowing ? "Failed to unfollow" : "Failed to follow",
        description: error?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
        render: ({ onClose }) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-red-500/20 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <div className="text-red-400">⚠️</div>
              <div>
                <p className="font-medium">{isFollowing ? "Failed to unfollow" : "Failed to follow"}</p>
                <p className="text-sm text-gray-400">{error?.message || "An error occurred"}</p>
              </div>
            </div>
          </motion.div>
        )
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative rounded-full font-medium transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-blue-400/50
        flex items-center justify-center gap-2
        ${sizeClasses[size]}
        ${getVariantClasses(isFollowing, isHovered)}
        ${isLoading ? 'cursor-not-allowed opacity-80' : ''}
      `}
      onClick={handleAction}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="animate-spin"
          >
            <Loader2 className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {isFollowing ? (
              isHovered ? <UserMinus2 className="w-4 h-4" /> : <UserPlus2 className="w-4 h-4" />
            ) : (
              <UserPlus2 className="w-4 h-4" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <span>
        {isFollowing
          ? (isHovered ? 'Unfollow' : 'Following')
          : 'Follow'}
      </span>
    </motion.button>
  );
};

export default FollowButton;