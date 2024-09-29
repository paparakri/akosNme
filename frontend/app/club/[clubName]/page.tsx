"use client"
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  Button,
  Badge,
  Image,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { fetchClubByName } from '../../lib/backendAPI';
import ReservationModal from '@/app/ui/reservationModel';
import LayoutDisplay from '@/app/ui/seatingLayout';

interface ClubProfileProps {
  clubName: string;
}

const ClubProfile: React.FC<{ params: ClubProfileProps }> = ({ params }) => {
  const [clubData, setClubData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const router = useRouter();
  const username = params.clubName;

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchClubByName(username);
        setClubData(data);
      } catch (error) {
        console.error("Error fetching club data:", error);
      } finally {
        setIsLoading(false);
        console.log(clubData);
      }
    };

    fetchClubData();
  }, [username]);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (!clubData) {
    return <Box>Club not found</Box>;
  }

  return (
    <Container maxW="5xl" py={12}>
      <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
        <Box flex={1}>
          <Image
            src={clubData.imageUrl || '/assets/images/default-club.jpg'}
            alt={clubData.displayName}
            borderRadius="lg"
            objectFit="cover"
            w="100%"
            h={{ base: '200px', md: '300px' }}
          />
        </Box>
        <VStack flex={1} align="start" spacing={4}>
          <Heading as="h1" size="2xl">
            {clubData.displayName}
          </Heading>
          <HStack>
            <Badge colorScheme="orange">Club</Badge>
            <Text color="gray.500">{clubData.location}</Text>
          </HStack>
          <HStack>
            {Array(5)
              .fill('')
              .map((_, i) => (
                <StarIcon
                  key={i}
                  color={i < clubData.rating ? 'orange.500' : 'gray.300'}
                />
              ))}
            <Text>({clubData.reviews.length} reviews)</Text>
          </HStack>
          <Text fontSize="xl" fontWeight="bold">
            €{clubData.formattedPrice} / min
          </Text>
          <Text>{clubData.description}</Text>
          <Button
            colorScheme="orange"
            size="lg"
            onClick={() => setIsReservationModalOpen(true)}
          >
            Reserve a Table
          </Button>
        </VStack>
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
        <Stack mt={12} spacing={8}>
          <Box>
            <Heading as="h2" size="xl" mb={4}>
              About {clubData.displayName}
            </Heading>
            <Text>{clubData.longDescription || 'No detailed description available.'}</Text>
          </Box>

          <Box>
            <Heading as="h2" size="xl" mb={4}>
              Features
            </Heading>
            <HStack flexWrap="wrap" spacing={2}>
              {clubData.features?.map((feature: string, index: number) => (
                <Badge key={index} colorScheme="green" fontSize="md" py={1} px={2}>
                  {feature}
                </Badge>
              ))}
            </HStack>
          </Box>

          <Box>
            <Heading as="h2" size="xl" mb={4}>
              Location
            </Heading>
            <Text>{clubData.fullAddress || 'Address not available'}</Text>
            {/* You can add a map component here */}
          </Box>

          <Box>
            <Heading as="h2" size="xl" mb={4}>
              Reviews
            </Heading>
            {/* Add a reviews component here */}
            <Text>Reviews component to be implemented</Text>
          </Box>
        </Stack>
        <LayoutDisplay tableList={clubData.tableLayout[0].tableLayout.tables}/>
      </Flex>
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        clubName={clubData.clubName}
      />
    </Container>
  );
};

export default ClubProfile;