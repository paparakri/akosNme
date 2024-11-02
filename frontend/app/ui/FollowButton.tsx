"use client";

import React, { useState } from 'react';
import {
  Button,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { UserPlus2, UserMinus2, Loader2 } from 'lucide-react';

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
        });
      } else {
        await onFollow(clubId);
        toast({
          title: "Following successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) { // Type assertion for error
      toast({
        title: isFollowing ? "Failed to unfollow" : "Failed to follow",
        description: error?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={isFollowing ? 'solid' : variant}
      colorScheme={isFollowing ? (isHovered ? 'red' : 'green') : 'blue'}
      onClick={handleAction}
      isLoading={isLoading}
      spinner={<Loader2 className="animate-spin" />} // Changed from loadingIcon to spinner
      leftIcon={
        <Icon 
          as={isFollowing ? (isHovered ? UserMinus2 : UserPlus2) : UserPlus2}
        />
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isFollowing 
        ? (isHovered ? 'Unfollow' : 'Following') 
        : 'Follow'}
    </Button>
  );
};

export default FollowButton;