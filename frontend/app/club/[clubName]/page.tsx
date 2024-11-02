"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Badge,
  Image,
  VStack,
  HStack,
  Skeleton,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Divider,
  IconButton,
  Tooltip,
  useDisclosure,
  ScaleFade,
  SlideFade,
  useToast
} from '@chakra-ui/react';
import { StarIcon, CheckIcon, PhoneIcon, EmailIcon, InfoIcon } from '@chakra-ui/icons';
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaClock, FaUsers } from 'react-icons/fa';
import { fetchClubByName, switchUsername2Id, addReview, fetchNormalUser, followClub, unfollowClub } from '@/app/lib/backendAPI';
import ReservationModal from '@/app/ui/reservationModel';
import LayoutDisplay from '@/app/ui/seatingLayout';
import { OpeningHoursInfo, openingHoursToString } from '@/app/ui/openHoursPicker';
import ReviewComponent from '@/app/ui/clubProfile/reviewComponent';
import CreateReviewModal from '@/app/ui/clubProfile/createReviewModal';
import { jwtDecode } from 'jwt-decode';
import { useRouter, usePathname } from 'next/navigation';
import Subtitle from '@/app/ui/subtitle';
import EventCarousel from '@/app/ui/eventCarousel';
import FollowButton from '@/app/ui/FollowButton';

interface ClubData {
  _id: string;
  displayName: string;
  images: string[];
  rating: number;
  reviews: string[];
  capacity: number;
  minAge: number;
  dressCode: string;
  genres: string[];
  tableLayout: any[];
  longDescription: string;
  description: string;
  features: string[];
  openingHours: any;
  contactInfo: {
    phone: string;
    email: string;
  };
  socialMediaLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  address: string;
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
  const [isFollowing, setIsFollowing] = useState(false);

