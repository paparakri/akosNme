"use client";

import React, { useState } from 'react';
import {
  Button,
  useToast,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { UserPlus, Loader2 } from 'lucide-react';

interface AddFriendButtonProps {
  userId: string;
  onAddFriend: (userId: string) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  hasSentRequest?: boolean;
  isFriend?: boolean;
}

const AddFriendButton: React.FC<AddFriendButtonProps> = ({
  userId,
  onAddFriend,
  size = 'md',
  variant = 'solid',
  hasSentRequest = false,
  isFriend = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleAddFriend = async () => {
    try {
      setIsLoading(true);
      await onAddFriend(userId);
      toast({
        title: "Friend request sent!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) { // Type assertion for error
      toast({
        title: "Failed to send friend request",
        description: error?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFriend) {
    return (
      <Tooltip label="Already friends" placement="top">
        <Button
          size={size}
          variant="ghost"
          colorScheme="green"
          leftIcon={<Icon as={UserPlus} />}
          isDisabled
        >
          Friends
        </Button>
      </Tooltip>
    );
  }

  if (hasSentRequest) {
    return (
      <Tooltip label="Friend request pending" placement="top">
        <Button
          size={size}
          variant="outline"
          colorScheme="orange"
          leftIcon={<Icon as={UserPlus} />}
          isDisabled
        >
          Request Sent
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      colorScheme="blue"
      onClick={handleAddFriend}
      isLoading={isLoading}
      spinner={<Loader2 className="animate-spin" />} // Changed from loadingIcon to spinner
      leftIcon={<Icon as={UserPlus} />}
    >
      Add Friend
    </Button>
  );
};

export default AddFriendButton;