"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Badge,
  Divider,
  Flex,
  Image,
  SimpleGrid,
} from '@chakra-ui/react';
import { EditIcon, StarIcon } from '@chakra-ui/icons';

// Mock data - replace with actual API calls
const mockUserData = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://bit.ly/broken-link',
  reservations: [
    { id: '1', clubName: 'Neon Nights', date: '2024-10-05', time: '22:00', guests: 4, status: 'Confirmed' },
    { id: '2', clubName: 'Euphoria', date: '2024-10-12', time: '23:00', guests: 2, status: 'Pending' },
    { id: '3', clubName: 'Starlight', date: '2024-09-28', time: '21:00', guests: 6, status: 'Completed' },
  ],
  followedClubs: [
    { id: '1', name: 'Neon Nights', image: '/assets/images/club1.jpg' },
    { id: '2', name: 'Euphoria', image: '/assets/images/club2.jpg' },
    { id: '3', name: 'Starlight', image: '/assets/images/club3.jpg' },
  ],
  favoriteGenres: ['House', 'Techno', 'Hip-Hop'],
  recentActivity: [
    { id: '1', action: 'Followed', clubName: 'Neon Nights', date: '2024-09-30' },
    { id: '2', action: 'Reviewed', clubName: 'Euphoria', date: '2024-09-25' },
    { id: '3', action: 'Reserved', clubName: 'Starlight', date: '2024-09-20' },
  ]
};

const UserProfile = () => {
  const [userData, setUserData] = useState(mockUserData);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Fetch user data here
    // setUserData(fetchedData);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save updated user data here
    // API call to update the data
    setIsEditing(false);
    toast({
      title: "Profile updated.",
      description: "Your profile has been successfully updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'green';
      case 'Pending': return 'yellow';
      case 'Completed': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <Box width={'80vw'} py={12} bg="white" boxShadow="xl" borderRadius="xl" px={8}>
      <VStack spacing={8} align="stretch">
        <HStack spacing={8} align="flex-start">
          <Avatar size="2xl" name={userData.name} src={userData.avatar} />
          <VStack align="start" spacing={4} flex={1}>
            <Heading>{userData.name}</Heading>
            <Text>{userData.email}</Text>
            <Button leftIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          </VStack>
        </HStack>

        <Tabs>
          <TabList>
            <Tab>Dashboard</Tab>
            <Tab>My Reservations</Tab>
            <Tab>Followed Clubs</Tab>
            <Tab>Account Settings</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack align="stretch" spacing={6}>
                <Heading size="md">Dashboard</Heading>
                <Box>
                  <Heading size="sm" mb={2}>Favorite Genres</Heading>
                  <HStack>
                    {userData.favoriteGenres.map((genre, index) => (
                      <Badge key={index} colorScheme="purple">{genre}</Badge>
                    ))}
                  </HStack>
                </Box>
                <Box>
                  <Heading size="sm" mb={2}>Recent Activity</Heading>
                  <VStack align="stretch" spacing={2}>
                    {userData.recentActivity.map((activity) => (
                      <HStack key={activity.id} justify="space-between">
                        <Text>{activity.action} {activity.clubName}</Text>
                        <Text fontSize="sm" color="gray.500">{activity.date}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">My Reservations</Heading>
                {userData.reservations.map((reservation) => (
                  <Box key={reservation.id} p={4} borderWidth={1} borderRadius="md">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Heading size="sm">{reservation.clubName}</Heading>
                        <Text>Date: {reservation.date}</Text>
                        <Text>Time: {reservation.time}</Text>
                        <Text>Guests: {reservation.guests}</Text>
                      </VStack>
                      <Badge colorScheme={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Followed Clubs</Heading>
                <SimpleGrid columns={3} spacing={4}>
                  {userData.followedClubs.map((club) => (
                    <Box key={club.id} borderWidth={1} borderRadius="md" overflow="hidden">
                      <Image src={club.image} alt={club.name} objectFit="cover" h="150px" w="100%" />
                      <Box p={3}>
                        <Heading size="sm">{club.name}</Heading>
                        <Button size="sm" mt={2} colorScheme="blue">View Profile</Button>
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Account Settings</Heading>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    isReadOnly={!isEditing}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    isReadOnly={!isEditing}
                  />
                </FormControl>
                {isEditing && (
                  <Button colorScheme="blue" onClick={handleSave}>
                    Save Changes
                  </Button>
                )}
                <Divider />
                <Button colorScheme="red" variant="outline">
                  Change Password
                </Button>
                <Button colorScheme="orange" variant="outline">
                  Notification Settings
                </Button>
                <Button colorScheme="purple" variant="outline">
                  Privacy Settings
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default UserProfile;