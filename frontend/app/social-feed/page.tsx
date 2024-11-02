"use client";

import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  useColorModeValue,
  Button,
  Icon,
  Skeleton
} from '@chakra-ui/react';
import { FaGlobe, FaUserFriends, FaStar } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

import SocialFeed from '@/app/ui/socialFeedComponent';
import { fetchNormalUser, switchUsername2Id, fetchFeaturedClubsDetails } from '@/app/lib/backendAPI';
import SearchBar from '@/app/ui/searchBar';
import BarCard from '@/app/ui/barCard';
import Link from 'next/link';

interface Location {
  type: string;
  coordinates: [number, number];
}

interface BarCardData {
  _id: string;
  username: string;
  displayName: string;
  description: string;
  formattedPrice: number;
  reviews: Array<{ id: string }>;
  location: Location;
  address: string;
  rating: number;
}

const FeedPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedClubs, setRecommendedClubs] = useState<BarCardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  
  // Color modes for consistent theming
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('userToken');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const decoded = jwtDecode<{ username: string }>(token);
        if (!decoded.username) {
          throw new Error('Invalid token');
        }

        // Get user ID
        const id = await switchUsername2Id(decoded.username);
        setUserId(id);

        // Fetch recommended clubs (using Athens as default location)
        const location = { lat: 37.9838, lng: 23.7275 };
        const clubs = await fetchFeaturedClubsDetails(location);
        setRecommendedClubs(clubs.filter(club => club !== null));

      } catch (err) {
        console.error('Error initializing feed page:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [router]);

  if (error) {
    return (
      <Container maxW="6xl" py={8}>
        <Box p={8} bg="red.50" color="red.500" borderRadius="lg" textAlign="center">
          <Text fontSize="lg">Error loading feed: {error}</Text>
        </Box>
      </Container>
    );
  }

  if (isLoading || !userId) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="60px" />
          <Skeleton height="200px" />
          <Skeleton height="400px" />
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Search Section */}
        <Box mb={6}>
          <SearchBar />
        </Box>

        {/* Main Content */}
        <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
          {/* Feed Section */}
          <Box flex="1">
            <Tabs variant="soft-rounded" colorScheme="orange" mb={6}>
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FaGlobe} />
                    <Text>All Activity</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FaUserFriends} />
                    <Text>Following</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={FaStar} />
                    <Text>Recommended</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <SocialFeed userId={userId} />
                </TabPanel>
                <TabPanel px={0}>
                  <SocialFeed userId={userId}  />
                </TabPanel>
                <TabPanel px={0}>
                  <SocialFeed userId={userId}  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          {/* Sidebar */}
          <Box
            w={{ base: 'full', lg: '320px' }}
            position={{ base: 'relative', lg: 'sticky' }}
            top="20px"
            height="fit-content"
          >
            <VStack spacing={6} align="stretch">
              {/* Recommended Clubs Section */}
              <Box
                bg={bgColor}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                p={4}
              >
                <Heading size="md" mb={4}>Recommended Clubs</Heading>
                <VStack spacing={4} align="stretch">
                  {recommendedClubs.slice(0, 3).map((club) => (
                    <Link key={club._id} href={`/club/${club.username}`}>
                      <Box
                        p={3}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={borderColor}
                        transition="all 0.2s"
                        _hover={{ shadow: 'md' }}
                      >
                        <BarCard
                          imageUrl=""
                          imageAlt=""
                          title={club.displayName}
                          description={club.description}
                          formattedPrice={club.formattedPrice}
                          reviewCount={club.reviews.length}
                          location={club.address} // Using address instead of location object
                          rating={club.rating}
                        />
                      </Box>
                    </Link>
                  ))}
                  <Button
                    as={Link}
                    href="/explore"
                    colorScheme="orange"
                    variant="outline"
                    size="sm"
                    w="full"
                  >
                    Discover More Clubs
                  </Button>
                </VStack>
              </Box>

              {/* Quick Actions */}
              <Box
                bg={bgColor}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                p={4}
              >
                <Heading size="md" mb={4}>Quick Actions</Heading>
                <VStack spacing={3}>
                  <Button
                    as={Link}
                    href="/reservations"
                    colorScheme="orange"
                    w="full"
                  >
                    Make a Reservation
                  </Button>
                  <Button
                    as={Link}
                    href="/explore"
                    variant="outline"
                    colorScheme="orange"
                    w="full"
                  >
                    Browse Venues
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </Flex>
      </VStack>
    </Container>
  );
};

export default FeedPage;