import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  InputGroup,
  InputLeftAddon,
  Stack,
  Heading,
  FormHelperText,
  useColorModeValue
} from '@chakra-ui/react';
import { CalendarIcon, TimeIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { 
  Music, Users, Clock, DollarSign, Image as ImageIcon,
  Calendar, AlertCircle, PartyPopper, FileText
} from 'lucide-react';
import { addEvent } from '@/app/lib/backendAPI';
import { getCurrentUser } from '@/app/lib/userStatus';
import ChakraDatePicker from '@/app/ui/datepicker';

const eventTypes = [
  { value: 'Concert', icon: Music },
  { value: 'Festival', icon: PartyPopper },
  { value: 'DJ Night', icon: Music },
  { value: 'Live Performance', icon: Music },
  { value: 'Theme Party', icon: PartyPopper },
  { value: 'Special Event', icon: PartyPopper }
];

const AddEvent = ({setCreatingEvent}: {setCreatingEvent: () => void}) => {
  const toast = useToast();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
    images: null as FileList | null
  });

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

      // Create preview URLs
      const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => {
        // Revoke old URLs to prevent memory leaks
        prev.forEach(url => URL.revokeObjectURL(url));
        return urls;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      Object.keys(eventData).forEach(key => {
        if (key === 'images' && eventData.images) {
          Array.from(eventData.images).forEach(file => {
            formData.append('images', file);
          });
        } else {
          if (eventData[key as keyof typeof eventData] !== null) {
            formData.append(key, eventData[key as keyof typeof eventData] as string);
          }
        }
      });

      const currentId = await getCurrentUser();
      const res = await addEvent(currentId._id, eventData);

      toast({
        title: 'Success!',
        description: 'Your event has been created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
        icon: <PartyPopper className="h-5 w-5" />
      });

      setCreatingEvent();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-8 border-b border-white/10"
          >
            <Heading size="lg" className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Create New Event
            </Heading>
            <Text mt={2} className="text-gray-400">
              Fill in the details below to create your event
            </Text>
          </motion.div>

          {/* Progress indicator */}
          <div className="px-8 pt-6">
            <div className="relative">
              <div className="absolute top-2 w-full h-1 bg-gray-200 rounded">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="relative flex justify-between">
                {[1, 2, 3].map((step) => (
                  <motion.button
                    key={step}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step <= currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(step)}
                  >
                    {step}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel className="text-gray-300">
                        <FileText className="inline-block w-4 h-4 mr-2" />
                        Event Name
                      </FormLabel>
                      <Input
                        name="name"
                        value={eventData.name}
                        onChange={handleInputChange}
                        placeholder="Enter event name"
                        className="bg-white/5 border-white/10"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel className="text-gray-300">
                        <PartyPopper className="inline-block w-4 h-4 mr-2" />
                        Event Type
                      </FormLabel>
                      <Select
                        name="eventType"
                        value={eventData.eventType}
                        onChange={handleInputChange}
                        placeholder="Select event type"
                        className="bg-white/5 border-white/10"
                      >
                        {eventTypes.map(({ value, icon: Icon }) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel className="text-gray-300">
                      <FileText className="inline-block w-4 h-4 mr-2" />
                      Description
                    </FormLabel>
                    <Textarea
                      name="description"
                      value={eventData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your event"
                      rows={4}
                      className="bg-white/5 border-white/10"
                    />
                  </FormControl>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel className="text-gray-300">
                        <Calendar className="inline-block w-4 h-4 mr-2" />
                        Date
                      </FormLabel>
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

                    <FormControl isRequired>
                      <FormLabel className="text-gray-300">
                        <Clock className="inline-block w-4 h-4 mr-2" />
                        Start Time
                      </FormLabel>
                      <InputGroup>
                        <InputLeftAddon children={<TimeIcon />} />
                        <Input
                          name="startTime"
                          type="time"
                          value={eventData.startTime}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/10"
                        />
                      </InputGroup>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel className="text-gray-300">
                        <DollarSign className="inline-block w-4 h-4 mr-2" />
                        Ticket Price
                      </FormLabel>
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
                            className="bg-white/5 border-white/10"
                          />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel className="text-gray-300">
                        <Users className="inline-block w-4 h-4 mr-2" />
                        Available Tickets
                      </FormLabel>
                      <NumberInput
                        min={1}
                        value={eventData.availableTickets}
                        onChange={(value) => handleNumberInputChange('availableTickets', value)}
                      >
                        <NumberInputField
                          name="availableTickets"
                          placeholder="Enter number of tickets"
                          className="bg-white/5 border-white/10"
                        />
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <FormControl isRequired>
                    <FormLabel className="text-gray-300">
                      <AlertCircle className="inline-block w-4 h-4 mr-2" />
                      Minimum Age
                    </FormLabel>
                    <NumberInput
                      min={18}
                      max={99}
                      value={eventData.minAge}
                      onChange={(value) => handleNumberInputChange('minAge', value)}
                    >
                      <NumberInputField
                        name="minAge"
                        placeholder="Enter minimum age requirement"
                        className="bg-white/5 border-white/10"
                      />
                    </NumberInput>
                    <FormHelperText className="text-gray-400">
                      Minimum age requirement for attendees
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel className="text-gray-300">
                      <ImageIcon className="inline-block w-4 h-4 mr-2" />
                      Event Images
                    </FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      p={1}
                      className="bg-white/5 border-white/10"
                    />
                    <FormHelperText className="text-gray-400">
                      Upload one or more images for your event
                    </FormHelperText>

                    {previewUrls.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 grid grid-cols-3 gap-4"
                      >
                        {previewUrls.map((url, index) => (
                          <motion.div
                            key={url}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative aspect-square rounded-lg overflow-hidden"
                          >
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </FormControl>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation and Submit Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex justify-between items-center"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {currentStep > 1 && (
                  <Button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    Previous
                  </Button>
                )}
              </motion.div>

              <Stack direction="row" spacing={4}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setCreatingEvent()}
                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    Cancel
                  </Button>
                </motion.div>

                {currentStep < totalSteps ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    >
                      Continue
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    >
                      Create Event
                    </Button>
                  </motion.div>
                )}
              </Stack>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </Box>
  );
};

export default AddEvent;