  const layoutContainerRef = useRef<HTMLDivElement>(null);
  const bgGradient = useColorModeValue(
    'linear(to-b, orange.50, white)',
    'linear(to-b, gray.900, gray.800)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('orange.500', 'orange.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();

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
      await addReview(clubData._id, currentUserId, review);
      await fetchClubData();
      setIsCreateReviewModalOpen(false);
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const handleFollow = async (clubId: string) => {
    try {
      await followClub(currentUserId!, clubId);
      setIsFollowing(true);
    } catch (error: any) {
      console.error('Error following club:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to follow club',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleUnfollow = async (clubId: string) => {
    try {
      await unfollowClub(currentUserId!, clubId);
      setIsFollowing(false);
    } catch (error: any) {
      console.error('Error unfollowing club:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to unfollow club',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (currentUserId && clubData) {
        try {
          const user = await fetchNormalUser(currentUserId);
          setIsFollowing(user.clubInterests.includes(clubData._id));
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      }
    };
  
    checkFollowStatus();
  }, [currentUserId, clubData]);

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
      <Container maxW="7xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Skeleton height="500px" borderRadius="xl" />
          <VStack align="stretch" spacing={4}>
            <Skeleton height="60px" />
            <Skeleton height="40px" />
            <Skeleton height="200px" />
          </VStack>
        </SimpleGrid>
      </Container>
    );
  }

  if (error) return (
    <Box textAlign="center" py={20}>
      <Icon as={InfoIcon} w={12} h={12} color="red.500" mb={4} />
      <Heading size="lg" mb={2}>Error Loading Club Profile</Heading>
      <Text color={textColor}>{error}</Text>
    </Box>
  );

  if (!clubData) return (
    <Box textAlign="center" py={20}>
      <Icon as={InfoIcon} w={12} h={12} color="gray.500" mb={4} />
      <Heading size="lg">No Club Data Available</Heading>
    </Box>
  );

  return (
    <Box bgGradient={bgGradient}>
      <Container maxW="7xl" py={12}>
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <Box
            position="relative"
            height="500px"
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="2xl"
          >
            <Image
              src={clubData.images !== null ? clubData.images[0] : "/default-club.jpeg"}
              alt={clubData.displayName}
              objectFit="cover"
              objectPosition="bottom"
              w="100%"
              h="100%"
              transition="transform 0.3s ease"
              _hover={{ transform: 'scale(1.05)' }}
            />
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              background="linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)"
              p={8}
              color="white"
            >
              <SlideFade in={true} offsetY="20px">
                <Flex
                  justifyContent="space-between"
                  alignItems="flex-end"
                  flexWrap="wrap"
                  gap={4}
                >
                  <Box>
                    <Heading as="h1" size="2xl" mb={3}>
                      {clubData.displayName}
                    </Heading>
                    <HStack spacing={4} mb={3}>
                      <Badge
                        colorScheme="orange"
                        fontSize="md"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        Nightclub
                      </Badge>
                      <HStack>
                        {Array(5).fill('').map((_, i) => (
                          <StarIcon
                            key={i}
                            color={i < (clubData.rating || 0) ? highlightColor : 'gray.300'}
                            w={5}
                            h={5}
                          />
                        ))}
                        <Text fontSize="lg">
                          ({clubData.reviews?.length || 0} reviews)
                        </Text>
                      </HStack>
                    </HStack>
                    <HStack spacing={4}>
                      <Icon as={FaMapMarkerAlt} />
                      <Subtitle>{clubData.address}</Subtitle>
                    </HStack>
                  </Box>
                  <HStack spacing={4}> {/* Add this HStack */}
                    {currentUserId && (
                      <FollowButton
                        clubId={clubData._id}
                        isFollowing={isFollowing}
                        onFollow={handleFollow}
                        onUnfollow={handleUnfollow}
                      />
                    )}
                  <ScaleFade initialScale={0.9} in={true}>
                    <Button
                      colorScheme="orange"
                      size="lg"
                      onClick={() => router.push(`${pathname}/reservation`)}
                      boxShadow="dark-lg"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'xl'
                      }}
                      _active={{
                        transform: 'translateY(0)',
                        boxShadow: 'md'
                      }}
                    >
                      Reserve a Table
                    </Button>
                  </ScaleFade>
                  </HStack>
                </Flex>
              </SlideFade>
            </Box>
          </Box>

          {/* Main Content */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {/* Left Column */}
            <VStack align="stretch" spacing={6}>
              {/* Quick Info Card */}
              <Box
                bg={cardBg}
                p={6}
                borderRadius="xl"
                boxShadow="xl"
                border="1px"
                borderColor={borderColor}
                transition="transform 0.2s"
                _hover={{ transform: 'translateY(-2px)' }}
              >
                <Heading as="h3" size="md" mb={4} color={highlightColor}>
                  Quick Info
                </Heading>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FaUsers} color={highlightColor} />
                      <Text fontWeight="bold">Capacity</Text>
                    </HStack>
                    <Text>{clubData.capacity} people</Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={InfoIcon} color={highlightColor} />
                      <Text fontWeight="bold">Minimum Age</Text>
                    </HStack>
                    <Badge colorScheme="purple">{clubData.minAge}+</Badge>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={FaClock} color={highlightColor} />
                      <Text fontWeight="bold">Dress Code</Text>
                    </HStack>
                    <Badge colorScheme="blue">{clubData.dressCode}</Badge>
                  </HStack>
                </VStack>
              </Box>

              {/* Music Genres Card */}
              <Box
                bg={cardBg}
                p={6}
                borderRadius="xl"
                boxShadow="xl"
                border="1px"
                borderColor={borderColor}
                transition="transform 0.2s"
                _hover={{ transform: 'translateY(-2px)' }}
              >
                <Heading as="h3" size="md" mb={4} color={highlightColor}>
                  Music Genres
                </Heading>
                <SimpleGrid columns={2} spacing={2}>
                  {clubData.genres?.map((genre: string) => (
                    <Badge
                      key={genre}
                      colorScheme="purple"
                      fontSize="sm"
                      p={2}
                      borderRadius="full"
                      textAlign="center"
                    >
                      {genre}
                    </Badge>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Seating Layout Card */}
              {clubData.tableLayout[0] !== undefined && clubData.tableLayout[0].tableLayout !== undefined && (
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="xl"
                  boxShadow="xl"
                  border="1px"
                  borderColor={borderColor}
                  transition="transform 0.2s"
                  _hover={{ transform: 'translateY(-2px)' }}
                >
                  <Heading as="h3" size="md" mb={4} color={highlightColor}>
                    Seating Layout
                  </Heading>
                  <Box ref={layoutContainerRef} height="300px" width="100%">
                    <LayoutDisplay 
                      tableList={clubData.tableLayout[0].tableLayout.tables || null}
                      containerWidth={layoutContainerSize.width}
                      containerHeight={layoutContainerSize.height}
                    />
                  </Box>
                </Box>
              )}

                {/* Contact Section */}
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="xl"
                  boxShadow="xl"
                  border="1px"
                  borderColor={borderColor}
                  transition="transform 0.2s"
                  _hover={{ transform: 'translateY(-2px)' }}
                >
                  <Heading as="h3" size="md" mb={4} color={highlightColor}>
                    Contact
                  </Heading>
                  <VStack align="stretch" spacing={4}>
                    <VStack align="stretch" spacing={3}>
                      <HStack spacing={3}>
                        <Icon as={PhoneIcon} color={highlightColor} w={5} h={5} />
                        <Text fontSize="md" fontWeight="medium" noOfLines={1}>
                          {clubData.contactInfo?.phone || 'N/A'}
                        </Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Icon as={EmailIcon} color={highlightColor} w={5} h={5} />
                        <Text fontSize="md" fontWeight="medium" noOfLines={1}>
                          {clubData.contactInfo?.email || 'N/A'}
                        </Text>
                      </HStack>
                    </VStack>
                    <Divider />
                    <VStack align="stretch" spacing={2}>
                      <Text fontWeight="medium" fontSize="sm">Follow us:</Text>
                      <HStack spacing={2} justify="start">
                        {clubData.socialMediaLinks?.facebook && (
                          <IconButton
                            as="a"
                            href={clubData.socialMediaLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            icon={<FaFacebook />}
                            colorScheme="facebook"
                            size="sm"
                            borderRadius="full"
                          />
                        )}
                        {clubData.socialMediaLinks?.instagram && (
                          <IconButton
                            as="a"
                            href={clubData.socialMediaLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            icon={<FaInstagram />}
                            colorScheme="pink"
                            size="sm"
                            borderRadius="full"
                          />
                        )}
                        {clubData.socialMediaLinks?.twitter && (
                          <IconButton
                            as="a"
                            href={clubData.socialMediaLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter"
                            icon={<FaTwitter />}
                            colorScheme="twitter"
                            size="sm"
                            borderRadius="full"
                          />
                        )}
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>
            </VStack>
            
            {/* Middle and Right Columns */}
            <Box gridColumn={{ base: "auto", md: "span 2" }}>
              <VStack align="stretch" spacing={8}>
                {/* About Section */}
                <Box
                  _hover={{ transform: 'translateY(-2px)' }}
                  bg={cardBg}
                  p={8}
                  borderRadius="xl"
                  boxShadow="xl"
                  border="1px"
                  borderColor={borderColor}
                >
                  <Heading as="h2" size="xl" mb={6} color={highlightColor}>
                    About {clubData.displayName}
                  </Heading>
                  <Text mb={6} fontSize="lg" lineHeight="tall">
                    {clubData.longDescription || clubData.description}
                  </Text>
                  <Heading as="h3" size="md" mb={4} color={highlightColor}>
                    Features
                  </Heading>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={6}>
                    {clubData.features?.map((feature: string) => (
                      <HStack
                        key={feature}
                        bg={useColorModeValue('gray.50', 'gray.700')}
                        p={3}
                        borderRadius="lg"
                      >
                        <Icon as={CheckIcon} color="green.500" />
                        <Text>{feature}</Text>
                      </HStack>
                    ))}
                  </SimpleGrid>
                  <OpeningHoursInfo 
                    label="Opening Hours"
                    value={openingHoursToString(clubData.openingHours)}
                  />
                </Box>

                {/* Events Section */}
                <Box
                  _hover={{ transform: 'translateY(-2px)' }}
                  bg={cardBg}
                  borderRadius="xl"
                  boxShadow="xl"
                  border="1px"
                  borderColor={borderColor}
                >
                  <EventCarousel clubId={clubData._id} />
                </Box>

                {/* Reviews Section */}
                <Box
                  _hover={{ transform: 'translateY(-2px)' }}
                  bg={cardBg}
                  p={8}
                  borderRadius="xl"
                  boxShadow="xl"
                  border="1px"
                  borderColor={borderColor}
                >
                  <Flex justifyContent="space-between" alignItems="center" mb={6}>
                    <Heading as="h2" size="xl" color={highlightColor}>
                      Reviews
                    </Heading>
                    <Button
                      colorScheme="orange"
                      onClick={() => setIsCreateReviewModalOpen(true)}
                      leftIcon={<StarIcon />}
                    >
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
                    <Text textAlign="center" py={8} color={textColor}>
                      No reviews available yet. Be the first to review!
                    </Text>
                  )}
                </Box>


              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>

        {/* Modals */}
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
      {/* Floating Button */}
      {/*<ScaleFade in={showFloatingButton}>
        <Box
          position="fixed"
          right="10vw"
          zIndex={10}
        >
          <Button
            colorScheme="orange"
            size="lg"
            onClick={() => router.push(`${pathname}/reservation`)}
            boxShadow="dark-lg"
            borderRadius="full"
            px={8}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '2xl'
            }}
          >
            Reserve Now
          </Button>
        </Box>
      </ScaleFade>*/}
    </Box>
  );
};

export default ClubProfile;