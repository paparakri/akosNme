import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
} from '@chakra-ui/react';

const ReservationModal = ({ isOpen, onClose, clubName } : {isOpen : any, onClose : any, clubName : any}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const toast = useToast();

  const handleSubmit = (e : any) => {
    e.preventDefault();
    // Here you would typically send the reservation data to your backend
    console.log({ date, time, guests, specialRequests });
    
    // Show a success message
    toast({
      title: "Reservation submitted.",
      description: "We've received your reservation request.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    
    // Close the modal
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reserve a Table at {clubName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Time</FormLabel>
                <Select
                  placeholder="Select time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                  <option value="23:00">23:00</option>
                  <option value="00:00">00:00</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Number of Guests</FormLabel>
                <NumberInput min={1} max={20} value={guests} onChange={(value) => setGuests(Number(value))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Special Requests</FormLabel>
                <Input
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g., Birthday celebration, Near DJ booth"
                />
              </FormControl>
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Submit Reservation
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReservationModal;