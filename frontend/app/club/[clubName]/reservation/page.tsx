"use client"

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Button,
  useToast,
  useColorModeValue,
  SimpleGrid,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Flex,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { CalendarIcon, Music, Users, DollarSign, Clock, MapPin } from 'lucide-react';
import { FaCocktail } from 'react-icons/fa';
import { fetchClubByName, postReservation, switchUsername2Id } from '@/app/lib/backendAPI';
import { jwtDecode } from 'jwt-decode';
import { usePathname, useRouter } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@chakra-ui/react';
import ChakraDatePicker from '@/app/ui/datepicker';

interface ErrorsType {
  date: string;
  startTime: string;
  endTime: string;
  numOfGuests: string;
}

function ErrorFallback({error}: {error: Error}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

const ReservationPage = () => {
  const [reservation, setReservation] = useState({
    user: '',
    club: '',
    event: '',
    tableNumber: '',
    date: '',
    startTime: '',
    endTime: '',
    numOfGuests: 10,
    status: 'pending',
    specialRequests: '',
    minPrice: 20
  });
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isReservationComplete, setIsReservationComplete] = useState(false);
  const [isMobile] = useMediaQuery("(max-width: 48em)");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<ErrorsType>({date:"", startTime: "", endTime: "", numOfGuests:""});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const pathname = usePathname();
  const clubName = pathname?.split('/')[2] || '';
  const [clubDisplayName, setClubDisplayName] = useState(clubName);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (token) {
          const decodedToken = jwtDecode<{ username: string }>(token);
          const user = await switchUsername2Id(decodedToken.username);
          setReservation(prev => ({ ...prev, user }));
        }
        if (clubName) {
          const club = await fetchClubByName(clubName);
          setClubDisplayName(club.displayName)
          setReservation(prev => ({ ...prev, club: club._id }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clubName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReservation(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (name: string, value: string) => {
    setReservation(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: ErrorsType = {date:"", startTime: "", endTime: "", numOfGuests:""};
    if (!reservation.date) newErrors.date = 'Date is required';
    if (!reservation.startTime) newErrors.startTime = 'Start time is required';
    if (!reservation.endTime) newErrors.endTime = 'End time is required';
    if (reservation.numOfGuests < 1) newErrors.numOfGuests = 'Number of guests must be at least 1';
    setErrors(newErrors);
    return Object.keys(newErrors).every(key => newErrors[key as keyof ErrorsType] === "");
  };

  const handleSubmit = () => {
    console.log(reservation);
    if (validateForm()) {
      setIsConfirmationVisible(true);
    }
  };

  const confirmReservation = async () => {
    try {
      const res = await postReservation(reservation);
      console.log(res);
      setIsConfirmationVisible(false);
      setIsReservationComplete(true);
      toast({
        title: 'Reservation Confirmed',
        description: "We've received your reservation request.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting reservation:', error);
      toast({
        title: 'Reservation Failed',
        description: "There was an error submitting your reservation. Please try again.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetReservation = () => {
    setReservation({
        user: '',
        club: '',
        event: '',
        tableNumber: '',
        date: '',
        startTime: '',
        endTime: '',
        numOfGuests: 10,
        status: 'pending',
        specialRequests: '',
        minPrice: 20
    });
    setIsReservationComplete(false);
  };

  const PostConfirmationContent = () => (
    <Flex justifyContent="center" alignItems="center">
      <VStack width={'30vw'} spacing={6} align="stretch" bg={bgColor} p={6} borderRadius="lg" boxShadow="xl" border="1px" borderColor={borderColor}>
        <Heading size="lg">Reservation Confirmed!</Heading>
        <Text>Thank you for your reservation. We look forward to seeing you at {clubDisplayName}.</Text>
        <SimpleGrid columns={1} spacing={4}>
          <Button colorScheme="orange" onClick={resetReservation}>
            Make Another Reservation
          </Button>
          <Button onClick={() => router.push('/my-profile/bookings')}>
            View My Reservations
          </Button>
          <Button onClick={() => router.push('/')}>
            Return to Homepage
          </Button>
        </SimpleGrid>
      </VStack>
    </Flex>
  );

  const ConfirmationContent = () => (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Confirm Your Reservation</Heading>
      <SimpleGrid columns={2} spacing={4}>
        <Text><strong>Date:</strong> {reservation.date}</Text>
        <Text><strong>Start Time:</strong> {reservation.startTime}</Text>
        <Text><strong>End Time:</strong> {reservation.endTime}</Text>
        <Text><strong>Number of Guests:</strong> {reservation.numOfGuests}</Text>
        {reservation.tableNumber && <Text><strong>Table Number:</strong> {reservation.tableNumber}</Text>}
      </SimpleGrid>
      {reservation.specialRequests && (
        <Text>
          <strong>Special Requests:</strong><br />
          {reservation.specialRequests}
        </Text>
      )}
      <HStack justifyContent="flex-end" spacing={4}>
        <Button onClick={() => setIsConfirmationVisible(false)}>
          Modify
        </Button>
        <Button colorScheme="orange" onClick={confirmReservation}>
          Confirm Reservation
        </Button>
      </HStack>
    </VStack>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Container maxW="6xl" py={10}>
        {isReservationComplete ? <PostConfirmationContent /> : (
        <>
        <VStack spacing={8} align="stretch">
          <Box position="relative" height="300px" borderRadius="lg" overflow="hidden" boxShadow="xl">
            <Image
              src="/Designer.jpeg"
              alt="Club atmosphere"
              objectFit="cover"
              w="100%"
              h="100%"
            />
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="rgba(0,0,0,0.6)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {clubDisplayName && (
                <Heading as="h1" size="2xl" color="white" textAlign="center">
                  Reserve Your Night at {clubDisplayName}
                </Heading>
              )}
            </Box>
          </Box>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
            <Box>
              <VStack spacing={6} align="stretch" bg={bgColor} p={6} borderRadius="lg" boxShadow="xl" border="1px" borderColor={borderColor}>
                <Heading as="h2" size="lg">Make Your Reservation</Heading>
                <FormControl isRequired isInvalid={errors.date !== ""}>
                  <FormLabel>Date</FormLabel>
                  <ChakraDatePicker
                    value={reservation.date}
                    onChange={handleInputChange}
                    isRequired={true}
                    isInvalid={errors.date !== ""}
                    errorMsg={errors.date}
                    label="Date"
                  />
                </FormControl>
                
                <FormControl isRequired isInvalid={errors.startTime !== ""}>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    name="startTime"
                    type="time"
                    value={reservation.startTime}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl isRequired isInvalid={errors.endTime !== ""}>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    name="endTime"
                    type="time"
                    value={reservation.endTime}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Table Number (Optional)</FormLabel>
                  <Input
                    name="tableNumber"
                    value={reservation.tableNumber}
                    onChange={handleInputChange}
                    placeholder="Enter table number if known"
                  />
                  {/* TODO: Integrate seatingLayout component here */}
                </FormControl>
                
                <FormControl isRequired isInvalid={errors.numOfGuests !== ""}>
                  <FormLabel>Approximate Number of Guests</FormLabel>
                  <NumberInput
                    min={1}
                    max={20}
                    value={reservation.numOfGuests}
                    onChange={(value) => handleNumberInputChange('numOfGuests', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Special Requests</FormLabel>
                  <Textarea
                    name="specialRequests"
                    value={reservation.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Any special requests or requirements?"
                  />
                </FormControl>
                
                <Button colorScheme="orange" size="lg" onClick={handleSubmit}>
                  Reserve Now
                </Button>
              </VStack>
            </Box>
            
            <VStack spacing={6} align="stretch">
            <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="xl" border="1px" borderColor={borderColor}>
              <Heading as="h3" size="md" mb={4}>
                Club Highlights
              </Heading>
              <SimpleGrid columns={2} spacing={4}>
                <HStack>
                  <Icon as={Music} color="orange.500" />
                  <Text>World-class DJs</Text>
                </HStack>
                <HStack>
                  <Icon as={FaCocktail} color="orange.500" />
                  <Text>Signature Cocktails</Text>
                </HStack>
                <HStack>
                  <Icon as={Users} color="orange.500" />
                  <Text>VIP Experiences</Text>
                </HStack>
                <HStack>
                  <Icon as={DollarSign} color="orange.500" />
                  <Text>Bottle Service</Text>
                </HStack>
              </SimpleGrid>
            </Box>
            
            <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="xl" border="1px" borderColor={borderColor}>
              <Heading as="h3" size="md" mb={4}>
                Club Policies
              </Heading>
              <Accordion allowMultiple>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Age Requirement
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    All guests must be 21 years or older with valid ID.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Dress Code
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    Smart casual attire required. No sportswear or beachwear allowed.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Cancellation Policy
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    Free cancellation up to 24 hours before the event. Late cancellations may incur a fee.
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
            
            <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="xl" border="1px" borderColor={borderColor}>
              <Heading as="h3" size="md" mb={4}>
                Upcoming Events
              </Heading>
              <VStack align="start" spacing={3}>
                <HStack>
                  <CalendarIcon />
                  <Text>Fri, Oct 20 - Ladies Night: Free entry for ladies before 11 PM</Text>
                </HStack>
                <HStack>
                  <CalendarIcon />
                  <Text>Sat, Oct 21 - DJ Spinner Live: International guest DJ performance</Text>
                </HStack>
                <HStack>
                  <CalendarIcon />
                  <Text>Thu, Oct 26 - Throwback Thursday: Best of 80s and 90s hits all night</Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
          </SimpleGrid>
          
          <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="xl" border="1px" borderColor={borderColor}>
          <Heading as="h3" size="md" mb={4}>
            Why Choose Club Awesome?
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <VStack>
              <Icon as={Music} w={10} h={10} color="orange.500" />
              <Text fontWeight="bold">Unbeatable Atmosphere</Text>
              <Text textAlign="center">Experience the perfect blend of music, lighting, and energy.</Text>
            </VStack>
            <VStack>
              <Icon as={FaCocktail} w={10} h={10} color="orange.500" />
              <Text fontWeight="bold">Premium Drinks</Text>
              <Text textAlign="center">Enjoy our extensive selection of top-shelf liquors and creative cocktails.</Text>
            </VStack>
            <VStack>
              <Icon as={Users} w={10} h={10} color="orange.500" />
              <Text fontWeight="bold">VIP Treatment</Text>
              <Text textAlign="center">Indulge in our exclusive VIP packages for a night of luxury.</Text>
            </VStack>
          </SimpleGrid>
        </Box>
          
          <Flex justifyContent="space-between" flexWrap="wrap">
            <HStack>
              <Icon as={Clock} color="gray.500" />
              <Text>Open Thursday to Saturday, 10 PM - 4 AM</Text>
            </HStack>
            <HStack>
              <Icon as={MapPin} color="gray.500" />
              <Text>123 Party Street, Nightlife City, NC 12345</Text>
            </HStack>
          </Flex>
        </VStack>

        {isMobile ? (
          <AnimatePresence>
            {isConfirmationVisible && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: bgColor,
                  borderTop: `1px solid ${borderColor}`,
                  boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  padding: '20px',
                }}
              >
                <ConfirmationContent />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <Modal isOpen={isConfirmationVisible} onClose={() => setIsConfirmationVisible(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Reservation Confirmation</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <ConfirmationContent />
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
        </>
        )}
      </Container>
    </ErrorBoundary>
  );
};

export default ReservationPage;