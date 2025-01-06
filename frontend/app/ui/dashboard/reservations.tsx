'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Search,
  Users,
  Clock,
  DollarSign,
  Filter,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  List,
  CalendarDays,
  GanttChartSquare
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { getCurrentUser } from '@/app/lib/userStatus';
import { fetchClubReservations, fetchNormalUser, updateReservation } from '@/app/lib/backendAPI';
import { CustomCalendar } from '../customCalendar';
import { useToast } from '@chakra-ui/react';
import ReservationDetailsModal from '../reservationInformationModal';

// Mock data for demonstration
const mockReservations = [
  {
    _id: '1',
    id: '1',
    customerName: 'John Doe',
    date: '2024-11-15',
    startTime: '21:00',
    endTime: '02:00',
    numOfGuests: 4,
    tableNumber: 'VIP-1',
    status: 'approved' as ('pending' | 'approved' | 'rejected' | 'past'),
    specialRequests: 'Birthday celebration',
    minPrice: 200,
    createdAt: '2024-11-10',
    club:"",
    user:"",
    event:""
  },
  // Add more mock reservations as needed
];

const mockChartData = [
  { date: 'Mon', reservations: 4, revenue: 800 },
  { date: 'Tue', reservations: 3, revenue: 600 },
  { date: 'Wed', reservations: 6, revenue: 1200 },
  { date: 'Thu', reservations: 8, revenue: 1600 },
  { date: 'Fri', reservations: 12, revenue: 2400 },
  { date: 'Sat', reservations: 15, revenue: 3000 },
  { date: 'Sun', reservations: 10, revenue: 2000 }
];

// First, let's define the Reservation interface
interface Reservation {
  _id: string;
  id: string;
  customerName: string;
  date: string;
  startTime: string;
  endTime: string;
  numOfGuests: number;
  tableNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'past';
  specialRequests: string;
  minPrice: number;
  createdAt: string;
  phoneNumber?: string;
  email?: string;
  club: string;
  user: string;
  event: string;
}

interface ActionDetails {
  reservationId: string;
  newStatus: string;
}

