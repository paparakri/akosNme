import React, { useState, useEffect } from 'react';
import {
  VStack,
  Box,
  Text,
  Avatar,
  HStack,
  Button,
  Skeleton,
  useColorModeValue,
  Link,
  Icon,
  Badge
} from '@chakra-ui/react';
import { TimeIcon, StarIcon } from '@chakra-ui/icons';
import { Calendar } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import NextLink from 'next/link';
import { fetchUserFeed, type FeedItem } from '@/app/lib/backendAPI';

interface FeedItemProps {
  item: FeedItem;
}

const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'Date not available';
  
  try {
    // Handle date strings in DD-MM-YYYY format
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [day, month, year] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (isValid(date)) {
        return format(date, 'PPP');
      }
    }

    // Try parsing as ISO string
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

const formatTime = (timeString: string | undefined): string => {
  if (!timeString) return '';
  
  try {
    const date = parseISO(timeString);
    if (isValid(date)) {
      return format(date, 'p');
    }
    return '';
  } catch {
    return '';
  }
};

const FeedItemCard: React.FC<FeedItemProps> = ({ item }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const renderActionBadge = () => {
    const badges = {
      posted_review: { colorScheme: 'orange', text: 'Review' },
      made_reservation: { colorScheme: 'green', text: 'Reservation' },
      followed_club: { colorScheme: 'blue', text: 'New Follow' },
      followed_provider: { colorScheme: 'purple', text: 'New Follow' },
      upcoming_event: { colorScheme: 'pink', text: 'Event' }
    };

    const badgeInfo = badges[item.verb];
    return (
      <Badge colorScheme={badgeInfo.colorScheme} fontSize="sm">
        {badgeInfo.text}
      </Badge>
    );
  };

  const renderContent = () => {
    switch (item.verb) {
      case 'posted_review':
        return (
          <Box>
            <HStack spacing={1} mb={2}>
              {Array(5).fill('').map((_, i) => (
                <StarIcon
                  key={i}
                  color={i < (item.object.content.rating || 0) ? 'orange.500' : 'gray.300'}
                  w={4}
                  h={4}
                />
              ))}
            </HStack>
            <Text>{item.object.content.reviewText}</Text>
            <Link
              as={NextLink}
              href={`/club/${item.object.content.clubUsername}`}
              color="blue.500"
              fontSize="sm"
              mt={2}
              display="inline-block"
            >
              <Text as="span">at {item.object.content.clubName}</Text>
            </Link>
          </Box>
        );

      case 'made_reservation':
        return (
          <Box>
            <HStack spacing={2} align="flex-start">
              <Icon as={Calendar} color={mutedColor} mt={1} />
              <VStack align="start" spacing={1}>
                <Text>
                  Reserved at{' '}
                  <Link
                    as={NextLink}
                    href={`/club/${item.object.content.clubUsername}`}
                    color="blue.500"
                  >
                    {item.object.content.clubName}
                  </Link>
                </Text>
                <Text fontSize="sm" color={mutedColor}>
                  {formatDate(item.object.content.date)}
                </Text>
              </VStack>
            </HStack>
            {item.object.content.specialRequests && (
              <Text fontSize="sm" color={mutedColor} mt={2} fontStyle="italic">
                "{item.object.content.specialRequests}"
              </Text>
            )}
          </Box>
        );

      case 'upcoming_event':
        return (
          <Box>
            <Text fontWeight="bold">{item.object.content.eventName}</Text>
            <Text mt={1}>{item.object.content.description}</Text>
            <HStack spacing={2} mt={2}>
              <Icon as={Calendar} color={mutedColor} />
              <Text fontSize="sm" color={mutedColor}>
                {formatDate(item.object.content.date)}
              </Text>
            </HStack>
            <Link
              as={NextLink}
              href={`/club/${item.object.content.clubUsername}`}
              color="blue.500"
              fontSize="sm"
              mt={2}
              display="inline-block"
            >
              {item.object.content.clubName}
            </Link>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      p={4}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
    >
      <HStack spacing={3} mb={3} justify="space-between">
        <HStack spacing={3}>
          <Avatar
            size="md"
            name={item.actor.displayName}
            src={item.actor.picturePath}
          />
          <Box>
            <HStack spacing={2}>
              <Text fontWeight="bold">{item.actor.displayName}</Text>
              {renderActionBadge()}
            </HStack>
            <Text color={mutedColor} fontSize="sm">
              {formatDate(item.createdAt)}
            </Text>
          </Box>
        </HStack>
      </HStack>
      {renderContent()}
    </Box>
  );
};

interface SocialFeedProps {
  userId: string;
  feedType?: 'all' | 'following' | 'recommended';
}

const SocialFeed: React.FC<SocialFeedProps> = ({ userId, feedType = 'all' }) => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    if (!userId || isLoading) return;
    
    try {
      setIsLoading(true);
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
      <Box
        p={4}
        bg="red.50"
        color="red.500"
        borderRadius="md"
        textAlign="center"
      >
        {error}
      </Box>
    );
  }

  if (feed.length === 0 && !isLoading) {
    return (
      <Box
        p={8}
        textAlign="center"
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="lg"
        shadow="sm"
      >
        <Text fontSize="lg" mb={4}>No activity in your feed yet</Text>
        <Text color="gray.500">
          Follow some clubs or friends to see their activity here!
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} w="100%" align="stretch">
      {feed.map((item) => (
        <FeedItemCard key={item._id} item={item} />
      ))}
      {isLoading && (
        <VStack spacing={4} w="100%">
          {[1, 2].map((i) => (
            <Skeleton key={i} height="200px" borderRadius="lg" />
          ))}
        </VStack>
      )}
      {hasMore && !isLoading && (
        <Button
          onClick={loadMore}
          variant="outline"
          colorScheme="blue"
          size="lg"
          width="100%"
        >
          Load More
        </Button>
      )}
    </VStack>
  );
};

export default SocialFeed;