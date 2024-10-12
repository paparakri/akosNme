"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import SplashScreen from '@/app/ui/splashscreen';
import { jwtDecode } from 'jwt-decode';
import { fetchClubByName, updateClub } from '@/app/lib/backendAPI';
import { DragDropSeatingCanvas } from '@/app/ui/dragDropSeating';
import ClubOnboarding from '@/app/ui/clubOnBoarding';

// Mock data - replace with actual API calls
const mockClubData = {
  username: 'club123',
  displayName: 'Neon Nights',
  description: 'The hottest club in Athens',
  location: 'Athens, Greece',
  rating: 4.5,
  formattedPrice: 50,
  features: ['DJ', 'VIP Area', 'Cocktail Bar'],
  reservations: [
    { date: '2024-09-25', count: 15 },
    { date: '2024-09-26', count: 20 },
    { date: '2024-09-27', count: 25 },
    { date: '2024-09-28', count: 28 },
    { date: '2024-09-29', count: 22 },
    { date: '2024-09-30', count: 18 },
    { date: '2024-10-01', count: 28 },
  ]
};

interface ClubProps {
  _id: string,
  username: string,
  displayName: string,
  description: string,
  formattedPrice: number,
  reviewCount: number,
  rating: number,
  location: string,
  features: string[],
  reservations: { date: string; count: number }[],
  images: string[],
  address: string,
  openingHours: Object,
  genres: string[],
  minAge: number,
  capacity: number,
  dressCode: string,
  contactInfo: Object,
  socialMediaLinks: Object,
};

interface SimpleBarChartProps {
  data: { date: string; count: number }[];
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(item => item.count));
  
  return (
    <VStack spacing={2} align="stretch" height="300px">
      {data.map((item, index) => (
        <HStack key={index} spacing={4}>
          <Text width="100px" fontSize="sm">{item.date}</Text>
          <Box 
            height="20px" 
            bg="orange.400" 
            width={`${(item.count / maxCount) * 100}%`}
          />
          <Text fontSize="sm">{item.count}</Text>
        </HStack>
      ))}
    </VStack>
  );
};

const ClubOwnerDashboard = () => {
  const [clubData, setClubData] = useState<ClubProps>();
  const [isEditing, setIsEditing] = useState(false);
  const [isClub, setIsClub] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if(localStorage.getItem('userType') == 'club'){
      setIsClub(true);
    }
    const token = localStorage.getItem('userToken');
    let fetchedData;
    if(token) {
      const decoded = jwtDecode<{ username: string }>(token);
      if(decoded.username){
        fetchClubByName(decoded.username).then( (data) => {
          setClubData(data);
          console.log(data);
          setIsLoading(false);

          const firstEnterFields = ['description', 'address', 'openingHours', 'genres', 'minAge', 'capacity', 'features', 'dressCode', 'contactInfo', 'socialMediaLinks', 'images']
          const isComplete = firstEnterFields.every(field => data[field] && data[field].toString().trim() !== '');
          setOnboardingComplete(isComplete);
        });
      } else{
        console.error("No username in jsonwebtoken.");
      }
    } else {
      console.error("No jsonwebtoken saved in local storage.");
    }
  }, []);

  const handleInputChange = (e: { target: { name: string; value: string; }; }) => {
    const { name, value } = e.target;
    setClubData(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleSave = () => {
    // Save updated club data here
    // API call to update the data
    setIsEditing(false);
    toast({
      title: "Profile updated.",
      description: "Your club profile has been successfully updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if(isLoading){
    return <Box alignItems={'right'}>
        <SplashScreen/>
      </Box>;
  }

  return (
    clubData ? (
      onboardingComplete ? (
        <Box p={8}>
          <Heading mb={6}>Club Owner Dashboard</Heading>
          <Tabs>
            <TabList>
              <Tab>Profile</Tab>
              <Tab>Analytics</Tab>
              <Tab>Reservations</Tab>
              <Tab>Seating Outline</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack align="start" spacing={4}>
                  <Flex justifyContent="space-between" width="100%">
                    <Heading size="lg">{clubData.displayName}</Heading>
                    <Button onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </Flex>
                  {isEditing ? (
                    <VStack align="start" spacing={4} width="100%">
                      <FormControl>
                        <FormLabel>Club Name</FormLabel>
                        <Input name="displayName" value={clubData.displayName} onChange={handleInputChange} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea name="description" value={clubData.description} onChange={handleInputChange} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Location</FormLabel>
                        <Input name="location" value={clubData.location} onChange={handleInputChange} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Price (€ per min)</FormLabel>
                        <NumberInput min={0}>
                          <NumberInputField name="formattedPrice" value={clubData.formattedPrice} onChange={handleInputChange} />
                        </NumberInput>
                      </FormControl>
                      <Button colorScheme="orange" onClick={handleSave}>Save Changes</Button>
                    </VStack>
                  ) : (
                    <>
                      <Text>{clubData.description}</Text>
                      <HStack>
                        <Text fontWeight="bold">Location:</Text>
                        <Text>{clubData.location}</Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="bold">Rating:</Text>
                        <HStack>
                          {Array(5).fill('').map((_, i) => (
                            <StarIcon key={i} color={i < clubData.rating ? "orange.500" : "gray.300"} />
                          ))}
                        </HStack>
                      </HStack>
                      <HStack>
                        <Text fontWeight="bold">Price:</Text>
                        <Text>€{clubData.formattedPrice} / min</Text>
                      </HStack>
                      <Box>
                        <Text fontWeight="bold">Features:</Text>
                        <HStack mt={2}>
                          {/*clubData.features.map((feature, index) => (
                            <Badge key={index} colorScheme="green">{feature}</Badge>
                          ))*/}
                        </HStack>
                      </Box>
                    </>
                  )}
                </VStack>
              </TabPanel>
              <TabPanel>
                <Heading size="md" mb={4}>Reservation Analytics</Heading>
                {/*<SimpleBarChart data={clubData.reservations} />*/}
              </TabPanel>
              <TabPanel>
                <Heading size="md" mb={4}>Recent Reservations</Heading>
                <VStack align="start" spacing={4}>
                  {/*clubData.reservations.map((reservation, index) => (
                    <Box key={index} p={4} borderWidth={1} borderRadius="md" width="100%">
                      <Text fontWeight="bold">Date: {reservation.date}</Text>
                      <Text>Number of Reservations: {reservation.count}</Text>
                    </Box>
                  ))*/}
                </VStack>
              </TabPanel>
              <TabPanel>
                <DragDropSeatingCanvas id={clubData._id}/>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      ) : (
        <ClubOnboarding
          clubData={clubData}
          setClubData={setClubData}
          onComplete={(updatedData: React.SetStateAction<ClubProps | undefined>) => {
            // Here you would typically make an API call to update the club data
            updateClub(clubData._id, updatedData).then(() => setOnboardingComplete(true));
            setClubData(updatedData);
          }}
        />
      )
      ) : (<Text>Not signed in as club owner.</Text>)
  );
};

export default ClubOwnerDashboard;