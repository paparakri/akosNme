"use client"

import React, { useState, useEffect } from 'react';
import { XCircle, Eye, DollarSign, Users, Clock, Calendar, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getCurrentUser } from '@/app/lib/userStatus';
import { fetchUserReservations, switchUsername2Id } from '@/app/lib/backendAPI';

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

const statusColors: Record<ReservationStatus, {
  bg: string;
  text: string;
  border: string;
}> = {
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
    let result = [...reservations].filter(Boolean); // Filter out any null values

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
      } else {
        return b.minPrice - a.minPrice;
      }
    });

    setFilteredReservations(result);
  }, [reservations, searchTerm, statusFilter, sortBy]);

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

  // Calculate status counts safely
  const statusCounts = filteredReservations.reduce((acc, res) => {
    if (res && res.status) {
      acc[res.status] = (acc[res.status] || 0) + 1;
    }
    return acc;
  }, {} as Record<ReservationStatus, number>);

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black -z-10" />

      <div className="relative min-h-screen pt-24 pb-12 text-white">
        <div className="max-w-7xl mx-auto px-4">
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
                    {Object.entries(statusCounts).map(([status, count]) => (
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
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'All' | ReservationStatus)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
                  >
                    <option value="All">All Statuses</option>
                    {Object.keys(statusColors).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'price')}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="price">Sort by Price</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReservations.map((reservation) => (
              <motion.div
                key={reservation._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
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
                      {new Date(reservation.startTime).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="w-4 h-4 mr-2" />
                      {reservation.numOfGuests} guests
                    </div>
                    <div className="flex items-center text-gray-300">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Min. spend: ${reservation.minPrice}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => setSelectedReservation(reservation)}
                      className="flex-1 px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setReservationToDelete(reservation);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

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
                  onClick={() => {
                    if (reservationToDelete) {
                      // Handle deletion here
                      console.log(reservations)
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