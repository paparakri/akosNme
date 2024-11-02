'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useColorModeValue,
  Divider,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  Checkbox,
  CheckboxGroup,
  Modal,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  IconButton,
  Progress,
  useToast
} from '@chakra-ui/react';
import { jwtDecode } from 'jwt-decode';
import SplashScreen from '../splashscreen';
import { fetchClubByName, updateClub, uploadImage } from '@/app/lib/backendAPI';
import { OpeningHoursInfo, OpeningHoursPicker, openingHoursToString } from '../openHoursPicker';
import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from '@chakra-ui/icons';
import LocationSelector from '../locationSelector';

type ImageFile = {
  file: File;
  preview: string;
};

type ContactInfo = {
  email: string;
  phone: string;
};

type SocialMediaLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
};

type ClubFormData = {
  _id: string,
  username: string;
  email: string;
  displayName: string;
  description: string;
  address: string;
  location: Object;
  capacity: number | string;
  openingHours: {
    [key: string]: {
      isOpen: boolean;
      open: string;
      close: string;
    };
  };
  features: string[];
  genres: string[];
  minAge: number | string;
  dressCode: string;
  contactInfo: ContactInfo;
  socialMediaLinks: SocialMediaLinks;
  images: FileList | null;
  password: string;
};

const ProfileInfo = ({ label, value }: { label: string; value: any }) => (
  <HStack justifyContent="space-between" w="full">
    <Text fontWeight="bold">{label}:</Text>
    <Text>{value}</Text>
  </HStack>
);

