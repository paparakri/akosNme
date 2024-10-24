"use client"

import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  NumberInput,
  NumberInputField,
  Select,
  useToast,
  useColorModeValue,
  InputGroup,
  InputLeftAddon,
  Stack,
  Card,
  CardHeader,
  CardBody,
  Heading,
  InputRightElement,
  FormHelperText
} from '@chakra-ui/react';
import { CalendarIcon, TimeIcon } from '@chakra-ui/icons';
import { addEvent } from '@/app/lib/backendAPI';
import { getCurrentUser } from '@/app/lib/userStatus';
import ChakraDatePicker from '@/app/ui/datepicker';

const AddEvent = ({setCreatingEvent}: {setCreatingEvent: () => void}) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [eventData, setEventData] = useState({
    _id: '',
    name: '',
    description: '',
    date: '',
    startTime: '',
    price: '',
    availableTickets: '',
    eventType: '',
    minAge: 21,
    serviceProviders: [],
    images: null as FileList | null // Update the type of images
  });

  const eventTypes = [
    'Concert',
    'Festival',
    'DJ Night',
    'Live Performance',
    'Theme Party',
    'Special Event'
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (name: string, value: string) => {
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEventData(prev => ({
        ...prev,
        images: e.target.files
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(eventData);
    
    try {
      // Create FormData for image upload
      const formData = new FormData();
      Object.keys(eventData).forEach(key => {
        if (key === 'images' && eventData.images) {
          Array.from(eventData.images).forEach((file, index) => {
            formData.append(`images`, file);
          });
        } else {
          formData.append(key, eventData[key] as string);
        }
      });

      // Add your API call here
      const currentId = await getCurrentUser();
      const res = await addEvent(currentId._id, eventData);
      console.log(res);

      toast({
        title: 'Event Created',
        description: 'Your event has been successfully created.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setCreatingEvent();

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Card bg={bgColor} boxShadow="xl" border="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="lg">Create New Event</Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Event Name</FormLabel>
                  <Input
                    name="name"
                    value={eventData.name}
                    onChange={handleInputChange}
                    placeholder="Enter event name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Event Type</FormLabel>
                  <Select
                    name="eventType"
                    value={eventData.eventType}
                    onChange={handleInputChange}
                    placeholder="Select event type"
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your event"
                  rows={4}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>

            <Box position="relative" style={{ zIndex: 1 }}>
            <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <InputGroup>
                    <InputLeftAddon children={<CalendarIcon />} />
                    <ChakraDatePicker
                    value={eventData.date}
                    onChange={handleInputChange}
                    isRequired={true}
                    label="Date"
                    />
                </InputGroup>
            </FormControl>
            </Box>

                <FormControl isRequired>
                  <FormLabel>Start Time</FormLabel>
                  <InputGroup>
                    <InputLeftAddon children={<TimeIcon />} />
                    <Input
                      name="startTime"
                      type="time"
                      value={eventData.startTime}
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Ticket Price</FormLabel>
                  <InputGroup>
                    <InputLeftAddon children="$" />
                    <NumberInput
                      min={0}
                      value={eventData.price}
                      onChange={(value) => handleNumberInputChange('price', value)}
                    >
                      <NumberInputField
                        name="price"
                        placeholder="0.00"
                      />
                    </NumberInput>
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Available Tickets</FormLabel>
                  <NumberInput
                    min={1}
                    value={eventData.availableTickets}
                    onChange={(value) => handleNumberInputChange('availableTickets', value)}
                  >
                    <NumberInputField
                      name="availableTickets"
                      placeholder="Enter number of tickets"
                    />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel>Minimum Age</FormLabel>
                <NumberInput
                  min={18}
                  max={99}
                  value={eventData.minAge}
                  onChange={(value) => handleNumberInputChange('minAge', value)}
                >
                  <NumberInputField
                    name="minAge"
                    placeholder="Enter minimum age requirement"
                  />
                </NumberInput>
                <FormHelperText>Minimum age requirement for attendees</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Event Images</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  p={1}
                />
                <FormHelperText>Upload one or more images for your event</FormHelperText>
              </FormControl>

              <Stack direction="row" spacing={4} justify="flex-end">
                <Button
                  onClick={() => setCreatingEvent()}
                  colorScheme='red'
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEventData({
                    _id: '',
                    name: '',
                    description: '',
                    date: '',
                    startTime: '',
                    price: '',
                    availableTickets: '',
                    eventType: '',
                    minAge: 21,
                    serviceProviders: [],
                    images: null
                  })}
                >
                  Clear Form
                </Button>
                <Button
                  colorScheme="orange"
                  type="submit"
                >
                  Create Event
                </Button>
              </Stack>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default AddEvent;
