"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Container, Flex, Heading, Text, Button, Badge, Image,
  VStack, HStack, Skeleton, SimpleGrid, Icon, useColorModeValue
} from '@chakra-ui/react';
import { StarIcon, CheckIcon, PhoneIcon, EmailIcon } from '@chakra-ui/icons';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { fetchClubByName, switchUsername2Id, addRemoveReview } from '@/app/lib/backendAPI';
import ReservationModal from '@/app/ui/reservationModel';
import LayoutDisplay from '@/app/ui/seatingLayout';
import { OpeningHoursInfo, openingHoursToString } from '@/app/ui/openHoursPicker';
import ReviewComponent from '@/app/ui/clubProfile/reviewComponent';
import CreateReviewModal from '@/app/ui/clubProfile/createReviewModal';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface ClubData {
  _id: string;
  displayName: string;
  imageUrl: string;
  rating: number;
  reviews: string[];
  capacity: number;
  minAge: number;
  dressCode: string;
  genres: string[];
  tableLayout: any[]; // Consider creating a proper type for this
  longDescription: string;
  description: string;
  features: string[];
  openingHours: any; // Consider creating a proper type for this
  contactInfo: {
    phone: string;
    email: string;
  };
  socialMediaLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

const ClubProfile: React.FC<{ params: { clubName: string } }> = ({ params }) => {
  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [layoutContainerSize, setLayoutContainerSize] = useState({ width: 0, height: 0 });
  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const layoutContainerRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const router = useRouter();

  const fetchClubData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchClubByName(params.clubName);
      if (!data) throw new Error("No data received from API");
      setClubData(data);
    } catch (error) {
      console.error("Error in fetchClubData:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [params.clubName]);

  const handleCreateReview = async (review: { rating: number; reviewText: string }) => {
    if (!currentUserId || !clubData) return;
    try {
      await addRemoveReview(clubData._id, currentUserId, review);
      await fetchClubData();
      setIsCreateReviewModalOpen(false);
    } catch (error) {
      console.error("Error adding review:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      const decoded = jwtDecode<{ username: string }>(token);
      if (decoded.username) {
        switchUsername2Id(decoded.username).then(setCurrentUserId);
      }
    }

    fetchClubData();

    const handleScroll = () => setShowFloatingButton(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchClubData]);

  useEffect(() => {
    const updateLayoutSize = () => {
      if (layoutContainerRef.current) {
        setLayoutContainerSize({
          width: layoutContainerRef.current.offsetWidth,
          height: layoutContainerRef.current.offsetHeight,
        });
      }
    };

    updateLayoutSize();
    window.addEventListener('resize', updateLayoutSize);
    return () => window.removeEventListener('resize', updateLayoutSize);
  }, []);

  if (isLoading) {
    return (
      <Container maxW="6xl" py={12}>
        <Skeleton height="400px" />
        <Skeleton height="40px" mt={6} />
        <Skeleton height="20px" mt={4} />
        <Skeleton height="20px" mt={2} />
      </Container>
    );
  }

  if (error) return <Box>Error: {error}</Box>;
  if (!clubData) return <Box>No club data available</Box>;

  return (
    <Container maxW="6xl" py={12}>
      <VStack spacing={8} align="stretch">
        {/* Hero Section */}
        <Box position="relative" height="400px" borderRadius="lg" overflow="hidden" boxShadow="xl">
          <Image
            src={clubData.imageUrl || '/assets/images/default-club.jpg'}
            alt={clubData.displayName || 'Club image'}
            objectFit="cover"
            w="100%"
            h="100%"
          />
          <Box position="absolute" bottom={0} left={0} right={0} bg="rgba(0,0,0,0.7)" p={6} color="white">
            <Flex justifyContent="space-between" alignItems="center">
              <Box>
                <Heading as="h1" size="2xl" mb={2}>{clubData.displayName}</Heading>
                <HStack spacing={4}>
                  <Badge colorScheme="orange" fontSize="md" p={1}>Club</Badge>
                  <HStack>
                    {Array(5).fill('').map((_, i) => (
                      <StarIcon key={i} color={i < (clubData.rating || 0) ? 'orange.500' : 'gray.300'} />
                    ))}
                    <Text>{clubData.reviews?.length || 0} reviews</Text>
                  </HStack>
                </HStack>
              </Box>
              <Button colorScheme="orange" size="lg" onClick={() => router.push(`/reservation`)} boxShadow="lg">
                Reserve a Table
              </Button>
            </Flex>
          </Box>
        </Box>

        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {/* Left Column */}
          <VStack align="stretch" spacing={6}>
            {/* Quick Info */}
            <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="md" border="1px" borderColor={borderColor}>
              <Heading as="h3" size="md" mb={4}>Quick Info</Heading>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Capacity:</Text>
                  <Text>{clubData.capacity} people</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Minimum Age:</Text>
                  <Text>{clubData.minAge}+</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Dress Code:</Text>
                  <Text>{clubData.dressCode}</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Music Genres */}
            <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="md" border="1px" borderColor={borderColor}>
              <Heading as="h3" size="md" mb={4}>Music Genres</Heading>
              <SimpleGrid columns={2} spacing={2}>
                {clubData.genres?.map((genre: string) => (
                  <Badge key={genre} colorScheme="purple" fontSize="sm" p={1}>{genre}</Badge>
                ))}
              </SimpleGrid>
            </Box>

            {/* Seating Layout */}
            {clubData.tableLayout && clubData.tableLayout[0] && (
              <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="md" border="1px" borderColor={borderColor}>
                <Heading as="h3" size="md" mb={4}>Seating Layout</Heading>
                <Box ref={layoutContainerRef} height="300px" width="100%">
                  <LayoutDisplay 
                    tableList={clubData.tableLayout[0].tableLayout.tables}
                    containerWidth={layoutContainerSize.width}
                    containerHeight={layoutContainerSize.height}
                  />
                </Box>
              </Box>
            )}
          </VStack>

          {/* Middle and Right Columns */}
          <Box gridColumn={{ base: "auto", md: "span 2" }}>
            <VStack align="stretch" spacing={8}>
              {/* About Section */}
              <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="md" border="1px" borderColor={borderColor}>
                <Heading as="h2" size="xl" mb={4}>About Club {clubData.displayName}</Heading>
                <Text mb={4}>{clubData.longDescription || clubData.description}</Text>
                <Heading as="h3" size="md" mb={2}>Features</Heading>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2} mb={4}>
                  {clubData.features?.map((feature: string) => (
                    <HStack key={feature}>
                      <CheckIcon color="green.500" />
                      <Text>{feature}</Text>
                    </HStack>
                  ))}
                </SimpleGrid>
                <Heading as="h3" size="md" mb={2}>Opening Hours</Heading>
                <OpeningHoursInfo label="Opening Hours" value={openingHoursToString(clubData.openingHours)} />
              </Box>

              {/* Reviews Section */}
              <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="md" border="1px" borderColor={borderColor}>
                <Flex justifyContent="space-between" alignItems="center" mb={4}>
                  <Heading as="h2" size="xl">Reviews</Heading>
                  <Button colorScheme="blue" onClick={() => setIsCreateReviewModalOpen(true)}>
                    Write a Review
                  </Button>
                </Flex>
                {clubData.reviews && clubData.reviews.length > 0 ? (
                  <ReviewComponent 
                    reviews={clubData.reviews} 
                    currentUserId={currentUserId}
                    onReviewUpdate={fetchClubData}
                  />
                ) : (
                  <Text>No reviews available yet.</Text>
                )}
              </Box>

              {/* Contact Section */}
              <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="md" border="1px" borderColor={borderColor}>
                <Heading as="h2" size="xl" mb={4}>Contact</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Icon as={PhoneIcon} color="orange.500" />
                      <Text>{clubData.contactInfo?.phone || 'N/A'}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={EmailIcon} color="orange.500" />
                      <Text>{clubData.contactInfo?.email || 'N/A'}</Text>
                    </HStack>
                  </VStack>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Follow us:</Text>
                    <HStack spacing={4}>
                      {clubData.socialMediaLinks?.facebook && (
                        <Button as="a" href={clubData.socialMediaLinks.facebook} target="_blank" rel="noopener noreferrer" leftIcon={<FaFacebook />} colorScheme="facebook" size="sm">
                          Facebook
                        </Button>
                      )}
                      {clubData.socialMediaLinks?.instagram && (
                        <Button as="a" href={clubData.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer" leftIcon={<FaInstagram />} colorScheme="pink" size="sm">
                          Instagram
                        </Button>
                      )}
                      {clubData.socialMediaLinks?.twitter && (
                        <Button as="a" href={clubData.socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer" leftIcon={<FaTwitter />} colorScheme="twitter" size="sm">
                          Twitter
                        </Button>
                      )}
                    </HStack>
                  </VStack>
                </SimpleGrid>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>

      {/* Floating "Reserve a Table" button */}
      {showFloatingButton && (
        <Box position="fixed" bottom="20px" right="20px" zIndex={10}>
          <Button
            colorScheme="orange"
            size="lg"
            onClick={() => setIsReservationModalOpen(true)}
            boxShadow="lg"
          >
            Reserve a Table
          </Button>
        </Box>
      )}

      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        clubName={clubData.displayName}
      />
      <CreateReviewModal
        isOpen={isCreateReviewModalOpen}
        onClose={() => setIsCreateReviewModalOpen(false)}
        onSubmit={handleCreateReview}
      />
    </Container>
  );
};

export default ClubProfile;