const ProfilePage = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [clubData, setClubData] = useState<ClubFormData>({
    _id: '',
    location: {},
    username: 'clubuser123',
    email: 'club@example.com',
    displayName: 'Awesome Club',
    description: 'The best club in town with amazing music and atmosphere.',
    address: '123 Party Street, Clubville, CV 12345',
    capacity: 500,
    openingHours: {
        Monday: { isOpen: true, open: '09:00', close: '17:00' },
        Tuesday: { isOpen: true, open: '09:00', close: '17:00' },
        Wednesday: { isOpen: true, open: '09:00', close: '17:00' },
        Thursday: { isOpen: true, open: '09:00', close: '17:00' },
        Friday: { isOpen: true, open: '09:00', close: '17:00' },
        Saturday: { isOpen: false, open: '00:00', close: '00:00' },
        Sunday: { isOpen: false, open: '00:00', close: '00:00' },
    },
    features: ['Dance Floor', 'VIP Area', 'Smoking Area'],
    genres: ['House', 'Techno', 'Hip-Hop'],
    minAge: 21,
    dressCode: 'Smart Casual',
    contactInfo: {
      email: 'info@awesomeclub.com',
      phone: '+1 (555) 123-4567',
    },
    socialMediaLinks: {
      facebook: 'https://facebook.com/awesomeclub',
      instagram: 'https://instagram.com/awesomeclub',
      twitter: 'https://twitter.com/awesomeclub',
    },
    images: null,
    password: '',
  });


  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if(token) {
      const decoded = jwtDecode<{ username: string }>(token);
      if(decoded.username){
        console.log("Decoded username: " + decoded.username);
        fetchClubByName(decoded.username).then(data => {
            setClubData(data);
            setIsLoading(false);
            console.log(data);
        });
      }
    }

    console.log("Use Effect print: "); console.log(openingHoursToString(clubData.openingHours));
  }, []);


  const ImagePreviews = () => (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
      {selectedImages.map((image, index) => (
        <Box key={index} position="relative">
          <Image
            src={image.preview}
            alt={`Preview ${index + 1}`}
            boxSize="150px"
            objectFit="cover"
            borderRadius="md"
          />
          <IconButton
            aria-label="Remove image"
            icon={<CloseIcon />}
            size="sm"
            position="absolute"
            top={2}
            right={2}
            onClick={() => {
              URL.revokeObjectURL(image.preview);
              setSelectedImages(prev => prev.filter((_, i) => i !== index));
            }}
          />
        </Box>
      ))}
    </SimpleGrid>
  );


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Revoke existing preview URLs
      selectedImages.forEach(image => URL.revokeObjectURL(image.preview));
  
      // Create new image files array with previews
      const newImages: ImageFile[] = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setSelectedImages(newImages);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    valueName?: string
  ) => {
    if (typeof e === 'string' && valueName) {
      // This is for NumberInput
      setClubData(prevData => ({
        ...prevData,
        [valueName]: e,
      }));
    } else if (typeof e === 'object' && 'target' in e) {
      // This is for regular inputs
      const { name, value } = e.target;
      setClubData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClubData(prevData => ({
      ...prevData,
      contactInfo: {
        ...prevData.contactInfo,
        [name]: value,
      },
    }));
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClubData(prevData => ({
      ...prevData,
      socialMediaLinks: {
        ...prevData.socialMediaLinks,
        [name]: value,
      },
    }));
  };

  const handleFeaturesChange = (newFeatures: string[]) => {
    setClubData(prevData => ({
      ...prevData,
      features: newFeatures,
    }));
  };

  const handleGenresChange = (newGenres: string[]) => {
    setClubData(prevData => ({
      ...prevData,
      genres: newGenres,
    }));
  };


  const handleOpeningHoursChange = (newOpeningHours: any) => {
    setClubData(prevData => ({
      ...prevData,
      openingHours: newOpeningHours,
    }));
  };


  const toast = useToast();

  const handleSave = async () => {
    try {
      setUploadProgress(0);
      
      // First, upload all images if any are selected
      const uploadedImageUrls: string[] = [];
      
      if (selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          const image = selectedImages[i];
          // Assuming you have an uploadImage function that returns the URL
          const imageUrl = (await uploadImage(image.file, 'profilePics')).downloadURL;
          uploadedImageUrls.push(imageUrl);
          
          // Update progress
          setUploadProgress(((i + 1) / selectedImages.length) * 100);
        }
      }

      // Update club data with new image URLs
      const updatedClubData = {
        ...clubData,
        images: uploadedImageUrls, // Add this field to your club data model
      };

      // Update club information
      const res = await updateClub(clubData._id, updatedClubData);
      console.log('Updated club data:', res);

      // Show success message
      toast({
        title: "Profile updated",
        description: "Your club profile has been successfully updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "There was an error updating your profile. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return !isLoading ? (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Club Profile
      </Text>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
        {/* Profile Summary */}
        <Box
          w={{ base: 'full', lg: '30%' }}
          bg={bgColor}
          p={6}
          borderRadius="lg"
          boxShadow="xl"
          border="1px"
          borderColor={borderColor}
        >
          <VStack spacing={4} align="center">
            <Avatar size="2xl" name={clubData.displayName} src="/path-to-club-logo.jpg" />
            <Text fontSize="xl" fontWeight="bold">
              {clubData.displayName}
            </Text>
            <Text color="gray.500">{clubData.address}</Text>
          </VStack>
          <Divider my={6} />
          <VStack spacing={3} align="stretch">
            <ProfileInfo label="Email" value={clubData.contactInfo.email} />
            <ProfileInfo label="Phone" value={clubData.contactInfo.phone} />
            <ProfileInfo label="Capacity" value={String(clubData.capacity)} />
            <OpeningHoursInfo label="Opening Hours" value={openingHoursToString(clubData.openingHours)} />
            <ProfileInfo label="Min Age" value={String(clubData.minAge)} />
            <ProfileInfo label="Dress Code" value={clubData.dressCode} />
          </VStack>
        </Box>

        {/* Profile Details & Edit Form */}
        <Box
          w={{ base: 'full', lg: '70%' }}
          bg={bgColor}
          p={6}
          borderRadius="lg"
          boxShadow="xl"
          border="1px"
          borderColor={borderColor}
        >
          <Text fontSize="xl" fontWeight="bold" mb={6}>
            Edit Club Profile
          </Text>
          <VStack spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Club Name</FormLabel>
                <Input name="displayName" value={clubData.displayName} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input name="username" value={clubData.username} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input name="email" value={clubData.email} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Location</FormLabel>
                <LocationSelector formData={clubData} setFormData={setClubData} />
              </FormControl>
              <FormControl>
                <FormLabel>Capacity</FormLabel>
                <NumberInput 
                    min={0} 
                    name="capacity"
                    value={clubData.capacity}
                    onChange={(valueString) => handleInputChange(valueString, 'capacity')}
                >
                    <NumberInputField/>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Open Hours</FormLabel>
                <Button onClick={onOpen}>Edit Weekly Hours</Button>
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                    <ModalHeader>Choose Open Hours</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <OpeningHoursPicker value={clubData.openingHours} onChange={handleOpeningHoursChange}/>
                    </ModalBody>
                    </ModalContent>
                </Modal>
                
              </FormControl>
              <FormControl>
                <FormLabel>Min Age</FormLabel>
                <NumberInput
                    min={18}
                    name='minAge'
                    value={clubData.minAge}
                    onChange={(valueString) => handleInputChange(valueString, 'minAge')}
                >
                    <NumberInputField
                    name="minAge"
                    value={clubData.minAge}
                    onChange={(valueString) => handleInputChange(valueString, 'minAge')}
                    />
                </NumberInput>
            </FormControl>
              <FormControl>
                <FormLabel>Dress Code</FormLabel>
                <Input name="dressCode" value={clubData.dressCode} onChange={handleInputChange} />
              </FormControl>
            </SimpleGrid>
            
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea name="description" value={clubData.description} onChange={handleInputChange} rows={4} />
            </FormControl>
            
            <FormControl>
              <FormLabel>Features</FormLabel>
              <CheckboxGroup colorScheme="orange" value={clubData.features} onChange={handleFeaturesChange}>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                  <Checkbox value="Dance Floor">Dance Floor</Checkbox>
                  <Checkbox value="VIP Area">VIP Area</Checkbox>
                  <Checkbox value="Smoking Area">Smoking Area</Checkbox>
                  <Checkbox value="Live Music">Live Music</Checkbox>
                  <Checkbox value="Karaoke">Karaoke</Checkbox>
                  <Checkbox value="Outdoor Seating">Outdoor Seating</Checkbox>
                </SimpleGrid>
              </CheckboxGroup>
            </FormControl>
            
            <FormControl>
              <FormLabel>Genres</FormLabel>
              <CheckboxGroup colorScheme="orange" value={clubData.genres} onChange={handleGenresChange}>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                  <Checkbox value="House">House</Checkbox>
                  <Checkbox value="Techno">Techno</Checkbox>
                  <Checkbox value="Hip-Hop">Hip-Hop</Checkbox>
                  <Checkbox value="R&B">R&B</Checkbox>
                  <Checkbox value="Latin">Latin</Checkbox>
                  <Checkbox value="Pop">Pop</Checkbox>
                </SimpleGrid>
              </CheckboxGroup>
            </FormControl>
            
            <Divider />
            
            <Text fontSize="lg" fontWeight="bold">Contact Information</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Contact Email</FormLabel>
                <Input name="email" value={clubData.contactInfo.email} onChange={handleContactInfoChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Contact Phone</FormLabel>
                <Input name="phone" value={clubData.contactInfo.phone} onChange={handleContactInfoChange} />
              </FormControl>
            </SimpleGrid>
            
            <Text fontSize="lg" fontWeight="bold">Social Media Links</Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <FormControl>
                <FormLabel>Facebook</FormLabel>
                <Input name="facebook" value={clubData.socialMediaLinks.facebook} onChange={handleSocialMediaChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Instagram</FormLabel>
                <Input name="instagram" value={clubData.socialMediaLinks.instagram} onChange={handleSocialMediaChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Twitter</FormLabel>
                <Input name="twitter" value={clubData.socialMediaLinks.twitter} onChange={handleSocialMediaChange} />
              </FormControl>
            </SimpleGrid>
            
            <FormControl>
              <FormLabel>Club Images</FormLabel>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                display="none"
                id="image-upload"
              />
              <Button
                as="label"
                htmlFor="image-upload"
                cursor="pointer"
                colorScheme="blue"
                mb={4}
              >
                Select Images
              </Button>
              
              {uploadProgress > 0 && (
                <Progress
                  value={uploadProgress}
                  size="sm"
                  colorScheme="blue"
                  mb={4}
                />
              )}
              
              {selectedImages.length > 0 && (
                <Box mt={4}>
                  <Text mb={2}>Selected Images:</Text>
                  <ImagePreviews />
                </Box>
              )}
            </FormControl>
            
            <Button colorScheme="orange" onClick={handleSave}>
              Save Changes
            </Button>
          </VStack>
        </Box>
      </Flex>
    </Box>
  ) : (
    <SplashScreen />
  );
};

export default ProfilePage;