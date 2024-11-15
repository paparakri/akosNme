"use client"

import React, { useState, useEffect } from 'react';
import {
  VStack,
  Text,
  Button,
  useColorModeValue,
  Badge,
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
import { XCircle, Eye, DollarSign, Users, Clock, Calendar, Search } from 'lucide-react';
import { fetchUserReservations, switchUsername2Id, deleteReservation } from '@/app/lib/backendAPI';
import { getCurrentUser } from '@/app/lib/userStatus';
import { AnimatePresence, motion } from 'framer-motion';

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

interface Reservation {
  _id: string;
  club: string;
  event?: string;
  table?: string;
  date: string;
  startTime: string;
  endTime: string;
  numOfGuests: number;
  status: ReservationStatus;
  specialRequests?: string;
  minPrice: number;
}

type ReservationStatus = 'Pending' | 'Accepted' | 'Declined' | 'Cancelled';
type StatusColors = {
  [key in ReservationStatus]: {
    bg: string;
    text: string;
    border: string;
  };
};

const statusColors: StatusColors = {
  Pending: { 
    bg: 'bg-yellow-400/10', 
    text: 'text-yellow-400', 
    border: 'border-yellow-400/20' 
  },
  Accepted: { 
    bg: 'bg-green-400/10', 
    text: 'text-green-400', 
    border: 'border-green-400/20' 
  },
  Declined: { 
    bg: 'bg-red-400/10', 
    text: 'text-red-400', 
    border: 'border-red-400/20' 
  },
  Cancelled: { 
    bg: 'bg-gray-400/10', 
    text: 'text-gray-400', 
    border: 'border-gray-400/20' 
  }
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

const ReservationDetails = ({ reservation, isOpen, onClose }:{reservation: Reservation, isOpen: boolean, onClose: () => void}) => {
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
            <Text><strong>Status:</strong> <Badge colorScheme={statusColors[reservation.status as keyof typeof statusColors].text}>{reservation.status}</Badge></Text>
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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReservationStatus>('All');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getStatusColors = (status: ReservationStatus) => {
    return statusColors[status] || statusColors.Pending; // Fallback to Pending if status not found
  };

  const handleDeleteReservation = async (reservationId: string) => {
    try {
      await deleteReservation(reservationId);
      setReservations(prev => prev.filter(r => r._id !== reservationId));
      setShowDeleteModal(false);
      setReservationToDelete(null);
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const currUser = await getCurrentUser();
        const userId = await switchUsername2Id(currUser.username);
        const fetchedReservations = await fetchUserReservations(userId);
        setReservations(fetchedReservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setIsLoading(false);
      }
    };
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

  const handleReservationClick = (reservation:Reservation) => {
    setSelectedReservation(reservation);
    onOpen();
  };

  const handleCancelReservation = (reservation: Reservation) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Fixed background */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black -z-10" />

      {/* Main content */}
      <div className="relative min-h-screen pt-24 pb-12 text-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl" />
              
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      My Bookings
                    </h1>
                    <p className="text-gray-400">Manage all your club reservations in one place</p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {/* Stats Cards */}
                    {Object.entries(
                      filteredReservations.reduce((acc, res) => {
                        const status = res.status as ReservationStatus;
                        return {
                          ...acc,
                          [status]: (acc[status] || 0) + 1
                        };
                      }, {} as Record<ReservationStatus, number>)
                    ).map(([status, count]) => (
                      <motion.div
                        key={status}
                        whileHover={{ scale: 1.05 }}
                        className={`px-4 py-2 rounded-full ${statusColors[status as ReservationStatus]?.bg} ${statusColors[status as ReservationStatus]?.border} border`}
                      >
                        <span className={statusColors[status as ReservationStatus]?.text}>
                          {status}: {count}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Filters Section */}
                <div className="mt-8 flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by club or event..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                               focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ReservationStatus)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                             focus:outline-none focus:border-purple-500 transition-all appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 1rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Declined">Declined</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "date" | "price")}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                             focus:outline-none focus:border-purple-500 transition-all appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 1rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="price">Sort by Price</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reservations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredReservations.map((reservation) => (
                <motion.div
                  key={reservation._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 
                           overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 
                              opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{reservation.club}</h3>
                        <p className="text-gray-400 text-sm">{reservation.event || 'Regular Booking'}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${statusColors[reservation.status]?.bg} ${statusColors[reservation.status]?.text}`}>
                        {reservation.status}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        {reservation.date}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-2" />
                        {`${new Date(reservation.startTime).toLocaleTimeString()}`}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="w-4 h-4 mr-2" />
                        {`${reservation.numOfGuests} guests`}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {`Min. spend: $${reservation.minPrice}`}
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <button
                        onClick={() => setSelectedReservation(reservation)}
                        className="flex-1 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg
                                 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setReservationToDelete(reservation);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg
                                 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedReservation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-white/10"
            >
              {/* Modal content */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10"
            >
              <h3 className="text-xl font-semibold mb-4">Cancel Reservation</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to cancel this reservation? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (reservationToDelete) {
                      await deleteReservation(reservationToDelete._id);
                      setReservations(prev => prev.filter(r => r._id !== reservationToDelete._id));
                      setShowDeleteModal(false);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  No, Keep It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookingsPage;