const ReservationManagement = () => {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [selectedView, setSelectedView] = useState('pending');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionDetails, setActionDetails] = useState<ActionDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  
  const handleOpenModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  const handleMessageCustomer = () => {
    // Implement customer messaging logic
  };

  const toast = useToast();

  const fetchCurrentUser = async () => {
    const club = await getCurrentUser();
    const rawReservations = await fetchClubReservations(club._id);
    const reservationsWithCustomerName = await Promise.all(
      rawReservations.reverse().map(async (reservation: any) => {
        const user = await fetchNormalUser(reservation.user);
        return {
          ...reservation,
          customerName: user?.firstName + " " + user?.lastName || 'Unknown User',
          phoneNumber: user?.phoneNumber,
          email: user?.email
        };
      })
    );
    
    console.log("Reservations with customer name: ", reservationsWithCustomerName);
    setReservations(reservationsWithCustomerName);
  };

  const handleReservationUpdate = async (event: MessageEvent) => {
    try {
      console.log("Event data: ", event.data);
      fetchCurrentUser();
      const data = JSON.parse(event.data);
      if (data.type === 'reservation_created' || data.type === 'reservation_updated' || data.type === 'reservation_deleted') {
        const club = await getCurrentUser();
      }
    } catch (error) {
      console.error('Error handling SSE message:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const initializeSSE = useCallback(async () => {
    const club = await getCurrentUser();
    if (club?._id) {
      const eventSource = new EventSource(
        `http://127.0.0.1:3500/club/${club._id}/reservations/stream`
      );
      
      eventSource.onmessage = handleReservationUpdate;
      
      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        
        // Add more detailed error logging
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('Connection was closed');
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          console.log('Attempting to reconnect...');
        }
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => initializeSSE(), 5000);
      };
  
      return () => {
        eventSource.close();
      };
    }
  }, []);

  useEffect(() => {
    const cleanup = initializeSSE();
    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [initializeSSE]);


  const handleStatusChange = async (reservationId: string, newStatus: string) => {

    console.log('Reservation ID:', reservationId);
    console.log('New Status:', newStatus);

    setActionDetails({ reservationId, newStatus });
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    // API call would go here

    const reservation = reservations.find(r => r._id === actionDetails?.reservationId);
    if (reservation) {
      await updateReservation({
        ...reservation,
        status: actionDetails?.newStatus
      });
    }

    setShowConfirmDialog(false);
    setActionDetails(null);
  };

  interface ViewOptionProps {
    icon: React.ElementType;
    label: string;
    isSelected: boolean;
    onClick: () => void;
  }

  const ViewOption: React.FC<ViewOptionProps> = ({ icon: Icon, label, isSelected, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center space-x-3 rounded-xl p-4 transition-all ${
        isSelected
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
          : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </motion.button>
  );
  
  interface ReservationCardProps {
    reservation: Reservation;
    onStatusChange: (id: string, status: string) => void;
  }

  const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onStatusChange }) => (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => handleOpenModal(reservation)}
      className="relative overflow-hidden rounded-xl bg-gray-900/50 p-6 backdrop-blur-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-500/10" />
      
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">{reservation.customerName}</h3>
          <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400">
            Pending
          </span>
        </div>
  
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{reservation.date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{reservation.numOfGuests} guests</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>${reservation.minPrice} minimum spend</span>
          </div>
        </div>
  
        {reservation.specialRequests && (
          <div className="rounded-lg bg-purple-500/10 p-3 text-sm text-purple-300">
            <p className="font-medium">Special Requests:</p>
            <p>{reservation.specialRequests}</p>
          </div>
        )}
  
        <div className="flex space-x-2 pt-2">
          <button
            className="flex-1 rounded-lg bg-green-500/20 py-2 text-sm font-medium text-green-400 hover:bg-green-500/30"
          >
            <div onClick={(e) => { e.stopPropagation(); onStatusChange(reservation._id, 'approved'); }}>
              Approve
            </div>
          </button>
          <button
            className="flex-1 rounded-lg bg-red-500/20 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30"
          >
            <div onClick={(e) => { e.stopPropagation(); onStatusChange(reservation._id, 'rejected'); }}>
              Reject
            </div>
          </button>
        </div>
      </div>
    </motion.button>
  );
  
  interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    details: ActionDetails | null;
    onConfirm: () => void;
  }

  const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onClose, details, onConfirm }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-gray-900 shadow-xl"
          >
            <div className="p-6">
              <div className="mb-4 flex items-center space-x-3">
                <div className="rounded-full bg-orange-500/20 p-2">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Confirm Action
                </h3>
              </div>
              
              <p className="mb-6 text-gray-300">
                Are you sure you want to {details?.newStatus} this reservation?
                This action cannot be undone.
              </p>
  
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className={`rounded-lg px-4 py-2 text-white ${
                    details?.newStatus === 'approved'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderPendingView = () => {
    const parseDate = (dateStr: string): Date => {
      const [day, month, year] = dateStr.split('-');
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const filteredReservations = reservations.filter(reservation =>
      reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.tableNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const futureReservations = filteredReservations
      .filter(reservation => parseDate(reservation.date) > todayDate)
      .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
    
    const pastReservations = filteredReservations
      .filter(reservation => parseDate(reservation.date) <= todayDate)
      .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
    
    return(
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {futureReservations.filter(reservation => reservation.status === 'pending')
            .map(reservation => (
              <ReservationCard
                key={reservation._id}
                reservation={reservation}
                onStatusChange={handleStatusChange}
              />
            ))}
        </div>
      </div>
    );
  };
  const renderCalendarView = () => {
    const reservationDates = Array.from(new Set(reservations.map(r => r.date)));
    console.log("All reservations:", reservations);
    console.log("Unique reservation dates:", reservationDates);
  
    return (
      <div className="grid gap-8 lg:grid-cols-[350px,1fr]">
        <CustomCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          reservationDates={reservationDates}
        />
       
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Reservations for {selectedDate.toLocaleDateString('en-GB').split('/').join('-')}
          </h3>
         
          <div className="divide-y divide-gray-800 rounded-xl bg-gray-900/50 backdrop-blur-lg">
            {reservations
              .filter(r => r.date === selectedDate.toLocaleDateString('en-GB').split('/').join('-'))
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map(reservation => {
                const today = new Date();
                if (new Date(reservation.date.split('-').reverse().join('-')) < today){
                  reservation.status = 'past';
                }
                return(
                  <div key={reservation._id} className="flex items-center justify-between p-4" onClick={() => handleOpenModal(reservation)} style={{cursor: 'pointer'}}>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-white">
                        {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>
                        <div className="font-medium text-white">{reservation.customerName}</div>
                        <div className="text-sm text-gray-400">
                          {reservation.numOfGuests} guests • Table {reservation.tableNumber || `not specified`}
                        </div>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      reservation.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      reservation.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                );
              })}
              {!reservations.some(r => r.date === selectedDate.toLocaleDateString('en-GB').split('/').join('-')) && (
                <div className="p-4 text-center text-gray-400">
                  No reservations for this date
                </div>
              )}
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const parseDate = (dateStr: string): Date => {
      const [day, month, year] = dateStr.split('-');
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const filteredReservations = reservations.filter(reservation =>
      reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.tableNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const futureReservations = filteredReservations
      .filter(reservation => parseDate(reservation.date) > todayDate)
      .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
    
    console.log("Filtered Reservations: ", filteredReservations);

    const pastReservations = filteredReservations
      .filter(reservation => parseDate(reservation.date) <= todayDate)
      .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());

    console.log("Past Reservations: ", pastReservations);
  
    return (
      <div className="rounded-xl bg-gray-900/50 backdrop-blur-lg">
        <div className="flex items-center space-x-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reservations..."
              className="w-full rounded-lg bg-gray-800 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button className="flex items-center space-x-2 rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
  
        <table className="w-full">
          <thead className="border-y border-gray-800 text-left text-sm text-gray-400">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Time</th>
              <th className="p-4">Guests</th>
              <th className="p-4">Table</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {/* Future Reservations */}
            {futureReservations.map(reservation => (
              <tr key={reservation._id} className="group hover:bg-gray-800/50">
                <td className="p-4 text-white">{reservation.customerName}</td>
                <td className="p-4 text-gray-400">{reservation.date}</td>
                <td className="p-4 text-gray-400">
                  {`${new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </td>
                <td className="p-4 text-gray-400">{reservation.numOfGuests}</td>
                <td className="p-4 text-gray-400">{reservation.tableNumber || 'Not specified'}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    reservation.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    reservation.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {reservation.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100">
                    {reservation.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(reservation._id, 'approved')}
                          className="rounded-full p-1 text-green-400 hover:bg-green-500/20"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(reservation._id, 'rejected')}
                          className="rounded-full p-1 text-red-400 hover:bg-red-500/20"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <motion.button
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-700"
                      onClick={() => handleOpenModal(reservation)}
                      whileTap={{ scale: 0.9 }}  
                    > 
                      <MoreVertical className="h-4 w-4" />
                    </motion.button>
                  </div>
                </td>
              </tr>
            ))}
  
            {/* Divider for Past Reservations */}
            {pastReservations.length > 0 && (
              <tr className="bg-gray-800/50">
                <td colSpan={7} className="p-2 text-center text-sm text-gray-400">
                  Past Reservations
                </td>
              </tr>
            )}
  
            {/* Past Reservations */}
            {pastReservations.map(reservation => (
              <tr key={reservation._id} className="group hover:bg-gray-800/50">
                <td className="p-4 text-white">{reservation.customerName}</td>
                <td className="p-4 text-gray-400">{reservation.date}</td>
                <td className="p-4 text-gray-400">
                  {`${new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </td>
                <td className="p-4 text-gray-400">{reservation.numOfGuests}</td>
                <td className="p-4 text-gray-400">{reservation.tableNumber || 'Not specified'}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {'past'}
                  </span> 
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100">
                    <motion.button
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-700" 
                      onClick={() => handleOpenModal({ ...reservation, status: "past" })}
                      whileTap={{ scale: 0.9 }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </motion.button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedView) {
      case 'pending':
        return renderPendingView();
      case 'calendar':
        return renderCalendarView();
      case 'list':
        return renderListView();
      default:
        return null;
    }
  };

  const handleApprove = (id: string) => {
    handleStatusChange(id, 'approved');
  };

  const handleReject = (id: string) => {
    handleStatusChange(id, 'rejected');
  };

  return (
    <div className="space-y-6 p-8">
      {/* View Switcher */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 pt-12">
        <ViewOption
          icon={AlertCircle}
          label="Pending Approvals"
          isSelected={selectedView === 'pending'}
          onClick={() => setSelectedView('pending')}
        />
        <ViewOption
          icon={CalendarDays}
          label="Calendar View"
          isSelected={selectedView === 'calendar'}
          onClick={() => setSelectedView('calendar')}
        />
        <ViewOption
          icon={List}
          label="List View"
          isSelected={selectedView === 'list'}
          onClick={() => setSelectedView('list')}
        />
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        details={actionDetails}
        onConfirm={confirmStatusChange}
      />

      <ReservationDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={selectedReservation}
        onApprove={handleApprove}
        onReject={handleReject}
        onMessageCustomer={handleMessageCustomer}
      />
    </div>
  );
};

export default ReservationManagement;