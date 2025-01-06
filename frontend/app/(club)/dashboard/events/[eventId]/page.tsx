// app/(club)/dashboard/events/[eventId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, Users, DollarSign, Edit, Download,
  Bell, Trash, CheckCircle, XCircle, MapPin, 
  AlertCircle, Share2, MessageSquare,
  MoreVertical,
  ArrowLeft
} from 'lucide-react';
import ReservationDetailsModal from '@/app/ui/reservationInformationModal';
import { fetchClubReservations, fetchClubReservationsByDate, fetchEventById, fetchNormalUser, updateEvent, updateReservation } from '@/app/lib/backendAPI';
import EditEventDialog from '@/app/ui/editEventDialog';

// Types
interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  price: number;
  availableTickets: number;
  eventType: string;
  minAge: number;
}

interface Reservation {
  _id: string;
  club: string;
  user: string;
  event: string;
  date: string;
  startTime: string;
  numOfGuests: number;
  status: 'pending' | 'approved' | 'rejected' | 'past';
  specialRequests?: string;
  minPrice: number;
  customerName?: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
  tableNumber: string;
}

const DetailCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
    <div className="bg-white/5 p-4 rounded-xl">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-secondary/10">
          <Icon className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-white font-medium">{value}</p>
        </div>
      </div>
    </div>
  );

export default function EventPage() {
  const router = useRouter();
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call

    const fetchAllData = async () => {
        const event = await fetchEventById(eventId as string);
        setEvent(event);
        const reservations = await fetchClubReservationsByDate(event.club, event.date)

        const updatedReservations = await Promise.all(reservations.map(async (res: any) => {
            const user = await fetchNormalUser(res.user);
            return {
                ...res,
                customerName: user.firstName + " " + user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                createdAt: res.createdAt || new Date().toISOString()
            };
        }));
        setReservations(updatedReservations);
    };

    fetchAllData();
  }, [eventId]);

  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      // TODO: Add your API call here
      console.log("Updated Event: ", updatedEvent)
      await updateEvent(updatedEvent);
      
      // Update local state
      setEvent(updatedEvent);
      
      // Close the dialog
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update event:', error);
      // Handle error appropriately
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: "pending" | "approved" | "rejected") => {
    console.log('Reservation ID:', reservationId);
    console.log('New Status:', newStatus);

    const reservation = reservations.find(r => r._id === reservationId);
    if (reservation) {
      await updateReservation({
        ...reservation,
        status: newStatus
      });
    }

    setReservations(reservations.map(res => res._id === reservationId ? { ...res, status: newStatus } : res));
  };

  const handleMessageCustomer = (reservation: Reservation) => {
    // TODO: Implement messaging functionality
    console.log('Messaging customer:', reservation.customerName);
  };

  const handleExportReservations = () => {
    // TODO: Implement export functionality
    console.log('Exporting reservations');
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8 py-8">

      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/events")}
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Events</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Event Details */}
        <div className="space-y-6">
          {/* Event Header */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">{event.name}</h1>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary">
                    {event.eventType}
                  </span>
                </div>
                <p className="text-gray-400">{event.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailCard
                icon={Calendar}
                label="Date"
                value={event.date}
              />
              <DetailCard
                icon={Clock}
                label="Start Time"
                value={new Date(event.startTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              />
              <DetailCard
                icon={Users}
                label="Available Tickets"
                value={event.availableTickets}
              />
              <DetailCard
                icon={DollarSign}
                label="Price"
                value={`$${event.price}`}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex items-center justify-center space-x-2 bg-secondary/10 text-secondary rounded-xl p-4 hover:bg-secondary/20"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="w-5 h-5" />
                <span>Edit Event</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-tertiary/10 text-tertiary rounded-xl p-4 hover:bg-tertiary/20">
                <Share2 className="w-5 h-5" />
                <span>Share Event</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-accent/10 text-accent rounded-xl p-4 hover:bg-accent/20">
                <MessageSquare className="w-5 h-5" />
                <span>Send Updates</span>
              </button>
              <button 
                onClick={handleExportReservations}
                className="flex items-center justify-center space-x-2 bg-white/5 text-white rounded-xl p-4 hover:bg-white/10"
              >
                <Download className="w-5 h-5" />
                <span>Export List</span>
              </button>
            </div>
          </div>

          {/* Event Statistics */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Event Statistics</h2>
            <div className="space-y-4">
              {/* Add statistics components here */}
            </div>
          </div>
        </div>

        {/* Right Column - Reservations */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Reservations</h2>
            <div className="flex items-center space-x-2 text-gray-400">
              <Users className="w-5 h-5" />
              <span>Total: {reservations.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-3 text-gray-400 font-medium">Customer</th>
                  <th className="pb-3 text-gray-400 font-medium">Guests</th>
                  <th className="pb-3 text-gray-400 font-medium">Status</th>
                  <th className="pb-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr 
                    key={reservation._id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="py-4">
                      <div>
                        <p className="text-white font-medium">{reservation.customerName}</p>
                        <p className="text-sm text-gray-400">{reservation.email}</p>
                      </div>
                    </td>
                    <td className="py-4 text-white">{reservation.numOfGuests}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${reservation.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          reservation.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'}`}
                      >
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        {reservation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(reservation._id, 'approved')}
                              className="p-2 hover:bg-green-500/10 rounded-lg"
                            >
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(reservation._id, 'rejected')}
                              className="p-2 hover:bg-red-500/10 rounded-lg"
                            >
                              <XCircle className="w-4 h-4 text-red-400" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setIsModalOpen(true);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reservation Details Modal */}
      <ReservationDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reservation={selectedReservation}
        onApprove={(id) => handleStatusChange(id, 'approved')}
        onReject={(id) => handleStatusChange(id, 'rejected')}
        onMessageCustomer={() => selectedReservation && handleMessageCustomer(selectedReservation)}
      />

      <EditEventDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        event={event}
        onUpdateEvent={handleUpdateEvent}
      />
    </div>
  );
}