"use client";

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  useColorModeValue,
  Skeleton,
  StackDivider,
} from '@chakra-ui/react';
import { UserX } from 'lucide-react';

interface Friend {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  picturePath?: string;
}

interface FriendListProps {
  friends: Friend[];
  isLoading?: boolean;
  onRemoveFriend?: (friendId: string) => void;
}

const FriendList: React.FC<FriendListProps> = ({
  friends,
  isLoading = false,
  onRemoveFriend
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (isLoading) {
    return (
      <VStack 
        spacing={4} 
        align="stretch"
        bg={bgColor}
        p={4}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        {[...Array(3)].map((_, i) => (
          <HStack key={i} spacing={4}>
            <Skeleton borderRadius="full" size="48px" />
            <VStack align="start" flex={1}>
              <Skeleton height="20px" width="150px" />
              <Skeleton height="16px" width="100px" />
            </VStack>
          </HStack>
        ))}
      </VStack>
    );
  }

  if (!friends.length) {
    return (
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        textAlign="center"
      >
        <Text color="gray.500">No friends added yet</Text>
      </Box>
    );
  }

  return (
    <VStack
      spacing={2}
      align="stretch"
      bg={bgColor}
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      divider={<StackDivider borderColor={borderColor} />}
    >
      {friends.map((friend) => (
        <HStack key={friend._id} spacing={4} p={2}>
          <Avatar
            size="md"
            name={`${friend.firstName} ${friend.lastName}`}
            src={friend.picturePath}
          />
          <VStack align="start" flex={1} spacing={0}>
            <Text fontWeight="medium">
              {friend.firstName} {friend.lastName}
            </Text>
            <Text fontSize="sm" color="gray.500">
              @{friend.username}
            </Text>
          </VStack>
          {onRemoveFriend && (
            <Button
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => onRemoveFriend(friend._id)}
              leftIcon={<UserX size={16} />}
            >
              Remove
            </Button>
          )}
        </HStack>
      ))}
    </VStack>
  );
};

export default FriendList;