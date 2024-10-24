"use client"

import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Avatar,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  useColorModeValue,
  Icon,
  Image,
  Button,
  Input,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { MdEmail, MdPhone, MdCalendarToday, MdLocationOn, MdEdit, MdSave, MdClose } from 'react-icons/md';
import { fetchNormalUser, switchUsername2Id, updateNormalUser } from '../lib/backendAPI';
import { getCurrentUser } from '../lib/userStatus';
import SplashScreen from '../ui/splashscreen';

interface UserData {
  username: string;
  picturePath: string;
  firstName: string;
  lastName: string;
  bio: string;
  createdAt: string;
  loyaltyPoints: number;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
}

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedUser, setEditedUser] = useState<UserData | null>(null);

  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tabBgColor = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          throw new Error('No current user found');
        }
        const userId = await switchUsername2Id(currentUser.username);
        const userData = await fetchNormalUser(userId);
        setUser(userData);
      } catch (err: unknown) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedUser(user);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSave = async () => {
    if (!editedUser) return;
    try {
      const updatedUser = await updateNormalUser(await switchUsername2Id(user?.username || ""), editedUser);
      setUser(updatedUser);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: "Error updating profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) return (
    <Box marginY={'30vh'}>
      <SplashScreen />
    </Box>
  );
  if (error) return <Text color="red.500">Error: {error}</Text>;
  if (!user) return <Text>No user data available</Text>;

  return (
    <Box width="100%" maxWidth="1200px" mx="auto" px={4} my={20}>
      {/* Cover Photo */}
      <Box position="relative" h="300px" mb={16}>
        <Image
          src="profilePage.jpeg"
          alt="Cover Photo"
          objectFit="cover"
          w="100%"
          h="100%"
          borderRadius="lg"
        />
        <Avatar
          size="2xl"
          name={user?.username}
          src={user?.picturePath}
          position="absolute"
          bottom="-48px"
          left="50%"
          transform="translateX(-50%)"
          border="4px solid white"
        />
      </Box>

      <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
        {/* User Name and Username */}
        <Box bg={bgColor} borderRadius="lg" overflow="hidden" boxShadow="md" p={6} flex={{ md: 1 }}>
          <VStack spacing={2} align="left">
            {isEditing ? (
              <>
                <Input
                  name="firstName"
                  value={editedUser?.firstName || ''}
                  onChange={handleInputChange}
                  placeholder="First Name"
                />
                <Input
                  name="lastName"
                  value={editedUser?.lastName || ''}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                />
              </>
            ) : (
              <Heading as="h2" size="xl">{`${user?.firstName} ${user?.lastName}`}</Heading>
            )}
            <Text color="gray.500" fontSize="lg">@{user?.username}</Text>
          </VStack>
        </Box>

        {/* User Info */}
        <Box bg={bgColor} borderRadius="lg" overflow="hidden" boxShadow="md" flex={{ md: 2 }}>
          <VStack align="stretch" spacing={6} p={6}>
            {isEditing ? (
              <Textarea
                name="bio"
                value={editedUser?.bio || ''}
                onChange={handleInputChange}
                placeholder="Bio"
              />
            ) : (
              <Text fontSize="lg">{user?.bio}</Text>
            )}
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={6}>
              <Stat>
                <StatLabel fontSize="md">Member Since</StatLabel>
                <StatNumber>{formatDate(user?.createdAt || '')}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel fontSize="md">Loyalty Points</StatLabel>
                <StatNumber>{user?.loyaltyPoints}</StatNumber>
              </Stat>
            </SimpleGrid>
            <Divider />
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <HStack spacing={4}>
                <Icon as={MdEmail} color="gray.500" boxSize={5} />
                  <Text>{user?.email}</Text>
              </HStack>
              <HStack spacing={4}>
                <Icon as={MdPhone} color="gray.500" boxSize={5} />
                  <Text>{user?.phoneNumber}</Text>
              </HStack>
              <HStack spacing={4}>
                <Icon as={MdCalendarToday} color="gray.500" boxSize={5} />
                  <Text>Born on {formatDate(user?.dateOfBirth || '')}</Text>
              </HStack>
              <HStack spacing={4}>
                <Icon as={MdLocationOn} color="gray.500" boxSize={5} />
                <Text>Athens, Greece</Text>
              </HStack>
            </SimpleGrid>
          </VStack>
        </Box>
      </Flex>
      
      {/* Edit/Save Button */}
      <Box mt={6} textAlign="right">
        {isEditing ? (
          <>
            <Button leftIcon={<MdSave />} colorScheme="green" onClick={handleSave} mr={2}>
              Save Changes
            </Button>
            <Button leftIcon={<MdClose />} colorScheme="red" onClick={handleEditToggle}>
              Cancel
            </Button>
          </>
        ) : (
          <Button leftIcon={<MdEdit />} colorScheme="blue" onClick={handleEditToggle}>
            Edit Profile
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default UserProfilePage;