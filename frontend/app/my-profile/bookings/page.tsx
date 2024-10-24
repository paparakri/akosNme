"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Select,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import { ChevronLeftIcon, SearchIcon, CalendarIcon, ClockIcon, UsersIcon, DollarSignIcon } from 'lucide-react';
import { fetchUserReservations, switchUsername2Id, deleteReservation } from '@/app/lib/backendAPI';
import { getCurrentUser } from '@/app/lib/userStatus';

// Mock data for demonstration purposes
const mockReservations = [
  {
    _id: 1,
    user: "John Doe",
    club: "Nightclub XYZ",
    event: "Summer Bash",
    table: "VIP-1",
    date: "2024-06-15",
    startTime: "22:00",
    endTime: "02:00",
    numOfGuests: 4,
    status: "Accepted",
    specialRequests: "Birthday celebration",
    minPrice: 500
  },
  // ... add more mock reservations as needed
];

const statusColors = {
  Pending: 'yellow',
  Accepted: 'green',
  Declined: 'red',
  Cancelled: 'gray'
};

const formatDateString = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

const formatTimeString = (timeString: string) => {
  const dateTime = new Date(timeString);
  const hours = String(dateTime.getHours()).padStart(2, '0');
  const minutes = String(dateTime.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const ReservationDetails = ({ reservation, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reservation Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={4}>
            <Text><strong>Club:</strong> {reservation.club}</Text>
            <Text><strong>Event:</strong> {reservation.event || 'N/A'}</Text>
            <Text><strong>Table:</strong> {reservation.table || 'N/A'}</Text>
            <Text><strong>Date:</strong> {reservation.date}</Text>
            <Text><strong>Time:</strong> {formatTimeString(reservation.startTime)} - {formatTimeString(reservation.endTime)}</Text>
            <Text><strong>Guests:</strong> {reservation.numOfGuests}</Text>
            <Text><strong>Status:</strong> <Badge colorScheme={statusColors[reservation.status as keyof typeof statusColors]}>{reservation.status}</Badge></Text>
            <Text><strong>Special Requests:</strong> {reservation.specialRequests || 'None'}</Text>
            <Text><strong>Minimum Spend:</strong> ${reservation.minPrice}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const MyBookingsPage = () => {
  const [reservations, setReservations] = useState(mockReservations);
  const [filteredReservations, setFilteredReservations] = useState(mockReservations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchReservations = async () => {
      const currUser = await getCurrentUser();
      const userId = await switchUsername2Id(currUser.username);
      const fetchedReservations = await fetchUserReservations(userId);
      setReservations(fetchedReservations);
    }
    fetchReservations();
  }, []);

  useEffect(() => {
    let result = reservations;

    if (searchTerm) {
      result = result.filter(reservation => 
        reservation.club.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reservation.event && reservation.event.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(reservation => reservation.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'price') {
        return b.minPrice - a.minPrice;
      }
      return 0;
    });

    setFilteredReservations(result);
  }, [reservations, searchTerm, statusFilter, sortBy]);

  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation);
    onOpen();
  };

  const handleCancelReservation = (reservation) => {
    setReservationToDelete(reservation);
    onConfirmOpen();
  };

  const confirmDeleteReservation = async () => {
    if (reservationToDelete) {
      await deleteReservation(reservationToDelete._id); // Assuming reservation has an id field
      toast({
        title: "Reservation canceled.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setReservations((prev) => prev.filter(res => res._id !== reservationToDelete._id));
      onConfirmClose();
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} p={8} m={8} borderRadius={50}>
      <Flex direction="column" maxW="container.xl" mx="auto">
        <Flex align="center" mb={8}>
          <Heading size="lg" ml={2}>My Bookings</Heading>
        </Flex>

        <Stack direction={["column", "row"]} spacing={4} mb={8}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search by club or event"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
          </Select>
        </Stack>

        <Box overflowX="auto">
          <Table variant="simple" borderWidth={1} borderColor={borderColor}>
            <Thead>
              <Tr>
                <Th>Club</Th>
                <Th>Event</Th>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Guests</Th>
                <Th>Status</Th>
                <Th>Min. Spend</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredReservations.map((reservation) => (
                <Tr key={reservation._id} onClick={() => handleReservationClick(reservation)} _hover={{ bg: 'gray.50', cursor: 'pointer' }}>
                  <Td>{reservation.club}</Td>
                  <Td>{reservation.event || 'N/A'}</Td>
                  <Td>
                    <Flex align="center">
                      <CalendarIcon size={16} style={{ marginRight: '8px' }} />
                      {reservation.date}
                    </Flex>
                  </Td>
                  <Td>
                    <Flex align="center">
                      <ClockIcon size={16} style={{ marginRight: '8px' }} />
                      {formatTimeString(reservation.startTime)} - {formatTimeString(reservation.endTime)}
                    </Flex>
                  </Td>
                  <Td>
                    <Flex align="center">
                      <UsersIcon size={16} style={{ marginRight: '8px' }} />
                      {reservation.numOfGuests}
                    </Flex>
                  </Td>
                  <Td>
                    <Badge colorScheme={statusColors[reservation.status as keyof typeof statusColors]}>
                      {reservation.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex align="center">
                      <DollarSignIcon size={16} style={{ marginRight: '8px' }} />
                      {reservation.minPrice}
                    </Flex>
                  </Td>
                  <Td>
                    <Button size="sm" colorScheme="blue" onClick={(e) => {
                      e.stopPropagation();
                      handleReservationClick(reservation);
                    }}>
                      View Details
                    </Button>
                    <Button size="sm" colorScheme="red" ml={2} onClick={(e) => {
                      e.stopPropagation();
                      handleCancelReservation(reservation);
                    }}>Cancel</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {selectedReservation && (
          <ReservationDetails
            reservation={selectedReservation}
            isOpen={isOpen}
            onClose={onClose}
          />
        )}

        {/* Confirmation Modal for Deleting Reservation */}
        <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Cancellation</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Are you sure you want to cancel this reservation?</Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" onClick={confirmDeleteReservation}>
                Yes, Cancel
              </Button>
              <Button colorScheme="blue" ml={3} onClick={onConfirmClose}>
                No, Go Back
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
    </Box>
  );
};

export default MyBookingsPage;
