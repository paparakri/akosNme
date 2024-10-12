"use client"

import React, { useState } from 'react';
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
  Divider,
  HStack,
  Badge,
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

const ReservationPage = () => {
  const [reservation, setReservation] = useState({
    tableNumber: '',
    date: '',
    numOfGuests: 1,
    specialRequests: '',
  });
  const [errors, setErrors] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservation({ ...reservation, [name]: value });
  };

  const handleNumberInputChange = (name, value) => {
    setReservation({ ...reservation, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!reservation.date) newErrors.date = 'Date is required';
    if (reservation.numOfGuests < 1) newErrors.numOfGuests = 'Number of guests must be at least 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onOpen();
    }
  };

  const confirmReservation = () => {
    // TODO: Implement the API call to submit the reservation
    console.log('Reservation submitted:', reservation);
    onClose();
    toast({
      title: 'Reservation Confirmed',
      description: "We've received your reservation request.",
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="6xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box position="relative" height="300px" borderRadius="lg" overflow="hidden" boxShadow="xl">
          <Image
            src="/Designer.jpeg" // Replace with actual club image
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
            <Heading as="h1" size="2xl" color="white" textAlign="center">
              Reserve Your Night at Club Awesome
            </Heading>
          </Box>
        </Box>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Box>
            <VStack spacing={6} align="stretch" bg={bgColor} p={6} borderRadius="lg" boxShadow="xl" border="1px" borderColor={borderColor}>
              <Heading as="h2" size="lg">Make Your Reservation</Heading>
              <FormControl isRequired isInvalid={errors.date}>
                <FormLabel>Date</FormLabel>
                <Input
                  name="date"
                  type="date"
                  value={reservation.date}
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
              </FormControl>
              
              <FormControl isRequired isInvalid={errors.numOfGuests}>
                <FormLabel>Number of Guests</FormLabel>
                <NumberInput
                  min={1}
                  max={20} // TODO: Replace with actual club capacity
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Your Reservation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={3}>
              <Text><strong>Date:</strong> {reservation.date}</Text>
              <Text><strong>Number of Guests:</strong> {reservation.numOfGuests}</Text>
              {reservation.tableNumber && <Text><strong>Table Number:</strong> {reservation.tableNumber}</Text>}
              {reservation.specialRequests && (
                <Text>
                  <strong>Special Requests:</strong><br />
                  {reservation.specialRequests}
                </Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="orange" onClick={confirmReservation}>
              Confirm Reservation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ReservationPage;