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
  Badge,
} from '@chakra-ui/react';
import { Check, X } from 'lucide-react';

interface FriendRequest {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  picturePath?: string;
}

interface FriendRequestsProps {
  requests: FriendRequest[];
  isLoading?: boolean;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const FriendRequests: React.FC<FriendRequestsProps> = ({
  requests,
  isLoading = false,
  onAccept,
  onReject
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
        {[...Array(2)].map((_, i) => (
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

  if (!requests.length) {
    return (
      <Box
        bg={bgColor}
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        textAlign="center"
      >
        <Text color="gray.500">No pending friend requests</Text>
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
      {requests.map((request) => (
        <HStack key={request._id} spacing={4} p={2}>
          <Avatar
            size="md"
            name={`${request.firstName} ${request.lastName}`}
            src={request.picturePath}
          />
          <VStack align="start" flex={1} spacing={0}>
            <HStack>
              <Text fontWeight="medium">
                {request.firstName} {request.lastName}
              </Text>
              <Badge colorScheme="blue">New Request</Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              @{request.username}
            </Text>
          </VStack>
          <HStack>
            <Button
              size="sm"
              colorScheme="green"
              onClick={() => onAccept(request._id)}
              leftIcon={<Check size={16} />}
            >
              Accept
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => onReject(request._id)}
              leftIcon={<X size={16} />}
            >
              Decline
            </Button>
          </HStack>
        </HStack>
      ))}
    </VStack>
  );
};

export default FriendRequests;